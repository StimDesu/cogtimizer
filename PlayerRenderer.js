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

    width = 36;
    height = 36;

    scale = 1.5;

    constructor() {
        const hats = document.createElement("img");
        hats.src = "assets/hats_board.png";
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

    _colorHead(pr, pg, pb) {
        console.log("color head");
        const ctx = this._head.context;
        let headW = parseInt(this._headImg.width);
        let headH = parseInt(this._headImg.height);
        ctx.clearRect(0, 0, headW, headH);
        ctx.drawImage(
            this._headImg,
            0,
            0,
            headW,
            headH
        );

        let imgData;
        try {
          imgData = ctx.getImageData(0, 0, headW, headH);
				} catch(e) {
					return;
				}
        for (let i = 0; i < imgData.data.length; i += 4) {
            const r = imgData.data[i],
                  g = imgData.data[i+1],
                  b = imgData.data[i+2],
                  a = imgData.data[i+3];
            if (r + g + b + a !== 0 && r + g + b + a < (255 * 4) * .9) {
                imgData.data[i]   = r * pr;
                imgData.data[i+1] = g * pg;
                imgData.data[i+2] = b * pb;
            }
        }

        ctx.putImageData(imgData, 0, 0);
    }

    render(index) {
        const defaultYOffset = 5;

        let headW = parseInt(this._headImg.width);
        let headH = parseInt(this._headImg.height);

        let hw = this.width * .5;
        let hh = this.height * .5;
        const ctx = this._player.context;

        ctx.clearRect(0, 0, this.width, this.height);
        
        // this._colorHead(Math.random(), Math.random(), Math.random());
        ctx.drawImage(
            this._head.canvas,
            hw - headW * this.scale * .5,
            defaultYOffset + hh - headH * this.scale * .5,
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
            hw - swScaled * .5 - 2 * this.scale,
            defaultYOffset + hh - shScaled * .5 + 1 * this.scale,
            swScaled,
            shScaled
        );

        return this._player.canvas.toDataURL();
    }
}

function renderHat(index) {

}