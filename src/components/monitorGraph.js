import {
  uuid,
  fitString,
  drawRoundedRect,
  drawLine,
  drawRect,
  drawDoubleLine,
  drawFoucsLine,
  fillEdgeCircle,
} from "./util.js";
export const monitorGraph = function (
  x,
  y,
  w,
  h,
  r,
  s,
  text,
  type,
  imageLoadedSrc,
  canvas,
  initconfig = {
    fontSize: 0,
  },
) {
  this.initconfig = initconfig;
  this.id = uuid();
  this.canvas = canvas;
  this.ctx = canvas.getContext("2d");
  if (type === "textbox") {
    // this.ctx.setFontSize(initconfig.fontSize || 16);
    // var fontArgs = this.ctx.font.split(' ');
    var newSize = `${this.initconfig.fontSize}px`;
    this.ctx.font = newSize + ' ' + this.initconfig.fontFamily;
    const textWidth = this.ctx.measureText(this.initconfig.text).width;
    const textHeight = this.initconfig.fontSize + 10;
    this.text = this.initconfig.text
    // debugger;
    this.centerX = x + textWidth / 2;
    this.centerY = y + textHeight / 2;
    this.x = x;
    this.y = y;
    this.w = textWidth;
    this.h = textHeight;
  } else {
    this.centerX = x + w / 2;
    this.centerX0 = x + w / 2;
    this.centerY = y + h / 2;
    this.centerY0 = y + h / 2;
    this.w = w;
    this.w0 = w;
    this.h = h;
    this.h0 = h;
  }
  this.x = x;
  this.x0 = x;
  this.y = y;
  this.y0 = y;
  this.scale = s;
  this.rotate = r;
  this.rotate0 = r;

  // 4个顶点坐标
  this.square = [
    [this.x, this.y],
    [this.x + this.w, this.y],
    [this.x + this.w, this.y + this.h],
    [this.x, this.y + this.h],
  ];

  this.text = text;
  this.type = type;
  this.imageLoadedSrc = imageLoadedSrc;
  this.canvas = canvas;
  this.ctx = canvas.getContext("2d");

  this.selected = false;
  this.onfocus = false;
  this.focused = false;
  this.drawCount = 0;
  this.focusIndex = 0;
};

monitorGraph.prototype = {
  paint: function () {
    this.ctx.save();

    // 旋转元素
    this.ctx.translate(this.centerX, this.centerY);
    this.ctx.rotate((this.rotate * Math.PI) / 180);
    switch (this.type) {
      case 'textbox':


        if (!this.focused) {
          this.ctx.fillStyle = this.initconfig.fill;
          this.ctx.font = `${this.initconfig.fontSize}px ${this.initconfig.fontFamily}`;
          this.ctx.textAlign = 'center';
          this.ctx.strokeStyle = this.initconfig.stroke;
          this.ctx.strokeWidth = this.initconfig.strokeWidth;
          this.ctx.fillText(
            this.text,
            0,
            this.initconfig.fontSize / 3,
          );
          this.ctx.strokeText(
            this.text,
            0,
            this.initconfig.fontSize / 3,
          );

        }else{

            // this.ctx.setFontSize(initconfig.fontSize || 16);
            // var fontArgs = this.ctx.font.split(' ');
            // var newSize = `${this.initconfig.fontSize}px`;
            // this.ctx.font = newSize + ' ' + this.initconfig.fontFamily;
            const textWidth = this.ctx.measureText(this.text).width;
            const textHeight = this.initconfig.fontSize + 10;
            // this.text = this.initconfig.text
            // debugger;
            // this.centerX = x + textWidth / 2;
            // this.centerY = y + textHeight / 2;
            this.x = this.centerX - textWidth / 2;
            this.y = this.centerY - textHeight / 2;
            this.w = textWidth;
            this.h = textHeight;
          }
        
        break;
      case "image":
        // this.ctx.translate(-this.centerX, -this.centerY);
        // this.ctx.drawImage(this.imageLoadedSrc, this.x, this.y, this.w, this.h);
        // break;
      case "avatar":
        this.ctx.translate(-this.centerX, -this.centerY);
        this.ctx.drawImage(this.imageLoadedSrc, this.x, this.y, this.w, this.h);
        break;
      default:
    }
    this.ctx.restore();
  },

  isinRotate: function (x, y) {
    if (
      Math.abs(
        x -
          ((this.square[1][0] - this.square[0][0]) / 2 +
            this.square[0][0] +
            Math.sin((this.rotate * Math.PI) / 180) * 30),
      ) < 8 &&
      Math.abs(
        y -
          ((this.square[1][1] - this.square[0][1]) / 2 +
            this.square[0][1] -
            Math.cos((this.rotate * Math.PI) / 180) * 30),
      ) < 8
    ) {
      return true;
    }
    return false;
  },
  isinCorner: function (x, y) {
    if (
      (Math.abs(x - this.square[0][0]) < 8 &&
        Math.abs(y - this.square[0][1]) < 8) ||
      (Math.abs(x - this.square[1][0]) < 8 &&
        Math.abs(y - this.square[1][1]) < 8) ||
      (Math.abs(x - this.square[2][0]) < 8 &&
        Math.abs(y - this.square[2][1]) < 8) ||
      (Math.abs(x - this.square[3][0]) < 8 &&
        Math.abs(y - this.square[3][1]) < 8)
    ) {
      return true;
    }
    return false;
  },
  isMouseInGraph: function (mouse) {
    this.ctx.save();
    // this.ctx.translate(window.timelineScrollX, 0);
    // this.context.beginPath();
    // this.context.fillStyle = this.fillStyle || "rgba(255, 255, 255 , 1)";
    drawRect(this.ctx, this.square);
    this.ctx.restore();
    // console.log("isMouseInGraph");
    if (this.isinCorner(mouse.x, mouse.y)) {
      // console.log("scale");
      return "scale";
    }
    if (this.isinRotate(mouse.x, mouse.y)) {
      // console.log("rotate");
      return "rotate";
    }
    if (this.ctx.isPointInPath(mouse.x, mouse.y)) {
      // console.log("move");
      return "move";
    }

    return false;
  },

  drawTheXAttach: function (_x) {
    // console.log('drawTheXAttach',_x)
    this.context.save();
    this.context.translate(window.timelineScrollX, 0);
    drawLine(
      this.context,
      _x * window.timelineXScale,
      0,
      _x * window.timelineXScale,
      this.canvas.height,
    );
    this.context.restore();
  },
  drawTheLineonHover: function () {
    this.context.save();
    this.context.fillStyle = "rgba(200, 200, 200, 0.5)";
    this.context.rect(
      0,
      Math.floor((this.y + 10) / 28) * 28,
      this.canvas.width,
      this.h,
    );
    this.context.fill();
    this.context.restore();
  },
  _rotateSquare: function () {
    this.square = [
      this._rotatePoint(
        this.x,
        this.y,
        this.centerX,
        this.centerY,
        this.rotate,
      ),
      this._rotatePoint(
        this.x + this.w,
        this.y,
        this.centerX,
        this.centerY,
        this.rotate,
      ),
      this._rotatePoint(
        this.x + this.w,
        this.y + this.h,
        this.centerX,
        this.centerY,
        this.rotate,
      ),
      this._rotatePoint(
        this.x,
        this.y + this.h,
        this.centerX,
        this.centerY,
        this.rotate,
      ),
    ];
  },
  _rotatePoint: function (x, y, centerX, centerY, degrees) {
    // console.log(x, y, centerX, centerY, degrees)
    let newX =
      (x - centerX) * Math.cos((degrees * Math.PI) / 180) -
      (y - centerY) * Math.sin((degrees * Math.PI) / 180) +
      centerX;
    let newY =
      (x - centerX) * Math.sin((degrees * Math.PI) / 180) +
      (y - centerY) * Math.cos((degrees * Math.PI) / 180) +
      centerY;
    return [newX, newY];
  },
  rotateAction(px, py, x, y, currentGraph) {
    const diffXBefore = px - this.centerX;
    const diffYBefore = py - this.centerY;
    const diffXAfter = x - this.centerX;
    const diffYAfter = y - this.centerY;

    const angleBefore = (Math.atan2(diffYBefore, diffXBefore) / Math.PI) * 180;
    const angleAfter = (Math.atan2(diffYAfter, diffXAfter) / Math.PI) * 180;

    this.rotate = currentGraph.rotate + angleAfter - angleBefore;
    if (Math.abs(this.rotate % 360) < 3) {
      this.rotate = 0.0;
    }
  },

  transform(px, py, x, y, currentGraph) {
    // 获取选择区域的宽度高度
    if (this.type === "text") {
      this.ctx.setFontSize(this.fontSize);
      const textWidth = this.ctx.measureText(this.text).width;
      const textHeight = this.fontSize + 10;
      this.w = textWidth;
      this.h = textHeight;
      // 字体区域中心点不变，左上角位移
      this.x = this.centerX - textWidth / 2;
      this.y = this.centerY - textHeight / 2;
    }

    const diffXBefore = Math.abs(px - this.centerX);
    const diffYBefore = Math.abs(py - this.centerY);
    const diffXAfter = Math.abs(x - this.centerX);
    const diffYAfter = Math.abs(y - this.centerY);

    const angleBefore = (Math.atan2(diffYBefore, diffXBefore) / Math.PI) * 180;
    const angleAfter = (Math.atan2(diffYAfter, diffXAfter) / Math.PI) * 180;

    const lineA = Math.sqrt(
      Math.pow(this.centerX - px, 2) + Math.pow(this.centerY - py, 2),
    );
    const lineB = Math.sqrt(
      Math.pow(this.centerX - x, 2) + Math.pow(this.centerY - y, 2),
    );
    console.log(diffXBefore, "diffXBefore");
    console.log(diffXAfter, "diffXAfter");
    const resize_rito = Math.min(
      diffXAfter / diffXBefore,
      diffYAfter / diffYBefore,
    );
    if (this.type === "image" || this.type === "avatar") {
      // let resize_rito = lineB / lineA
      let new_w = currentGraph.w * resize_rito;
      let new_h = currentGraph.h * resize_rito;
      let new_s = currentGraph.s * resize_rito;

      // if (this.w < this.h && new_w < this.MIN_WIDTH) {
      //   new_w = this.MIN_WIDTH
      //   new_h = (this.MIN_WIDTH * this.h) / this.w
      //   new_s = this.MIN_WIDTH / this.w * this.scale
      // } else if (this.h < this.w && new_h < this.MIN_WIDTH) {
      //   new_h = this.MIN_WIDTH
      //   new_w = (this.MIN_WIDTH * this.w) / this.h
      //   new_s = this.MIN_WIDTH / this.w * this.scale
      // }
      // this.x = this.x - (new_w - this.w) / 2
      // this.y = this.y -(new_h - this.y) / 2
      this.w = new_w;
      this.h = new_h;
      this.scale = new_s;
      this.x = this.centerX - new_w / 2;
      this.y = this.centerY - new_h / 2;
      // this.centerX = this.x + this.w / 2
      // this.centerY = this.y + this.h / 2
    }
    // else if (this.type === 'text') {
    //   const fontSize = currentGraph.fontSize * ((lineB - lineA) / lineA + 1)
    //   this.fontSize =
    //     fontSize <= this.MIN_FONTSIZE ? this.MIN_FONTSIZE : fontSize
    //
    //   // 旋转位移后重新计算坐标
    //   this.ctx.setFontSize(this.fontSize)
    //   const textWidth = this.ctx.measureText(this.text).width
    //   const textHeight = this.fontSize + 10
    //   this.w = textWidth
    //   this.h = textHeight
    //   // 字体区域中心点不变，左上角位移
    //   this.x = this.centerX - textWidth / 2
    //   this.y = this.centerY - textHeight / 2
    // }
  },
  erase: function () {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  },
};
