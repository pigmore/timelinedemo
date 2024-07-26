export const dragGraph = function (x, y, w, h, fillStyle, canvas, graphShape) {
  this.x = x;
  this.y = y;
  this.w = w;
  this.h = h;
  this.fillStyle = fillStyle || "rgba(26, 188, 156 , 0.5)";
  this.canvas = canvas;
  this.context = canvas.getContext("2d");
  this.canvasPos = canvas.getBoundingClientRect();
  this.graphShape = graphShape;
};

dragGraph.prototype = {
  paint: function () {
    this.context.beginPath();
    this.context.fillStyle = this.fillStyle;
    this.shapeDraw();
    this.context.fill();
    this.context.closePath();
  },
  isMouseInGraph: function (mouse) {
    this.context.beginPath();
    this.shapeDraw();
    return this.context.isPointInPath(mouse.x, mouse.y);
  },
  shapeDraw: function () {
    if (this.graphShape == "circle") {
      this.context.arc(this.x, this.y, 50, 0, Math.PI * 2);
    } else if (this.graphShape == "triangle") {
      this.context.moveTo(this.x + 50, this.y + 50);
      this.context.lineTo(this.x + 100, this.y + 130);
      this.context.lineTo(this.x, this.y + 130);
    } else {
      this.context.rect(this.x, this.y, this.w, this.h);
    }
  },
  erase: function () {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
  },
};
