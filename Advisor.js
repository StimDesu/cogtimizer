// Construction advice built from the save. Numbers and formulas come from the game's
// code (N.js: WorkbenchStuff "PlayerBuildSpd" / "PlayerConExp", CustomLists data).

const ADVISOR_CLASS_NAMES = {
  1: "Beginner", 2: "Journeyman", 3: "Maestro", 4: "Voidwalker", 5: "Infinilyte",
  7: "Warrior", 8: "Barbarian", 9: "Squire", 10: "Blood Berserker", 12: "Divine Knight",
  14: "Death Bringer", 16: "Royal Guardian",
  19: "Archer", 20: "Bowman", 21: "Hunter", 22: "Siege Breaker", 25: "Beast Master", 29: "Wind Walker",
  31: "Mage", 32: "Wizard", 33: "Shaman", 34: "Elemental Sorcerer", 35: "Spiritual Monk",
  36: "Bubonic Conjuror", 40: "Arcane Cultist"
};

// Cog maker slots next to the board: 3 per cog tier.
const ADVISOR_MAKER_TIERS = ["Nooby", "Decent", "Superb", "Ultimate"];

// Same formula types as the game's ArbitraryCode5Inputs (talents, bubbles, vials).
function advisorFormula(type, x1, x2, lvl) {
  switch (type) {
    case "add": return x2 !== 0 ? ((x1 + x2) / x2 + .5 * (lvl - 1)) / (x1 / x2) * lvl * x1 : x1 * lvl;
    case "decay": return x1 * lvl / (lvl + x2);
    case "decayMulti": return 1 + x1 * lvl / (lvl + x2);
    case "bigBase": return x1 + x2 * lvl;
    default: return 0;
  }
}

// Character's own build rate before cogs: 3 * (lvl/2 + 0.7)^1.6 * (1 + lvl * Carpenter%).
function advisorBaseBuild(lvl, carpenterPct) {
  return 3 * Math.pow(lvl / 2 + .7, 1.6) * (1 + lvl * carpenterPct / 100);
}

class Advisor {
  constructor(save, inventory) {
    this.save = save;
    this.inventory = inventory;
  }

  _json(key, fallback) {
    const v = this.save[key];
    if (v === undefined || v === null) return fallback;
    if (typeof v !== "string") return v;
    try { return JSON.parse(v); } catch (e) { return fallback; }
  }

  // Array-like save values from idleonefficiency come as {"0":..,"length":n} objects.
  static _arr(v) {
    if (!v) return [];
    if (Array.isArray(v)) return v;
    return Array.from({ length: v.length || 0 }, (_, i) => v[i]);
  }

  _characters() {
    const names = this.save.playerNames || [];
    const cogOrder = this._json("CogO", []);
    const cogMap = this._json("CogM", {});
    return names.map((name, i) => {
      const lv = Advisor._arr(this.save["Lv0_" + i]);
      const slot = cogOrder.indexOf("Player_" + name);
      let place = "not placed";
      if (slot >= 0 && slot < 96) place = "board";
      else if (slot >= 96 && slot < 108) place = "maker:" + ADVISOR_MAKER_TIERS[Math.floor((slot - 96) / 3)];
      return {
        index: i,
        name,
        classId: this.save["CharacterClass_" + i],
        className: ADVISOR_CLASS_NAMES[this.save["CharacterClass_" + i]] || ("Class " + this.save["CharacterClass_" + i]),
        conLevel: Number(lv[8]) || 0,
        slot,
        place,
        build: slot >= 0 && cogMap[slot] ? cogMap[slot].a || 0 : 0,
        talents: this._json("SL_" + i, {}),
        talentMax: this._json("SM_" + i, {}),
        postOffice: this._json("POu_" + i, []),
        starSigns: String(this.save["PVtStarSign_" + i] || "").split(",").filter(Boolean),
        bubbles: Advisor._arr(this._json("CauldronBubbles", [])[i]),
      };
    });
  }

  _chestCount(item) {
    const order = Advisor._arr(this.save.ChestOrder);
    const qty = Advisor._arr(this.save.ChestQuantity);
    const i = order.indexOf(item);
    return i >= 0 ? Number(qty[i]) || 0 : 0;
  }

  /**
   * Returns [{ section, level: "ok" | "tip" | "warn", title, detail }]
   */
  advise() {
    const out = [];
    const add = (section, level, title, detail = "") => out.push({ section, level, title, detail });
    const chars = this._characters();
    const cauldron = Advisor._arr(this.save.CauldronInfo).map(Advisor._arr);
    const power = cauldron[0] || [];
    const vials = cauldron[4] || [];
    const carpenterLv = Number(power[12]) || 0;
    const carpenterPct = advisorFormula("decay", 5, 50, carpenterLv);
    const bobLv = Number(power[11]) || 0;
    const warriorsRuleLv = Number(power[1]) || 0;
    const companions = (this.save.companions || []).map(c => c.id);
    const hasSheep = companions.includes(4);
    const redoxSalts = this._chestCount("Refinery1");
    const saltPowers = redoxSalts > 0 ? Math.log10(redoxSalts) : 0;

    // ---- Characters
    const S = "Characters";
    for (const c of chars) {
      const who = `${c.name} (${c.className}, Construction ${c.conLevel})`;
      if (c.place === "not placed") {
        add(S, "warn", `${who} is not on the cog board`, "Characters only build while placed on the board (or in a cog maker slot). Put them on the board.");
      } else if (c.place.startsWith("maker:")) {
        add(S, "tip", `${who} is making ${c.place.slice(6)} cogs instead of building`,
          `Their ${Math.round(c.build)}/HR does not count toward the board's build rate while they sit in a cog maker slot. Fine if you need new cogs; otherwise move them to the board.`);
      }

      // Squire talents: Redox Rates (131) and Sharper Saws (132)
      if (c.talentMax["131"] !== undefined) {
        const lv = Number(c.talents["131"]) || 0, max = Number(c.talentMax["131"]) || 0;
        const now = advisorFormula("decay", 40, 70, lv), best = advisorFormula("decay", 40, 70, max);
        const gain = (1 + best * saltPowers / 100) / (1 + now * saltPowers / 100) - 1;
        if (lv < max) {
          add(S, "warn", `${c.name}: Redox Rates talent ${lv}/${max}`,
            `Gives +${now.toFixed(1)}% build speed per power of 10 Redox Salts in storage (you have ${redoxSalts.toLocaleString()}, i.e. ${saltPowers.toFixed(1)} powers). Maxing it: about +${(gain * 100).toFixed(0)}% build for this character.`);
        } else {
          add(S, "ok", `${c.name}: Redox Rates talent maxed (${lv})`, `+${(now * saltPowers).toFixed(0)}% build speed from ${redoxSalts.toLocaleString()} Redox Salts. More salts in the storage chest = more build speed.`);
        }
      }
      if (c.talentMax["132"] !== undefined) {
        const lv = Number(c.talents["132"]) || 0, max = Number(c.talentMax["132"]) || 0;
        if (lv < max) add(S, "tip", `${c.name}: Sharper Saws talent ${lv}/${max}`, `+1% Construction EXP per level for this character (+${max - lv}% if maxed).`);
      }

    }

    // Construction levels: every character's own build rate grows with it.
    const byLevel = chars.slice().sort((a, b) => a.conLevel - b.conLevel);
    add(S, "ok", "Construction levels and build rate per character",
      byLevel.map(c => {
        const gain10 = advisorBaseBuild(c.conLevel + 10, carpenterPct) / advisorBaseBuild(c.conLevel, carpenterPct) - 1;
        return `${c.name} (${c.className}): level ${c.conLevel}, ${Math.round(c.build)}/HR, +10 levels = +${(gain10 * 100).toFixed(0)}%`;
      }).join("\n") + "\nA character's own build rate is 3*(level/2+0.7)^1.6, multiplied by the Carpenter bubble per level, so low-level builders gain the most from leveling.");

    // Post office: Construction Container (box 17), per character
    const noBox = chars.filter(c => (Number(c.postOffice[17]) || 0) === 0 && c.place !== "not placed");
    if (noBox.length) {
      add(S, "tip", `Construction Container post office box is level 0 for ${noBox.length} of ${chars.length} characters`,
        `${noBox.map(c => c.name).join(", ")}. +0.25% base build rate per box level (and Construction EXP after level 100).`);
    }

    // ---- Construction EXP
    const E = "Construction EXP";
    const sawsaw = chars.filter(c => c.starSigns.includes("45"));
    add(E, sawsaw.length ? "ok" : "tip", `Star sign Sawsaw Salala (+25% Construct EXP): ${sawsaw.length ? sawsaw.map(c => c.name).join(", ") : "nobody"}`,
      "Applies to each character that has it equipped.");
    add(E, bobLv > 0 ? "ok" : "warn", `Call Me Bob bubble level ${bobLv}: +${advisorFormula("bigBase", 25, 2.5, bobLv).toFixed(0)}% Construction EXP`,
      hasSheep ? "Counts for every character thanks to the Sheep companion (all big bubbles count as equipped)."
        : "Without the Sheep companion this only counts for characters who have the bubble equipped.");
    if (warriorsRuleLv > 0) {
      add(E, "ok", `Warriors Rule bubble level ${warriorsRuleLv}`, `Warriors (Barbarian/Squire lines) get Call Me Bob x${advisorFormula("decayMulti", 2, 50, warriorsRuleLv).toFixed(2)} when not the active character.`);
    }
    const statue = Advisor._arr(this._json("StatueLevels_0", []))[18];
    const statueLv = statue ? Number(Advisor._arr(statue)[0]) || 0 : 0;
    add(E, statueLv > 0 ? "ok" : "tip", `Seesaw statue level ${statueLv}: +${(statueLv * .5).toFixed(1)}% Construction EXP`, "+0.5% per level.");
    const inkLv = Number(vials[32]) || 0;
    add(E, inkLv > 0 ? "ok" : "tip", `Visible Ink vial ${inkLv > 0 ? "level " + inkLv : "not unlocked"}`, "+1% Construction EXP per level.");
    const expCogs = Object.values(this._json("CogM", {})).filter(c => c.f).length;
    if (expCogs === 0) {
      add(E, "tip", "No cogs give '% Player Construct XP'", "Player EXP can't be improved by moving cogs; only the '% Bonus Construct EXP' total and the sources above help.");
    }

    // ---- Build rate
    const B = "Build rate";
    add(B, "ok", `Carpenter bubble level ${carpenterLv}: +${carpenterPct.toFixed(2)}% build per Construction level`, "Multiplies every character's own build rate; higher Construction levels profit more.");
    const stew = Number(vials[62]) || 0, turtle = Number(vials[74]) || 0;
    add(B, stew > 0 ? "ok" : "tip", `Shinyfin Stew vial ${stew > 0 ? "level " + stew : "not unlocked"}`, "+% Construction build rate.");
    add(B, turtle > 0 ? "ok" : "tip", `Turtle Tisane vial ${turtle > 0 ? "level " + turtle : "not unlocked"}`, "Multiplicative build rate bonus.");
    const achieve = this._json("AchieveReg", []);
    if (achieve.length > 153) {
      const done = Number(achieve[153]) === -1;
      const greyOnBoard = this._json("CogO", []).slice(0, 96).filter(c => typeof c === "string" && c.startsWith("Cog0")).length;
      add(B, done ? "ok" : "tip", `Achievement 'Cog in the System' ${done ? "done" : "not done"}`,
        done ? "+5% build speed." : `Have 20 grey (Nooby) cogs on the board at once for +5% build speed. You have ${greyOnBoard} now.`);
    }

    // ---- Flaggy and the board
    const F = "Flaggy & board";
    const gems = this._json("GemItemsPurchased", []);
    const flaggyGem = Number(gems[118]) || 0;
    add(F, flaggyGem > 0 ? "ok" : "tip", `Gem shop flaggy upgrades: ${flaggyGem}`, "Each one gives +50% flaggy rate on the whole board.");
    const flags = this._json("FlagP", []).filter(v => v >= 0).length;
    add(F, flags >= 4 ? "ok" : "warn", `Flags placed: ${flags}/4`, "Flags unlock new board slots; flaggy rate fills them.");
    if (this.inventory) {
      const emptySlots = this.inventory.availableSlotKeys.filter(k => !this.inventory.cogs[k]).length;
      const spare = Object.keys(this.inventory.cogs).filter(k => k >= 108).length;
      if (emptySlots > 0 && spare > 0) add(F, "warn", `${emptySlots} empty board slots and ${spare} cogs in the spare inventory`, "Run the solver or place spare cogs on the board.");
      else if (emptySlots > 0) add(F, "tip", `${emptySlots} empty board slots`, "Make more cogs in the cog maker to fill them.");
    }
    const cogInvGem = Number(gems[116]) || 0;
    const burp = Number(vials[31]) || 0;
    add(F, "ok", `Cog inventory: gem shop +${4 * cogInvGem}, Bubonic Burp vial ${burp > 0 ? "+" + burp : "not unlocked"}`, "More spare slots let you keep better cogs for later.");
    return out;
  }
}

if (typeof module !== "undefined") module.exports = { Advisor };
