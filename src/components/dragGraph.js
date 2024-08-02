import {drawRoundedRect} from './util.js'
export const dragGraph = function (x, y, w, h, fillStyle, canvas, graphShape) {
  this.x = x;
  this.y = y;
  this.w = w;
  this.h = h;
  this.fillStyle = fillStyle || "rgba(255, 255, 255 , 1)";
  this.canvas = canvas;
  this.context = canvas.getContext("2d");
  this.canvasPos = canvas.getBoundingClientRect();
  this.graphShape = graphShape;
};

dragGraph.prototype = {
  paint: function () {
    this.context.save();
    this.context.beginPath();
    this.context.fillStyle = this.fillStyle || 'rgba(255, 255, 255 , 1)';
    this.context.translate(window.myscrollX, 0);
    this.shapeDraw();
    this.context.fill();
    this.context.closePath();
    this.context.restore();
  },
  isMouseInGraph: function (mouse) {
    this.context.save();
    this.context.translate(window.myscrollX, 0);
    // this.context.beginPath();
    this.context.fillStyle = this.fillStyle || 'rgba(255, 255, 255 , 1)';
    this.shapeDraw();
    this.context.restore();
    if (this.context.isPointInPath(mouse.x, mouse.y)) {
      if (
        Math.abs(
          mouse.x -
            (this.w * window.xScale +
              this.x * window.xScale +
              window.myscrollX),
        ) < 10
      ) {
        return "edge";
      }
      return 'move';
    }
    return false;
  },
  shapeDraw: function () {
    if (this.graphShape == "circle") {
      this.context.arc(this.x, this.y, 50, 0, Math.PI * 2);
    } else if (this.graphShape == "triangle") {
      this.context.moveTo(this.x + 50, this.y + 50);
      this.context.lineTo(this.x + 100, this.y + 130);
      this.context.lineTo(this.x, this.y + 130);
    } else {

      drawRoundedRect(this.context, this.x * window.xScale, this.y, this.w * window.xScale, this.h,4)
      // this.context.rect(
      //   this.x * window.xScale,
      //   this.y,
      //   this.w * window.xScale,
      //   this.h,
      // );
    }
  },
  drawTheLineonHover: function () {
    this.context.save()
    this.context.fillStyle = "rgba(200, 200, 200, 0.5)";
    this.context.rect(
      0,
      Math.floor(this.y / 20) * 20,
      this.canvas.width,
      this.h,
    );
    this.context.fill();
    this.context.restore()
  },
  erase: function () {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
  },
};
