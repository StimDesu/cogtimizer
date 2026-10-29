class PlayerRenderer {
    _hatsImg;
    _headImg;
    _player = {
        canvas: undefined,
        context: undefined
    };
    _head = {
        canvas: undefined,
        context: undefined
    };

    // Shown 1:1 (45px tile + 10px overhang on each side, so tall hats are not
    // cut off); whole-number scale with no smoothing keeps the pixel art sharp
    // (the game draws the hat at x2 too).
    width = 65;
    height = 65;

    scale = 2;

    constructor() {
        const hats = document.createElement("img");
        hats.src = "assets/hats_board.png?v=2";
        hats.style.visibility = "hidden";
        document.body.appendChild(hats);
        this._hatsImg = hats;

        const head = document.createElement("img");
        head.src = "icons/head.png";
        head.style.visibility = "hidden";
        document.body.appendChild(head);
        this._headImg = head;

        const headCanvas = document.createElement("canvas");
        head.addEventListener("load", (ev) => {
            console.log("Head loaded");
            headCanvas.width = head.width;
            headCanvas.height = head.height;
        });
        headCanvas.style.visibility = "hidden";
        document.body.appendChild(headCanvas);
        this._head.canvas = headCanvas;
        let ctx = headCanvas.getContext("2d", { willReadFrequently: true });
        this._head.context = ctx;

        const playerCanvas = document.createElement("canvas");
        playerCanvas.width = this.width;
        playerCanvas.height = this.height;
        playerCanvas.style.visibility = "hidden";
        document.body.appendChild(playerCanvas);
        this._player.canvas = playerCanvas;
        ctx = playerCanvas.getContext("2d");
        this._player.context = ctx;
    }

    // The game tints the head (headBIG.png = head.png at x2) with
    // createHueFilter(deg) chosen by class: < 5 -> 10, < 6 -> 136, < 18 -> 182,
    // < 30 -> 300, otherwise 90. These are the colour matrices the game's
    // ColorMatrix produces for those angles (rows R, G, B: r, g, b, a, offset).
    static HEAD_HUE = {
        10: [0.951109, -0.113321, 0.162213, 0, 0, 0.028063, 1.019983, -0.048046, 0, 0, -0.133487, 0.135051, 0.998436, 0, 0],
        136: [-0.50142, 0.732811, 0.768609, 0, 0, 0.46499, 0.607515, -0.072505, 0, 0, -0.181271, 1.726395, -0.545124, 0, 0],
        182: [-0.566756, 1.454843, 0.111913, 0, 0, 0.420222, 0.425608, 0.154171, 0, 0, 0.45269, 1.404926, -0.857615, 0, 0],
        300: [0.790514, 0.976927, -0.767441, 0, 0, -0.017506, 0.736336, 0.28117, 0, 0, 0.788182, -0.261767, 0.473584, 0, 0],
        90: [0, 0, 1, 0, 0, 0.355671, 0.85516, -0.210831, 0, 0, -0.574658, 1.43032, 0.144338, 0, 0],
    };

    static headHueForClass(classId) {
        if (classId < 5) return 10;
        if (classId < 6) return 136;
        if (classId < 18) return 182;
        if (classId < 30) return 300;
        return 90;
    }

    colorHeadForClass(classId) {
        const m = PlayerRenderer.HEAD_HUE[PlayerRenderer.headHueForClass(Number(classId) || 0)];
        const ctx = this._head.context;
        const headW = parseInt(this._headImg.width);
        const headH = parseInt(this._headImg.height);
        ctx.clearRect(0, 0, headW, headH);
        ctx.drawImage(this._headImg, 0, 0, headW, headH);
        let imgData;
        try {
            imgData = ctx.getImageData(0, 0, headW, headH);
        } catch (e) {
            return;
        }
        const d = imgData.data;
        const clamp = (v) => Math.max(0, Math.min(255, Math.round(v)));
        for (let i = 0; i < d.length; i += 4) {
            if (d[i + 3] === 0) continue;
            const r = d[i], g = d[i + 1], b = d[i + 2], a = d[i + 3];
            d[i]     = clamp(m[0] * r + m[1] * g + m[2] * b + m[3] * a + m[4]);
            d[i + 1] = clamp(m[5] * r + m[6] * g + m[7] * b + m[8] * a + m[9]);
            d[i + 2] = clamp(m[10] * r + m[11] * g + m[12] * b + m[13] * a + m[14]);
        }
        ctx.putImageData(imgData, 0, 0);
    }

    render(index) {
        const defaultYOffset = 6;

        let headW = parseInt(this._headImg.width);
        let headH = parseInt(this._headImg.height);

        let hw = this.width * .5;
        let hh = this.height * .5;
        const ctx = this._player.context;

        ctx.clearRect(0, 0, this.width, this.height);
        ctx.imageSmoothingEnabled = false;
        
        // Same layout as the game's board: hat (x2) at (hx, hy), head at (hx + 22, hy + 36).
        const headX = Math.round(hw - headW * this.scale * .5);
        const headY = Math.round(defaultYOffset + hh - headH * this.scale * .5);
        ctx.drawImage(
            this._head.canvas,
            headX,
            headY,
            headW * this.scale,
            headH * this.scale
        );

        // `index` is the hat sprite frame (helmet item ID + 2), 14 frames per row.
        const sw = 30,
              sh = 50;
        const cols = 14;
        const row = Math.floor(index / cols);
        const col = index % cols;

        const swScaled = sw * this.scale;
        const shScaled = sh * this.scale;

        ctx.drawImage(
            this._hatsImg,
            col * sw,
            row * sh,
            sw,
            sh,
            headX - 22,
            headY - 36,
            swScaled,
            shScaled
        );

        return this._player.canvas.toDataURL();
    }
}

function renderHat(index) {

}