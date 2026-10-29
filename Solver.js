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
}
