import {
  uuid,
  fitString,
  drawRoundedRect,
  drawLine,
  drawDoubleLine,
  fillEdgeCircle,
} from "./util.js";
export const dragGraph = function (
  x,
  y,
  w,
  h,
  t,
  type,
  icon,
  fillStyle,
  canvas,
  graphShape,
) {
  this.id = uuid();
  this.x = x;
  this.y = y;
  this.w = w;
  this.h = h;
  this.t = t;
  this.type = type;
  this.icon = icon;
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
    this.context.fillStyle = this.fillStyle || "rgba(255, 255, 255 , 1)";
    this.context.translate(window.myscrollX, 0);
    this.shapeDrawWithCircle();
    this.context.fill();
    this.context.closePath();
    this.context.drawImage(this.icon, this.x * window.xScale + 12, this.y + 2);
    this.context.fillStyle = "rgba(255, 255, 255 , 1)";
    this.context.font = "14px Arial";
    if (this.w > 3) {
      this.context.fillText(
        fitString(this.context, this.t, this.w * window.xScale - 25),
        this.x * window.xScale + 38,
        this.y + 17,
      );
    }

    this.context.restore();
  },
  isMouseInGraph: function (mouse) {
    this.context.save();
    this.context.translate(window.myscrollX, 0);
    // this.context.beginPath();
    this.context.fillStyle = this.fillStyle || "rgba(255, 255, 255 , 1)";
    this.shapeDraw();
    this.context.restore();
    if (this.context.isPointInPath(mouse.x, mouse.y)) {
      if (
        Math.abs(mouse.x - (this.x * window.xScale + window.myscrollX)) < 10
      ) {
        return "edge0";
      }
      if (
        Math.abs(
          mouse.x -
            (this.w * window.xScale +
              this.x * window.xScale +
              window.myscrollX),
        ) < 10
      ) {
        return "edge1";
      }
      return "move";
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
      drawRoundedRect(
        this.context,
        this.x * window.xScale,
        this.y,
        this.w * window.xScale,
        this.h,
        4,
      );
    }
  },
  shapeDrawWithCircle: function () {
    if (this.graphShape == "circle") {
      this.context.arc(this.x, this.y, 50, 0, Math.PI * 2);
    } else if (this.graphShape == "triangle") {
      this.context.moveTo(this.x + 50, this.y + 50);
      this.context.lineTo(this.x + 100, this.y + 130);
      this.context.lineTo(this.x, this.y + 130);
    } else {
      drawRoundedRect(
        this.context,
        this.x * window.xScale,
        this.y,
        this.w * window.xScale,
        this.h,
        4,
      );
      if (this.w > 1.5) {
        drawDoubleLine(
          this.context,
          this.x * window.xScale + 5,
          this.y + 4,
          this.x * window.xScale + 5,
          this.y + 20,
        )
        drawDoubleLine(
          this.context,
          this.x * window.xScale + this.w * window.xScale - 10,
          this.y + 4,
          this.x * window.xScale + this.w * window.xScale - 10,
          this.y + 20,
        )
      }

      // fillEdgeCircle(
      //   this.context,
      //   this.x * window.xScale,
      //   this.y,
      //   this.w * window.xScale,
      // );
    }
  },
  drawTheXAttach: function (_x) {
    // console.log('drawTheXAttach',_x)
    this.context.save();
    this.context.translate(window.myscrollX, 0);
    drawLine(
      this.context,
      _x * window.xScale,
      0,
      _x * window.xScale,
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
  erase: function () {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
  },
};
