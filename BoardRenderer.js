
class BoardRenderer {
  _rows;
  _columns;
  _visibleRows;
  _type;

  _pageIndex = 0;
  _pageCount = 0;

  board;

  moveFrom = undefined;
  moveTo = undefined;

  constructor(rows, columns, type, visibleRows = rows) {
    this._rows = rows;
    this._columns = columns;
    this._visibleRows = visibleRows;
    this._type = type;

    this._pageCount = rows / visibleRows;

    this.board = new Array(columns * rows);
    for (let i = 0; i < this.board.length; i++) {
      this.board[i] = {
        item: undefined,
        elem: undefined,
        row: Math.floor(i / columns),
        column: i % columns
      };
    };
  }

  createHTMLElement() {
    const tableElem = document.createElement("table");
    tableElem.className = "cogboard";

    for (let row = 0; row < this._visibleRows; row++) {
      const rowElem = document.createElement("tr");
      for (let col = 0; col < this._columns; col++) {
        const index = row * this._columns + col;

        const colElem = document.createElement("td");
        this.board[index].elem = colElem;
        for (let i = 1; i < this._pageCount; i++) {
          this.board[index + (i * this._visibleRows * this._columns)].elem = colElem;
        }
        rowElem.appendChild(colElem);
      }
      tableElem.appendChild(rowElem);
    }

    return tableElem;
  }

  showPage(pageIndex) {
    pageIndex = Math.max(0, Math.min(pageIndex, (this._pageCount - 1)));
    this._pageIndex = pageIndex;

    const pageSize = this._visibleRows * this._columns;
    const index = pageIndex * pageSize;

    for (let i = index; i < index + pageSize; i++) {
      this._render(this.board[i]);
    }
  }

  getPage(coord) {
    if (coord.location === this._type) {
      return Math.floor(coord.y / this._visibleRows);
    }
    return -1;
  }

  _getIndex(row, column) {
    if (row >= this._rows) {
      throw new Error("Tried to access row outside the board");
    }
    if (column >= this._columns) {
      throw new Error("Tried to access column outside the board");
    }

    return (row * this._columns) + column;
  }

  _render(slot) {
    let cog = slot.item;
    const col = slot.elem;

    const isVisible = (slot.row >= this._pageIndex * this._visibleRows && 
      slot.row < this._pageIndex * this._visibleRows + this._visibleRows);

    // console.log(slot.row, slot.column, isVisible);
    if (!isVisible) {
      return;
    }

    if (!cog) {
      cog = {
        fixed: false,
        blocked: false,
        icon: "Blank"
      };
    }

    let border = "black";
    let cssClass = "";

    if (cog.fixed) {
      // border = "yellow";
    }

    // TODO: Move to css
    col.style.border = `1px solid ${border}`;
    col.style.borderBottom = `2px solid ${border}`;
    col.style.backgroundImage = `url("assets/${(!cog.blocked && "cog_bg.png") || "cog_blank.png"}")`;
    col.style.backgroundPosition = "center";
    col.style.backgroundSize = "cover";
    if (col.classList.contains("toMove")) {
      col.classList.remove("toMove");
    }
    delete col.dataset.mark;

    if (!cog.blocked) {
      let div;
      if (col.firstChild) {
        div = col.firstChild;
      } else {
        div = createElem("div");
        div.style.width = "100%";
        div.style.height = "100%";
        div.style.backgroundPosition = "center";
        div.style.color = "white";
        col.appendChild(div);
      }

      if (cog.icon.type === "blank") {
        div.style.backgroundImage = "";
        div.innerHTML = "";
      } else if (cog.isPlayer) {
        div.style.backgroundImage = `url("${cog.icon.path}")`;
        div.style["background-size"] = `contain`;
        div.innerHTML = BoardRenderer.showStats ? BoardRenderer.statsHtml(cog) : "";
      }	else {
        div.style.removeProperty("background-size");
        div.style.backgroundImage = `url("${cog.icon.path}")`;
        div.innerHTML = BoardRenderer.showStats ? BoardRenderer.statsHtml(cog) : "";
      }
      col.title = BoardRenderer.tooltip(cog);
    } else {
      if (cog.isFlag) {
        col.style.backgroundImage = `url("icons/cogs/flag.png")`;
      }
    }
  }

  set(row, column, item) {
    const index = this._getIndex(row, column);
    const slot = this.board[index];
    slot.item = item;

    this._render(slot);
  }

  move(cordFrom, cordTo) {
    if (this.moveTo)
      this._render(this.moveTo);

    if (this.moveFrom)
      this._render(this.moveFrom);

    if (cordFrom.location == this._type) {
      const from = this.get(cordFrom.y, cordFrom.x);
      const fromCol = from.elem;

      this.moveFrom = from;

      fromCol.style.border = `1px solid lightgreen`;
      fromCol.style.borderBottom = `2px solid lightgreen`;
      fromCol.classList.add("toMove");
    } else {
      this.moveFrom = undefined;
    }

    if (cordTo.location === this._type) {
      const to = this.get(cordTo.y, cordTo.x);
      const toCol = to.elem;

      this.moveTo = to;

      toCol.style.border = `1px solid lightgreen`;
      toCol.style.borderBottom = `2px solid lightgreen`;
      toCol.classList.add("toMove");
    } else {
      this.moveTo = undefined;
    }
  }

  get(row, column) {
    const index = this._getIndex(row, column);
    return this.board[index];
  }

  // Re-draw the visible slots, e.g. after the "Show cog stats" setting changed.
  rerender() {
    for (const slot of this.board) {
      if (slot.elem) this._render(slot);
    }
  }

  // "Show cog stats?" setting: numbers drawn on top of each cog.
  static showStats = false;

  static _num(n) {
    n = Number(n) || 0;
    return n >= 1000 ? (n / 1000).toFixed(1) + "K" : String(Math.round(n));
  }

  // Up to four short colored lines: build rate, flaggy, % bonus construct EXP,
  // and "+N%" for a boost given to the cogs in the shape around this one.
  static statsHtml(cog) {
    const lines = [];
    const n = BoardRenderer._num;
    if (cog.buildRate) lines.push(`<i class="s-build">${n(cog.buildRate)}</i>`);
    if (cog.isPlayer && cog.expGain) lines.push(`<i class="s-exp">${n(cog.expGain)}</i>`);
    if (cog.flaggy) lines.push(`<i class="s-flaggy">${n(cog.flaggy)}</i>`);
    if (cog.expBonus) lines.push(`<i class="s-exp">${n(cog.expBonus)}%</i>`);
    if (cog.buildRadiusBoost) lines.push(`<i class="s-build">+${n(cog.buildRadiusBoost)}%</i>`);
    if (cog.flaggyRadiusBoost) lines.push(`<i class="s-flaggy">+${n(cog.flaggyRadiusBoost)}%</i>`);
    if (cog.expRadiusBoost) lines.push(`<i class="s-exp">+${n(cog.expRadiusBoost)}%</i>`);
    if (cog.flagBoost) lines.push(`<i class="s-flag">+${n(cog.flagBoost)}%</i>`);
    return lines.length ? `<div class="cogstats">${lines.join("")}</div>` : "";
  }

  // Full description shown when hovering a cog.
  static tooltip(cog) {
    if (!cog || cog.blocked || !cog.icon || cog.icon.type === "blank") return "";
    const tr = typeof t === "function" ? t : (s, v) => s.replace(/\{(\w+)\}/g, (m, k) => v[k]);
    const shape = cog.boostRadius ? tr("shape: " + cog.boostRadius) : "";
    const lines = [];
    if (cog.buildRate) lines.push(tr("Build rate: {v}/HR", { v: Math.round(cog.buildRate) }));
    if (cog.isPlayer && cog.expGain) lines.push(tr("Player construct EXP: {v}/HR", { v: Math.round(cog.expGain) }));
    if (cog.flaggy) lines.push(tr("Flaggy rate: {v}/HR", { v: Math.round(cog.flaggy) }));
    if (cog.expBonus) lines.push(tr("+{v}% bonus construct EXP (whole board)", { v: cog.expBonus }));
    if (cog.buildRadiusBoost) lines.push(tr("+{v}% build rate to cogs {shape}", { v: cog.buildRadiusBoost, shape }));
    if (cog.flaggyRadiusBoost) lines.push(tr("+{v}% flaggy rate to cogs {shape}", { v: cog.flaggyRadiusBoost, shape }));
    if (cog.expRadiusBoost) lines.push(tr("+{v}% player construct EXP to characters {shape}", { v: cog.expRadiusBoost, shape }));
    if (cog.flagBoost) lines.push(tr("+{v}% flag speed to flags {shape}", { v: cog.flagBoost, shape }));
    return lines.join("\n");
  }
}
