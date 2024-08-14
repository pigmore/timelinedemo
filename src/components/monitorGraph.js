import {
  uuid,
  fitString,
  drawRoundedRect,
  drawLine,
  drawRect,
  drawDoubleLine,
  fillEdgeCircle,
} from "./util.js";
export const monitorGraph = function (
  x,
  y,
  w,
  h,
  r,
  text,
  type,
  imageLoadedSrc,
  canvas,
  initconfig = {
    fontSize:0
  }
) {
  this.id = uuid();
  this.canvas = canvas;
  this.ctx = canvas.getContext("2d");
  if (type === 'Text') {
    this.ctx.setFontSize(initconfig.fontSize || 16)
    const textWidth = this.ctx.measureText(text).width
    const textHeight = initconfig.fontSize + 10
    this.centerX = x + textWidth / 2
    this.centerY = y + textHeight / 2
    this.w = textWidth
    this.h = textHeight
  } else {
    this.centerX = x + w / 2
    this.centerX0 = x + w / 2
    this.centerY = y + h / 2
    this.centerY0 = y + h / 2
    this.w = w
    this.w0 = w
    this.h = h
    this.h0 = h
  }
    this.x = x
    this.x0 = x
    this.y = y
    this.y0 = y
    this.rotate = r
    this.rotate0 = r

  // 4个顶点坐标
  this.square = [
    [this.x, this.y],
    [this.x + this.w, this.y],
    [this.x + this.w, this.y + this.h],
    [this.x, this.y + this.h]
  ]

  this.text = text;
  this.type = type;
  this.imageLoadedSrc = imageLoadedSrc;
  this.canvas = canvas;
  this.ctx = canvas.getContext("2d");
  this.initconfig = initconfig;
  this.selected = false;
};

monitorGraph.prototype = {
  paint: function () {
    this.ctx.save();

    // 旋转元素
    this.ctx.translate(this.centerX, this.centerY)
    this.ctx.rotate((this.rotate * Math.PI) / 180)
    switch (this.type) {
      case 'Image':
        this.ctx.translate(-this.centerX, -this.centerY)
        this.ctx.drawImage(this.imageLoadedSrc, this.x, this.y, this.w, this.h)
        break;
      default:

    }
    this.ctx.restore();
  },

  isinCorner: function (mouse) {
    if (
      Math.abs(mouse.x - this.square[0][0]) < 8 && Math.abs(mouse.y - this.square[0][1]) < 8
      || Math.abs(mouse.x - this.square[1][0]) < 8 && Math.abs(mouse.y - this.square[1][1]) < 8
      || Math.abs(mouse.x - this.square[2][0]) < 8 && Math.abs(mouse.y - this.square[2][1]) < 8
      || Math.abs(mouse.x - this.square[3][0]) < 8 && Math.abs(mouse.y - this.square[3][1]) < 8

    ) {
      return true
    }
    return false
  },
  isMouseInGraph: function (mouse) {
    this.ctx.save();
    // this.ctx.translate(window.timelineScrollX, 0);
    // this.context.beginPath();
    // this.context.fillStyle = this.fillStyle || "rgba(255, 255, 255 , 1)";
    drawRect(this.ctx,this.square);
    this.ctx.restore();
    if (this.isinCorner(mouse)){
      return "scale"
    }
    if (this.ctx.isPointInPath(mouse.x, mouse.y)) {

      return "move";
    }

    return false;
  },

  // shapeDraw: function () {
  //   if (this.graphShape == "circle") {
  //     this.context.arc(this.x, this.y, 50, 0, Math.PI * 2);
  //   } else if (this.graphShape == "triangle") {
  //     this.context.moveTo(this.x + 50, this.y + 50);
  //     this.context.lineTo(this.x + 100, this.y + 130);
  //     this.context.lineTo(this.x, this.y + 130);
  //   } else {
  //     drawRoundedRect(
  //       this.context,
  //       this.x * window.timelineXScale,
  //       this.y,
  //       this.w * window.timelineXScale,
  //       this.h,
  //       4,
  //     );
  //   }
  // },
  // shapeDrawWithCircle: function () {
  //   if (this.graphShape == "circle") {
  //     this.context.arc(this.x, this.y, 50, 0, Math.PI * 2);
  //   } else if (this.graphShape == "triangle") {
  //     this.context.moveTo(this.x + 50, this.y + 50);
  //     this.context.lineTo(this.x + 100, this.y + 130);
  //     this.context.lineTo(this.x, this.y + 130);
  //   } else {
  //     drawRoundedRect(
  //       this.context,
  //       this.x * window.timelineXScale,
  //       this.y,
  //       this.w * window.timelineXScale,
  //       this.h,
  //       4,
  //     );
  //     if (this.w > 1.5) {
  //       drawDoubleLine(
  //         this.context,
  //         this.x * window.timelineXScale + 5,
  //         this.y + 6,
  //         this.x * window.timelineXScale + 5,
  //         this.y + 18,
  //         this.color,
  //       );
  //       drawDoubleLine(
  //         this.context,
  //         this.x * window.timelineXScale + this.w * window.timelineXScale - 10,
  //         this.y + 6,
  //         this.x * window.timelineXScale + this.w * window.timelineXScale - 10,
  //         this.y + 18,
  //         this.color,
  //       );
  //     }
  //
  //     // fillEdgeCircle(
  //     //   this.context,
  //     //   this.x * window.timelineXScale,
  //     //   this.y,
  //     //   this.w * window.timelineXScale,
  //     // );
  //   }
  // },
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
  _rotateSquare: function() {
    this.square = [
      this._rotatePoint(
        this.x,
        this.y,
        this.centerX,
        this.centerY,
        this.rotate
      ),
      this._rotatePoint(
        this.x + this.w,
        this.y,
        this.centerX,
        this.centerY,
        this.rotate
      ),
      this._rotatePoint(
        this.x + this.w,
        this.y + this.h,
        this.centerX,
        this.centerY,
        this.rotate
      ),
      this._rotatePoint(
        this.x,
        this.y + this.h,
        this.centerX,
        this.centerY,
        this.rotate
      )
    ]
  },
  _rotatePoint: function(x, y, centerX, centerY, degrees) {
    // console.log(x, y, centerX, centerY, degrees)
    let newX =
      (x - centerX) * Math.cos((degrees * Math.PI) / 180) -
      (y - centerY) * Math.sin((degrees * Math.PI) / 180) +
      centerX
    let newY =
      (x - centerX) * Math.sin((degrees * Math.PI) / 180) +
      (y - centerY) * Math.cos((degrees * Math.PI) / 180) +
      centerY
    return [newX, newY]
  },
  erase: function () {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
  },
};
