const ICON_QUALITY_MAP = {
  ["0"]: "Nooby",
  ["1"]: "Decent",
  ["2"]: "Superb",
  ["3"]: "Ultimate",
  ["Y"]: "Yang",
  ["Z"]: "Yin"
};
const ICON_TYPE_MAP = {
  ["A00"]: "Cog",
  ["A0"]: "CogB",
  ["A1"]: "Average",
  ["A2"]: "Spur",
  ["A3"]: "Stacked",
  ["A4"]: "Deckered",
  ["B0"]: "Double",
  ["B1"]: "Trips",
  ["B2"]: "Trabble",
  ["B3"]: "Quad",
  ["B4"]: "Penta",
  ["ad"]: "Adjacent",
  ["di"]: "Diagonal",
  ["up"]: "Up",
  ["do"]: "Down",
  ["le"]: "Left",
  ["ri"]: "Right",
  ["ro"]: "Row",
  ["co"]: "Column",
  ["cr"]: "Corner",
};
const YIN_MAP = {
  ["A00"]: "Yin_Top_Left_Cog",
  ["A01"]: "Yin_Top_Right_Cog",
  ["A02"]: "Yin_Bottom_Left_Cog",
  ["A03"]: "Yin_Bottom_Right_Cog"
};
const Crystal_MAP = {
  ["0"]: "Topaz",
  ["1"]: "Ruby",
  ["2"]: "Amethyst",
  ["3"]: "Garnet",
  ["4"]: "Emerald",
  ["5"]: "BlueGem"
};
const INV_ROWS = 8;
const INV_COLUMNS = 12;
const BOARD_SIZE = INV_ROWS * INV_COLUMNS;
const SPARE_START = 108;
// Boost shapes as [dx, dy] offsets, copied from the game's CustomLists.CogMatrices.
// row / column / everything are handled separately (the game loops over them).
const COG_MATRICES = {
  adjacent: [[0,1],[0,-1],[1,0],[-1,0]],
  diagonal: [[1,1],[1,-1],[-1,-1],[-1,1]],
  left: [[-1,0],[-2,0],[-1,1],[-1,-1],[-2,1],[-2,-1]],
  right: [[1,0],[2,0],[1,1],[1,-1],[2,1],[2,-1]],
  up: [[0,-1],[0,-2],[-1,-1],[1,-1],[-1,-2],[1,-2]],
  down: [[0,1],[0,2],[1,1],[-1,1],[1,2],[-1,2]],
  corners: [[2,2],[2,-2],[-2,2],[-2,-2]],
  around: [[0,1],[0,-1],[1,0],[-1,0],[1,1],[1,-1],[-1,-1],[-1,1],[0,2],[0,-2],[2,0],[-2,0]],
};
const _targetCache = {};
// Board keys boosted by a cog with the given radius sitting on board key `key`.
function boostTargets(key, radius) {
  const cacheKey = key + radius;
  if (_targetCache[cacheKey]) return _targetCache[cacheKey];
  const x = key % INV_COLUMNS, y = Math.floor(key / INV_COLUMNS), res = [];
  if (radius === "row") {
    for (let i = 0; i < INV_COLUMNS; i++) if (i !== x) res.push(y * INV_COLUMNS + i);
  } else if (radius === "column") {
    for (let i = 0; i < INV_ROWS; i++) if (i !== y) res.push(i * INV_COLUMNS + x);
  } else if (radius === "everything") {
    for (let i = 0; i < BOARD_SIZE; i++) if (i !== key) res.push(i);
  } else if (COG_MATRICES[radius]) {
    for (const [dx, dy] of COG_MATRICES[radius]) {
      const nx = x + dx, ny = y + dy;
      if (nx >= 0 && nx < INV_COLUMNS && ny >= 0 && ny < INV_ROWS) res.push(ny * INV_COLUMNS + nx);
    }
  }
  return _targetCache[cacheKey] = res;
}

class Cog {
  constructor(initialValues = {}) {
    this._key = initialValues.key;
    this.icon = initialValues.icon;
    this.initialKey = initialValues.initialKey !== undefined ? initialValues.initialKey : initialValues.key;
    this.buildRate = initialValues.buildRate;
    this.isPlayer = initialValues.isPlayer;
    this.isFlag = initialValues.isFlag;
    this.expGain = initialValues.expGain;
    // Player construct EXP before board boosts (the save stores the boosted value).
    this.baseExp = initialValues.baseExp;
    this.flaggy = initialValues.flaggy;
    this.expBonus = initialValues.expBonus;
    this.buildRadiusBoost = initialValues.buildRadiusBoost;
    this.expRadiusBoost = initialValues.expRadiusBoost;
    this.flaggyRadiusBoost = initialValues.flaggyRadiusBoost;
    this.boostRadius = initialValues.boostRadius;
    this.flagBoost = initialValues.flagBoost;
    this.nothing = initialValues.nothing; // Description: +% Nothing! LOL
    this.fixed = initialValues.fixed;
    this.blocked = initialValues.blocked;
    // Placed flags: flaggy collected so far, flaggy needed and the flag image.
    this.flagProgress = initialValues.flagProgress;
    this.flagReq = initialValues.flagReq;
    this.flagIcon = initialValues.flagIcon;
    this._position = null;
  }
  get key() {
    return this._key
  }
  set key(v) {
    this._position = null;
    this._key = Number.parseInt(v)
  }
  position(keyNum) {
    const isDefault = keyNum === undefined;
    if (this._position && isDefault) return this._position;
    keyNum = keyNum ?? Number.parseInt(this.key);
    // board = 0-95
    // build = 96-107
    // spare = 108-*
    const location = keyNum >= 96 ? keyNum <= 107 ? "build" : "spare" : "board";
    let perRow = 3;
    let offset = SPARE_START;
    if (location === "board") {
      perRow = INV_COLUMNS;
      offset = 0;
    } else if (location === "build") {
      offset = 96;
    }
    const y = Math.floor((keyNum - offset) / perRow);
    const x = Math.floor((keyNum - offset) % perRow);
    const res = { location, x, y };
    if (isDefault) {
      this._position = res;
    }
    return res;
  }
}

class FakeBoard {
  constructor(inventory) {
    this.inventory = inventory;
    
    this.length = INV_ROWS;
    this[Symbol.Iterator] = function*() {
      for (let s = 0; s < INV_ROWS; s++) yield s;
    }

    for (let i = 0; i < INV_ROWS; i++) {
      const columnProxy = {
        length: INV_COLUMNS,
        [Symbol.Iterator]: function* () {
          for (let s = 0; s < INV_COLUMNS; s++) yield s;
        }
      }
      for (let j = 0; j < INV_COLUMNS; j++) {
        const key = i * INV_COLUMNS + j;
        Object.defineProperty(columnProxy, j, {
          get: () => this.inventory.get(key)
        });
      }
      Object.defineProperty(this, i, {
        get: () => columnProxy
      });
    }
  }
}

class CogInventory {
  constructor(cogs={}, slots={}) {
    this.cogs = cogs;
    this.slots = slots;
    this.smallCogs = {};
    this.smallSlotUnlocked = [];
    this.playerCount = 10;
    this.flagPose = [];
    this.flaggyShopUpgrades = 0;
    this.availableSlotKeys = [];
    this._score = null;
    // Saved for performance
    this._board = new FakeBoard(this);
  }
  
  get cogKeys() {
    return Object.keys(this.cogs);
  }
  
  get(key) {
    return this.cogs[key] || this.slots[key]
  }
  
  static _saveGet(arr, ...indexes) {
    while(indexes.length) {
      if (arr === undefined) break;
      arr = arr[indexes.splice(0, 1)[0]];
    }
    return arr;
  }
  
  load(save) {
    this.availableSlotKeys = [];
    this._score = null;
    console.log("Loading");

    const tr = typeof t === "function" ? t : (text, vars) => text.replace(/\{(\w+)\}/g, (m, k) => vars[k]);
    if (!save || typeof save !== "object") {
      throw new Error(tr("No save data found. Paste the \"Raw Data\" from idleonefficiency.com, or enter your username."));
    }
    // These keys hold the cog board. If any is absent the input is not a full
    // save (e.g. wrong/partial data), so fail clearly instead of half-loading.
    const required = ["CogM", "CogO", "FlagU", "FlagP", "GemItemsPurchased"];
    const missing = required.filter(k => save[k] === undefined);
    if (missing.length) {
      throw new Error(tr("This doesn't look like a full save - missing cog data ({keys}). Copy the complete \"Raw Data\" from idleonefficiency.com.",
        { keys: missing.join(", ") }));
    }

    // Class id -> name, from the game's CustomLists.h.ClassNames. Only used for
    // debug logging; head tinting below keys off the numeric id ranges directly.
    // Ranges: 1-6 Beginner family, 7-18 Warrior, 19-30 Archer, 31+ Mage.
    const foo = [];
    // Beginner family
    foo[1] = "Beginner";
    foo[2] = "Journeyman";
    foo[3] = "Maestro";
    foo[4] = "Voidwalker";
    foo[5] = "Infinilyte";
    // Warrior family
    foo[7] = "Warrior";
    foo[8] = "Barbarian";
    foo[9] = "Squire";
    foo[10] = "Blood Berserker";
    foo[12] = "Divine Knight";
    foo[14] = "Death Bringer";
    foo[16] = "Royal Guardian";
    // Archer family
    foo[19] = "Archer";
    foo[20] = "Bowman";
    foo[21] = "Hunter";
    foo[22] = "Siege Breaker";
    foo[25] = "Beast Master";
    foo[29] = "Wind Walker";
    // Mage family
    foo[31] = "Mage";
    foo[32] = "Wizard";
    foo[33] = "Shaman";
    foo[34] = "Elemental Sorcerer";
    foo[35] = "Spiritual Monk";
    foo[36] = "Bubonic Conjuror";
    foo[40] = "Arcane Cultist";

    const hatIcons = {};
    const playerNames = save["playerNames"];
    // Character count drives the EXP-boost weighting in the solver. The cap was
    // raised to 11 in a recent patch, so read it from the save instead of assuming.
    this.playerCount = (playerNames && playerNames.length) || 10;
    if (playerNames) {
      playerNames.forEach((v, i) => {
        const classNameSlot = `CharacterClass_${i}`;
        const classNameIndex = save[classNameSlot];
        const className = foo[classNameIndex];
        console.log(v, classNameIndex, className);

        window.player.colorHeadForClass(classNameIndex);

        // Same choice as the game's cog board: the premium helmet (equipment
        // slot 8) unless it is empty or EquipmentHats38, else the normal helmet
        // (slot 0); the hat sprite frame is the item's ID + 2.
        const equipment = save[`EquipOrder_${i}`] || [];
        const worn = equipment[0] || {};
        const premium = worn[8];
        const helmet = premium && premium !== "Blank" && premium !== "EquipmentHats38" ? premium : worn[0];
        let hatFound = false;
        if (helmet && helmet !== "Blank" && typeof HAT_IDS !== "undefined" && HAT_IDS[helmet] !== undefined) {
          hatIcons[v] = {
            type: "hat",
            path: window.player.render(HAT_IDS[helmet] + 2)
          };
          hatFound = true;
        }
        if (!hatFound) {
          hatIcons[v] = {
            type: "head",
						path: "icons/head.png"
          };
        }
      });
    }

    // Fetch Gem-Shop flaggy upgrades
    this.flaggyShopUpgrades = JSON.parse(save["GemItemsPurchased"])[118];
    // Fetch the list of available cogs
    const cogRaw = JSON.parse(save["CogM"]);
    const cogIcons = JSON.parse(save["CogO"]).map(c=>{
      let icon = {
        type: "cog"
      };
      if(c === "Blank") {
        icon.type = "blank";
        icon.path = "assets/cog_blank.png"
      } else if(c.startsWith("Player")) {
        icon = hatIcons[c.substring(7)] || { type: "head", path: "icons/head.png" };
      } else if(c === "CogY") {
        icon.type = "cog";
        icon.path = "icons/cogs/Yang_Cog.png";
      } else if (c.startsWith("CogCry")) {
        icon.type = "cog";
        const parsed = c.match(/^CogCry([0-5])$/);
        icon.path = "icons/cogs/" + "Crystal_" + Crystal_MAP[parsed[1]] + ".png";
      } else if (c.startsWith("CogSm")) {
        // W7 "small" cogs (CogSm[_ab][0-9]). Sprite name matches the icon key,
        // so map directly. These only appear in CogO (not CogM) today, but the
        // real per-variant icons are shipped so they render if that changes.
        icon.type = "cog";
        icon.path = "icons/cogs/" + c + ".png";
      } else {
        icon.type = "cog";
        const parsed=c.match(/^Cog([0123YZ])(.{2,3})$/);
        if(!parsed) {
          // Unknown/new icon code: degrade to blank instead of crashing.
          icon.type = "blank";
          icon.path = "assets/cog_blank.png";
        } else if(parsed[1] === "Z") {
          icon.path = "icons/cogs/" + YIN_MAP[parsed[2]] + ".png";
        } else {
          icon.path = "icons/cogs/" + ICON_TYPE_MAP[parsed[2]] + "_" + ICON_QUALITY_MAP[parsed[1]] + ".png";
        }
      }
      return icon;
    });
    const cogArray = Object.entries(cogRaw).map(([key, c]) => {
      const keyNum = Number.parseInt(key);
      return new Cog({
        key: keyNum,
        icon: cogIcons[keyNum] || "Blank",
        buildRate: c.a,
        isPlayer: c.b > 0,
        expGain: c.b,
        flaggy: c.c,
        expBonus: c.d,
        buildRadiusBoost: c.e,
        expRadiusBoost: c.f,
        flaggyRadiusBoost: c.g,
        boostRadius: c.h,
        flagBoost: c.j,
        nothing: c.k,
        fixed: c.h === "everything",
        blocked: false
      });
    });
    // Get the available board
    this.flagPose = JSON.parse(save["FlagP"]).filter(v=>v>=0); // Only first 4 are used
    const flagU = JSON.parse(save["FlagU"]);
    // Tiny-cog side slots unlock separately: slot t (0-23, board keys 228+t) is
    // unlocked iff FlagUnlock[96 + t] === -11 (same sentinel the board uses).
    this.smallSlotUnlocked = [];
    for (let t = 0; t < 24; t++) {
      this.smallSlotUnlocked[t] = flagU[96 + t] === -11;
    }
    const slots = flagU.map((n, i) => {
      if (n > 0 && this.flagPose.includes(i)) {
        // Same as the game's board: pink flag once a gem shop flaggy upgrade is bought.
        return new Cog({
          key: i, fixed: true, blocked: true, isFlag: true, icon: "Blank",
          flagProgress: n,
          flagReq: typeof FLAG_REQS !== "undefined" && i < BOARD_SIZE ? 25 * FLAG_REQS[i] : undefined,
          flagIcon: this.flaggyShopUpgrades > 0 ? "icons/cogs/CogFLflag2.png" : "icons/cogs/CogFLflag.png",
        });
      }
      if (n !== -11) return new Cog({ key: i, fixed: true, blocked: true });
      return new Cog({ key: i, icon: "Blank" });
    });
    // Map slots and cogs to a key -> obj map
    this.slots = {};
    for (const slot of slots) {
      this.slots[slot.key] = slot;
      // FlagU[96+] is the tiny-cog side strip, not the board.
      if (!slot.fixed && slot.key < BOARD_SIZE) {
        this.availableSlotKeys.push(slot.key);
      }
    }
    this.cogs = {};
    for (const cog of cogArray) {
      this.cogs[cog.key] = cog;
    }
    // The save keeps each player's EXP after board boosts; undo them so moving
    // players around can be scored the way the game does it.
    {
      const grid = this._bonusGrid();
      let expBonus = 0;
      for (const key of this.availableSlotKeys) expBonus += (this.get(key) || {}).expBonus || 0;
      for (const cog of Object.values(this.cogs)) {
        if (!cog.isPlayer) continue;
        const boost = cog.key < BOARD_SIZE ? grid[cog.key].exp : 0;
        cog.baseExp = (cog.expGain || 0) / ((1 + boost / 100) * (1 + expBonus / 100));
      }
    }

    // W7 tiny cogs (CogSm) live in the 24 dedicated side slots (228-239 left,
    // 240-251 right) and can also sit unplaced in the spare inventory. They have
    // no CogM stats and are not optimized, so keep them apart from cogs/slots and
    // expose only their icons for display, keyed by CogO index.
    this.smallCogs = {};
    for (let i = 0; i < cogIcons.length; i++) {
      const icon = cogIcons[i];
      if (icon && icon.path && icon.path.indexOf("CogSm") !== -1) {
        this.smallCogs[i] = { key: i, icon, blocked: false, fixed: true, isPlayer: false };
      }
    }

    document.getElementById("notify").style.display = "none";
  }
  
  clone() {
    const c = {};
    for (let [k,v] of Object.entries(this.cogs)) {
      c[k] = new Cog(v);
    }
    const s = {};
    for (let [k,v] of Object.entries(this.slots)) {
      s[k] = new Cog(v);
    }
    const res = new CogInventory(c, s);
    res.flagPose = [...this.flagPose];
    res.flaggyShopUpgrades = this.flaggyShopUpgrades;
    res.availableSlotKeys = [...this.availableSlotKeys];
    res.playerCount = this.playerCount;
    return res;
  }
  
  get board() {
    return this._board;
  }
  
  // Per-board-key boost sums (%), like the game's eT/fT/gT/jT totals.
  _bonusGrid() {
    const grid = [];
    for (let i = 0; i < BOARD_SIZE; i++) grid.push({ build: 0, exp: 0, flaggy: 0, flag: 0 });
    for (const key of this.availableSlotKeys) {
      const entry = this.get(key);
      if (!entry || !entry.boostRadius) continue;
      for (const t of boostTargets(key, entry.boostRadius)) {
        const bonus = grid[t];
        bonus.build  += entry.buildRadiusBoost  || 0;
        bonus.exp    += entry.expRadiusBoost    || 0;
        bonus.flaggy += entry.flaggyRadiusBoost || 0;
        bonus.flag   += entry.flagBoost         || 0;
      }
    }
    return grid;
  }

  // Board totals computed the same way as the game's Construction menu (N.js):
  //   build rate  = sum(a * (1 + boost%))
  //   flaggy rate = sum(c * (1 + boost%)) * (1 + 50% per gem shop upgrade)
  //   player EXP  = base * (1 + boost%) * (1 + sum of "% bonus construct EXP")
  //   flag speed  = flaggy rate * (1 + boost%) for every placed flag
  get score() {
    if (this._score !== null) return this._score;

    const grid = this._bonusGrid();
    const result = {
      buildRate: 0,
      expBonus: 0,
      flaggy: 0,
      playerXp: 0,
      flagSpeed: 0,
      expBoost: 0,
      flagBoost: 0
    };
    for (const key of this.availableSlotKeys) {
      const entry = this.get(key);
      if (!entry) continue;
      const bonus = grid[key];
      result.buildRate += (entry.buildRate || 0) * (1 + bonus.build / 100);
      result.expBonus += entry.expBonus || 0;
      result.flaggy += (entry.flaggy || 0) * (1 + bonus.flaggy / 100);
    }
    result.flaggy *= 1 + (this.flaggyShopUpgrades || 0) * 0.5;
    for (const cog of Object.values(this.cogs)) {
      if (!cog.isPlayer) continue;
      const boost = cog.key < BOARD_SIZE ? grid[cog.key].exp : 0;
      result.expBoost += boost;
      const base = cog.baseExp !== undefined ? cog.baseExp : (cog.expGain || 0);
      result.playerXp += base * (1 + boost / 100) * (1 + result.expBonus / 100);
    }
    for (const key of this.flagPose) {
      if (key >= BOARD_SIZE) continue;
      const boost = grid[key].flag;
      result.flagBoost += boost;
      result.flagSpeed += result.flaggy * (1 + boost / 100);
    }
    return this._score = result;
  }
  
  move(pos1, pos2) {
    this._score = null;
    if (Array.isArray(pos1)) {
      pos1 = pos1[0] * INV_COLUMNS + pos1[1];
      pos2 = pos2[0] * INV_COLUMNS + pos2[1];
    }
    if (pos1 instanceof Object) {
      pos1 = pos1.y * INV_COLUMNS + pos1.x;
      pos2 = pos2.y * INV_COLUMNS + pos2.x;
    }
    const temp = this.cogs[pos2];
    this.cogs[pos2] = this.cogs[pos1];
		if (!this.cogs[pos2]) {
			delete this.cogs[pos2];
		} else {
			this.cogs[pos2].key = pos2;
		}
    this.cogs[pos1] = temp;
		if (!this.cogs[pos1]) {
			delete this.cogs[pos1];
		} else {
			this.cogs[pos1].key = pos1;
		}
  }
}