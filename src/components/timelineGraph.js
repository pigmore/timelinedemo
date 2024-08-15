import {
  uuid,
  fitString,
  drawRoundedRect,
  drawLine,
  drawDoubleLine,
  fillEdgeCircle,
} from "./util.js";
export const timelineGraph = function (
  x,
  y,
  w,
  h,
  t,
  type,
  icon,
  fillStyle,
  strokeStyle,
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
  this.strokeStyle = strokeStyle || "rgba(255, 255, 255 , 1)";
  this.canvas = canvas;
  this.context = canvas.getContext("2d");
  this.canvasPos = canvas.getBoundingClientRect();
  this.graphShape = graphShape;
  this.selected = false
};

timelineGraph.prototype = {
  paint: function () {
    this.context.save();
    this.context.beginPath();
    this.context.fillStyle = this.fillStyle || "rgba(255, 255, 255 , 1)";
    this.context.strokeStyle = this.strokeStyle || "rgba(255, 255, 255 , 1)";
    this.context.translate(window.timelineScrollX, 0);

    this.shapeDrawWithCircle();
    if (this.selected == true) {
      this.context.strokeStyle = 'rgba(255, 255, 255 , 1)'
      this.context.fillStyle = 'rgba(255, 255, 255 , 0)'
      this.context.globalCompositeOperation = "lighter"
      this.shapeDraw();
    }

    this.context.fill();
    this.context.closePath();
    if (this.w > 5) {
      this.context.drawImage(
        this.icon,
        this.x * window.timelineXScale + 13,
        this.y + 2,
      );
    }

    if (this.w > 7) {
      this.context.fillStyle = "rgba(255, 255, 255 , 1)";
      this.context.font = "14px Arial";
      this.context.fillText(
        fitString(this.context, this.t, this.w * window.timelineXScale - 50),
        this.x * window.timelineXScale + 38,
        this.y + 17,
      );
    }

    this.context.restore();
  },
  isMouseInGraph: function (mouse) {
    this.context.save();
    this.context.translate(window.timelineScrollX, 0);
    // this.context.beginPath();
    this.context.fillStyle = this.fillStyle || "rgba(255, 255, 255 , 1)";
    this.shapeDraw();
    this.context.restore();
    if (this.context.isPointInPath(mouse.x, mouse.y)) {
      if (
        Math.abs(mouse.x - (this.x * window.timelineXScale + window.timelineScrollX)) < 10
      ) {
        return "edge0";
      }
      if (
        Math.abs(
          mouse.x -
            (this.w * window.timelineXScale +
              this.x * window.timelineXScale +
              window.timelineScrollX),
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
        this.x * window.timelineXScale,
        this.y,
        this.w * window.timelineXScale,
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
        this.x * window.timelineXScale,
        this.y,
        this.w * window.timelineXScale,
        this.h,
        4,
      );
      if (this.w > 1.5) {
        drawDoubleLine(
          this.context,
          this.x * window.timelineXScale + 5,
          this.y + 6,
          this.x * window.timelineXScale + 5,
          this.y + 18,
          this.color,
        );
        drawDoubleLine(
          this.context,
          this.x * window.timelineXScale + this.w * window.timelineXScale - 10,
          this.y + 6,
          this.x * window.timelineXScale + this.w * window.timelineXScale - 10,
          this.y + 18,
          this.color,
        );
      }

      // fillEdgeCircle(
      //   this.context,
      //   this.x * window.timelineXScale,
      //   this.y,
      //   this.w * window.timelineXScale,
      // );
    }
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
  erase: function () {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
  },
};
