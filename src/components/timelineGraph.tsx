import {
  uuid,
  fitString,
  drawRoundedRect,
  drawRoundedRect0,
  drawRoundedRect1,
  drawLine,
  drawDoubleLine,
  fillEdgeCircle,
  between,
} from "./util";

interface TimelinGraphType {
  // Define any props if needed
  id: string;
  attachedPrveiwId: string | null;
  x: number;
  y: number;
  w: number;
  h: number;
  pixRatio: number;
  startPoint: number | null;
  endPoint: number | null;
  duration: number | null;
  t: string;
  type: string;
  icon: HTMLImageElement;
  fillStyle: string;
  strokeStyle: string;
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
}
// interface  TimelineGraphConstructor  = {
//   new (
//     name: string,
//     x: number,
//     y: number,
//     w: number,
//     h: number,
//     t: number,
//     type: type,
//     icon: HTMLImageElement,
//     fillStyle: string,
//     strokeStyle: string,
//     canvas: HTMLCanvasElement,
//     graphShape: graphShape,
//   ):timelinGraphType
// }

export class TimelineGraph {
  id: string;
  x: number;
  y: number;
  w: number;
  startPoint: number;
  endPoint: number;
  duration: number;
  w0: number;
  h: number;
  pixRatio: number;
  t: string;
  type: string;
  icon: HTMLImageElement;
  fillStyle: string;
  strokeStyle: string;
  canvas: HTMLCanvasElement;
  context: CanvasRenderingContext2D;
  graphShape: string;
  selected: boolean;
  hover: boolean;
  layer: number;
  baseLineBottom: number;
  attachedPrveiwId: string;
  ptrn: CanvasPattern | null;
  ptrn0: CanvasPattern | null;
  constructor({
    id,
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
    ctx,
    pixRatio,
    attachedPrveiwId,
    startPoint,
    endPoint,
    duration,
  }: TimelinGraphType) {
    this.id = id;
    this.x = x;
    this.y = y;
    this.w = w;
    this.w0 = w;
    this.h = h;
    this.t = t;
    this.type = type;
    this.icon = icon;
    this.fillStyle = fillStyle || "rgba(255, 255, 255 , 1)";
    this.strokeStyle = strokeStyle || "rgba(255, 255, 255 , 1)";
    this.canvas = canvas;
    this.context = ctx;
    this.pixRatio = pixRatio;
    // this.context!.setTransform(pixRatio, 0, 0, pixRatio, 0, 0);
    this.graphShape = "rectangle";
    this.selected = false;
    this.hover = false;
    this.layer = 0;
    this.startPoint = startPoint || 0;
    this.endPoint = endPoint || 0;
    this.duration = duration || 0;
    this.attachedPrveiwId = attachedPrveiwId || "";
    this.baseLineBottom = this.canvas.height / pixRatio / 1.3;
    if (this.type == 'image'){
      this.ptrn = this.context.createPattern(
        window.imageFrames[this.id],
        "repeat",
      );
      this.ptrn0 = this.context.createPattern(
        window.imageFrames[this.id + "0"],
        "repeat",
      );
    }else{
      this.ptrn = null
      this.ptrn0 = null
    }

  }

  paint() {
    this.context.save();
    this.context.beginPath();
    this.context.fillStyle = this.fillStyle || "rgba(255, 255, 255 , 1)";
    this.context.strokeStyle = this.strokeStyle || "rgba(255, 255, 255 , 1)";
    this.context.translate(window.timelineScrollX, window.timelineScrollY);

    // this.context.fill();
    // this.context.closePath();

    if (this.layer == 0) {
      this.context.save();
      this.context.translate(0, 6);
    }
    const previewID: string = this.attachedPrveiwId || this.id;
    if (
      this.type == "video" &&
      window.imageFrames[previewID]

    ) {
      const _length = window.imageFrames[previewID].length
      if (this.layer == 0) this.context.translate(0, -6);
        // console.log(this.w0,'this.w0')
        // console.log(this.w * window.timelineXScale,'this.w * window.timelineXScale')
        const drawTimes = Math.max(
          Math.floor(
            (this.w0 * window.timelineXScale) /
              (70 * Math.max(_length , 1)),
          ) + 1,
          1,
        );
        // console.log(_length,'_length')
        // console.log(drawTimes,'drawTimes')
        const canvas0 = new OffscreenCanvas(this.w * window.timelineXScale, this.h) as any;
        const ctx = canvas0.getContext("2d");
        ctx!.clearRect(0, 0, canvas0.width, canvas0.height);
        ctx!.fillStyle = "black";
        ctx!.strokeStyle = "black";
        // ctx.globalCompositeOperation = "source-over";
        ctx!.translate(-this.startPoint * window.timelineXScale, 0);
        drawRoundedRect(
          ctx!,
          this.startPoint * window.timelineXScale,
          0,
          this.w * window.timelineXScale - 2,
          this.h - 2,
          4,
        );
        ctx!.clip();
        // ctx.translate(-this.startPoint, 0);
        for (let i = 0; i < _length; i++) {
          if (window.imageFrames[previewID][i]){
            for (let j = 0; j < drawTimes; j++) {
              ctx!.drawImage(
                window.imageFrames[previewID][i].imgel,
                70 * drawTimes * i + 70 * j,
                0,
                70,
                this.h - 2,
              );
            }
          }
        }
        // ctx.globalCompositeOperation = "source-in";

        this.context.drawImage(
          canvas0,
          this.x * window.timelineXScale + 1,
          this.y + 1,
        );
        if (this.selected === true) {
          if (this.layer == 0) this.context.translate(0, 6);
          this.context.fillStyle = this.fillStyle || "rgba(255, 255, 255 , 1)";
          this.context.strokeStyle =
            this.strokeStyle || "rgba(255, 255, 255 , 1)";
          this.context.lineWidth = 1;
          this.drawEdgeButton();
        }

    } else if (this.type == "image") {
      this.context.save();
      this.context.fillStyle =
        this.layer == 0
          ? (this.ptrn as CanvasPattern)
          : (this.ptrn0 as CanvasPattern);
      this.context.translate(
        this.x * window.timelineXScale + 1,
        this.y + (this.layer == 0 ? -5 : 1),
      );
      this.context.fillRect(
        0,
        0,
        this.w * window.timelineXScale - 2,
        this.h - 2,
      );
      this.context.restore();
    } else {
      if ((this.w / 10) * window.timelineXScale > 5) {
        this.context.drawImage(
          this.icon,
          this.x * window.timelineXScale + 13,
          this.y + 4,
        );
      }

      if ((this.w / 10) * window.timelineXScale > 7) {
        this.context.fillStyle = "rgba(255, 255, 255 , 1)";
        this.context.font = "14px Arial";
        this.context.fillText(
          fitString(this.context, this.t, this.w * window.timelineXScale - 50),
          this.x * window.timelineXScale + 38,
          this.y + 19,
        );
      }
    }

    if (this.layer == 0) {
      this.context.restore();
    }
    if (this.selected === true) {
      this.shapeDrawWithCircle();
      this.context.lineWidth = 2;
      this.context.strokeStyle = "rgba(255, 255, 255 , 0.2)";
      this.context.fillStyle = "rgba(255, 255, 255 , 0)";
      this.context.globalCompositeOperation = "lighter";
      this.shapeDraw();
    } else if (this.hover === true) {
      this.shapeDraw();
      this.context.lineWidth = 2;
      this.context.strokeStyle = "rgba(255, 255, 255 , 0.2)";
      this.context.fillStyle = "rgba(255, 255, 255 , 0)";
      this.context.globalCompositeOperation = "lighter";
      this.shapeDraw();
    } else {
      this.context.globalAlpha = 0.6;
      this.shapeDraw();
    }

    this.context.globalCompositeOperation = "source-over";

    this.context.restore();
  }
  isMouseInGraph(mouse: { x: number; y: number }) {
    // console.log(mouse.x, mouse.y, "isMouseInGraphx,y");
    this.context.save();
    this.context.translate(window.timelineScrollX, window.timelineScrollY);
    this.context.fillStyle = "rgba(255, 255, 255 , 0)";
    this.context.strokeStyle = "rgba(255, 255, 255 , 0)";
    this.shapeDraw();
    this.context.restore();
    if (
      this.context.isPointInPath(
        mouse.x * this.pixRatio,
        mouse.y * this.pixRatio,
      )
    ) {
      if (
        Math.abs(
          mouse.x - (this.x * window.timelineXScale + window.timelineScrollX),
        ) < 10
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
  }
  shapeDraw() {
    // this.context.fillStyle = 'white'
    // this.context.strokeStyle = 'white'
    drawRoundedRect(
      this.context,
      this.x * window.timelineXScale,
      this.y,
      this.w * window.timelineXScale,
      this.h,
      4,
    );
  }
  // layerSwitch(_y) {}
  drawEdgeButton() {
    if (this.w > 1.5) {
      drawRoundedRect0(
        this.context,
        this.x * window.timelineXScale,
        this.y + 6,
        6,
        16,
        2,
      );
      drawRoundedRect1(
        this.context,
        this.x * window.timelineXScale + this.w * window.timelineXScale - 6,
        this.y + 6,
        6,
        16,
        2,
      );
      this.context.fillStyle = "white";
      this.context.strokeStyle = "white";
      drawRoundedRect(
        this.context,
        this.x * window.timelineXScale + 3,
        this.y + 9,
        1,
        10,
        0,
      );
      drawRoundedRect(
        this.context,
        this.x * window.timelineXScale + this.w * window.timelineXScale - 3,
        this.y + 9,
        1,
        10,
        0,
      );
    }
  }
  shapeDrawWithCircle() {
    this.context.save();
    drawRoundedRect(
      this.context,
      this.x * window.timelineXScale,
      this.y,
      this.w * window.timelineXScale,
      this.h,
      6,
    );
    if (this.layer == 0) {
      this.context.save();
      this.context.translate(0, 6);
    }
    this.drawEdgeButton();

    if (this.layer == 0) {
      this.context.restore();
    }

    this.context.restore();
  }
  drawTheXAttach(_x: number) {
    this.context.save();
    this.context.translate(window.timelineScrollX, 0);
    this.context.setLineDash([4, 5]);
    drawLine(
      this.context,
      _x * window.timelineXScale,
      0,
      _x * window.timelineXScale,
      this.canvas.height,
      "rgba(255, 255, 255, 1)",
    );
    this.context.restore();
  }

  checkisGap(_y: number) {
    let result: boolean = false;

    if (_y < this.baseLineBottom - 24) {
      let y0: number = Math.abs(_y - (this.baseLineBottom - 24)) % 34;
      if (between(y0, 0, 5)) {
        result = true;
      }
    } else if (_y > this.baseLineBottom + 20) {
      let y0: number = (_y - (this.baseLineBottom + 20)) % 34;
      if (between(y0, 0, 3)) {
        result = true;
      }
    }

    return result;
  }
  mapYposition(_y: number) {
    let result: number = 0;
    if (_y < this.baseLineBottom - 24) {
      result =
        Math.floor((_y - this.baseLineBottom + 24) / 34) * 34 +
        this.baseLineBottom -
        24 -
        3;
    } else if (_y > this.baseLineBottom + 20) {
      result =
        Math.floor((_y - this.baseLineBottom - 20) / 34) * 34 +
        this.baseLineBottom +
        20;
    } else if (
      _y >= this.baseLineBottom - 24 &&
      _y <= this.baseLineBottom + 20
    ) {
      result = this.baseLineBottom - 24;
    }

    return result;
  }
  calLayer(_y: number) {
    let result: number = 0;
    // console.log(_y)
    // console.log(this.baseLineBottom - 24)
    // debugger;
    if (_y < this.baseLineBottom - 24) {
      result = -Math.floor((_y - this.baseLineBottom + 24) / 34);
    } else if (_y > this.baseLineBottom + 10) {
      result = -Math.floor((_y - this.baseLineBottom - 20) / 34) - 1;
    } else if (
      _y >= this.baseLineBottom - 24 &&
      _y <= this.baseLineBottom + 10
    ) {
      result = 0;
    }
    console.log(
      "calLayer",
      _y,
      this.baseLineBottom - 24,
      this.baseLineBottom + 20,
      result,
    );
    return result;
  }
  drawTheLineonHover() {
    this.context.save();
    this.context.translate(window.timelineScrollX, window.timelineScrollY);
    this.context.fillStyle = "rgba(200, 200, 200, 0.5)";

    const _y = this.mapYposition(this.y + 10);
    this.context.rect(
      0,
      _y + (this.checkisGap(this.y + 10) ? 29 : 0),
      this.canvas.width,
      this.checkisGap(this.y + 10) ? 3 : this.calLayer(_y + 10) == 0 ? 40 : 28,
    );
    this.context.fill();
    this.context.restore();
  }
  drawVirtuRect(_x: number, _y: number) {
    this.context.save();
    this.context.translate(window.timelineScrollX, window.timelineScrollY);
    this.context.fillStyle = this.fillStyle;
    this.context.globalAlpha = 0.5;
    drawRoundedRect(
      this.context,
      _x * window.timelineXScale,
      _y,
      this.w * window.timelineXScale,
      _y > this.baseLineBottom - 25 && _y < this.baseLineBottom + 24 ? 40 : 28,
      4,
    );
    this.context.fill();
    this.context.restore();
  }
  erase() {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }
}
