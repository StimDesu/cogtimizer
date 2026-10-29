function yield() {
  return new Promise(r=>setTimeout(r,1));
}

// What can be optimized. Weights are relative: with build=1 and flaggy=1,
// +1% build rate is worth as much as +1% flaggy rate.
const SOLVER_GOALS = ["buildRate", "playerXp", "flaggy", "flagSpeed"];

class Solver {
  constructor(weights={}) {
    this.setWeights(weights);
  }

  setWeights(weights = {}) {
    this.weights = {};
    for (const goal of SOLVER_GOALS) {
      this.weights[goal] = Number(weights[goal]) || 0;
    }
  }

  getScoreSum(score) {
    let res = 0;
    for (const goal of SOLVER_GOALS) {
      const weight = this.weights[goal];
      if (!weight) continue;
      const base = this.base && this.base[goal];
      res += weight * (base > 0 ? score[goal] / base : score[goal]);
    }
    return res;
  }

  static _yield() {
    return new Promise(r=>setTimeout(r,1));
  }

  // Picks a random slot and cog and swaps them; returns the pair, or null if the swap isn't allowed.
  _randomSwap(state, allSlots) {
    const slotKey = allSlots[Math.floor(Math.random() * allSlots.length)];
    // Moving a cog to an empty space changes the list of cog keys, so we need to re-fetch this
    const allKeys = state.cogKeys;
    const cogKey = allKeys[Math.floor(Math.random() * allKeys.length)];
    if (slotKey == cogKey) return null;
    const slot = state.get(slotKey);
    const cog = state.get(cogKey);
    if (!slot || !cog || slot.fixed || cog.fixed || cog.position().location === "build") return null;
    state.move(slotKey, cogKey);
    return [slotKey, cogKey];
  }

  /**
   * solveTime: Number - Time in ms how long the solver should run
   */
  async solve(inventory, solveTime=1000) {
    this.base = inventory.score;
    console.log("Solving with goal:", this.weights);
    let lastYield = Date.now();
    const allSlots = inventory.availableSlotKeys;
    // Nothing to rearrange (no unlocked/empty slots or no movable cogs): return
    // the board unchanged instead of indexing empty arrays and crashing.
    if (allSlots.length === 0 || inventory.cogKeys.length === 0) {
      console.log("Nothing to optimize (no available slots or cogs)");
      g.best = inventory.clone();
      return g.best;
    }
    let best = inventory.clone();
    let bestScore = this.getScoreSum(best.score);
    const startTime = Date.now();
    let counter = 0;

    // Simulated annealing, restarted from the best board found so far.
    while(Date.now() - startTime < solveTime) {
      const state = best.clone();
      let currentScore = bestScore;
      let temperature = 0.05;
      for (let i = 0; i < 20000 && Date.now() - startTime < solveTime; i++) {
        if(Date.now() - lastYield > 100) {
          // Prevent UI from freezing with very high solve times
          await Solver._yield();
          lastYield = Date.now();
        }
        counter++;
        temperature *= 0.9995;
        const swap = this._randomSwap(state, allSlots);
        if (!swap) continue;
        const scoreSumUpdate = this.getScoreSum(state.score);
        if (scoreSumUpdate >= currentScore || Math.random() < Math.exp((scoreSumUpdate - currentScore) / temperature)) {
          currentScore = scoreSumUpdate;
          if (scoreSumUpdate > bestScore + 1e-12) {
            bestScore = scoreSumUpdate;
            best = state.clone();
          }
        } else {
          state.move(swap[0], swap[1]);
        }
      }
    }
    console.log(`Tried ${counter} switches, best score ${bestScore}`);
    if (g.best === null || this.getScoreSum(g.best.score) < bestScore) {
      g.best = best;
    } else {
      best = g.best;
    }
    this.removeUselesMoves(best);
    return best;
  }

  shuffle(inventory, n = 500) {
    const allSlots = inventory.availableSlotKeys;
    for (let i = 0; i < n; i++) {
      this._randomSwap(inventory, allSlots);
    }
  }

  // Moves every cog back to where it started if that doesn't lower the score
  // (this also drops swaps between cogs with identical stats).
  removeUselesMoves(inventory) {
    const goal = this.getScoreSum(inventory.score) - 1e-9;
    let changed = true;
    while (changed) {
      changed = false;
      const cogsToMove = Object.values(inventory.cogs)
        .filter((c) => c.key !== c.initialKey);
      for (const cog of cogsToMove) {
        const cog1Key = cog.key;
        const cog2Key = cog.initialKey;
        const other = inventory.get(cog2Key);
        if (!other || other.fixed) continue;
        inventory.move(cog1Key, cog2Key);
        if (this.getScoreSum(inventory.score) >= goal) {
          console.log(`Removed useless move ${cog1Key} to ${cog2Key}`);
          changed = true;
          continue;
        }
        inventory.move(cog1Key, cog2Key);
      }
    }
  }

  // Same final board, fewer in-game drags. Cogs with identical stats are
  // interchangeable and any spare slot is as good as another, so pick which copy
  // goes where to keep cogs in place and to turn moves into two-way swaps.
  // Returns `best` unchanged if the new layout would score differently.
  planMoves(start, best) {
    const statKey = (c) => JSON.stringify([c.buildRate, c.isPlayer, c.baseExp, c.expGain, c.flaggy, c.expBonus,
      c.buildRadiusBoost, c.expRadiusBoost, c.flaggyRadiusBoost, c.boostRadius, c.flagBoost, c.fixed]);
    const boardKeys = start.availableSlotKeys;
    const startAt = (k) => start.cogs[k];
    const want = {}; // board key -> stat key of the cog that must end there (undefined = empty)
    for (const k of boardKeys) if (best.cogs[k]) want[k] = statKey(best.cogs[k]);

    const target = new Map(); // start key -> final key
    const free = new Map();   // stat key -> start keys of not yet placed copies
    for (const [k, cog] of Object.entries(start.cogs)) {
      const key = Number(k);
      if (key >= 96 && key < SPARE_START) continue; // cog maker slots never move
      if (key < BOARD_SIZE && want[key] === statKey(cog)) { target.set(key, key); continue; }
      const sk = statKey(cog);
      if (!free.has(sk)) free.set(sk, []);
      free.get(sk).push(key);
    }

    // Fill the board. A copy that is on the board already has to move anyway,
    // so it is preferred over one from the spare inventory; best of all is a copy
    // sitting where the cog it replaces is wanted (one swap places both).
    const placed = new Set(target.values());
    for (const k of boardKeys.filter(k => want[k] !== undefined && !placed.has(k))) {
      const pool = free.get(want[k]) || [];
      if (!pool.length) return best;
      const here = startAt(k);
      const rank = (q) => {
        if (q < BOARD_SIZE && here && want[q] === statKey(here) && !placed.has(q)) return 0;
        return q < BOARD_SIZE ? 1 : 2;
      };
      pool.sort((a, b) => rank(a) - rank(b));
      const q = pool.shift();
      target.set(q, k);
      placed.add(k);
    }

    // Everything else stays in the spare inventory; cogs leaving the board take
    // the spare slot vacated by the cog that replaces them when possible.
    const vacated = [];
    for (const [from, to] of target) if (from >= SPARE_START && to < BOARD_SIZE) vacated.push(from);
    for (const keys of free.values()) {
      for (const q of keys) {
        if (q >= SPARE_START) { target.set(q, q); continue; }
        let i = vacated.findIndex(s => target.get(s) === q);
        if (i < 0) i = 0;
        if (!vacated.length) return best;
        target.set(q, vacated.splice(i, 1)[0]);
      }
    }

    const res = start.clone();
    res.cogs = {};
    for (const [k, cog] of Object.entries(start.cogs)) {
      const to = target.has(Number(k)) ? target.get(Number(k)) : Number(k);
      if (res.cogs[to]) return best;
      const moved = new Cog(cog);
      moved.key = to;
      res.cogs[to] = moved;
    }
    res._score = null;
    const a = best.score, b = res.score;
    for (const f of ["buildRate", "playerXp", "flaggy", "flagSpeed"]) {
      if (Math.abs(a[f] - b[f]) > 1e-6 * Math.max(1, Math.abs(a[f]))) return best;
    }
    return Solver.swapCount(res) < Solver.swapCount(best) ? res : best;
  }

  // In-game drags needed to reach this layout: every moved cog is one drag,
  // except that a closed cycle of k cogs takes k - 1 swaps.
  static swapCount(inventory) {
    const next = new Map(); // start key -> final key
    for (const cog of Object.values(inventory.cogs)) {
      if (cog.key !== cog.initialKey) next.set(cog.initialKey, cog.key);
    }
    let swaps = next.size;
    const seen = new Set();
    for (const startKey of next.keys()) {
      if (seen.has(startKey)) continue;
      let k = startKey;
      while (next.has(k) && !seen.has(k)) {
        seen.add(k);
        k = next.get(k);
      }
      if (k === startKey) swaps--;
    }
    return swaps;
  }
}
