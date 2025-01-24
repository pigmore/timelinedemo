import {
  uuid,
  fitString,
  drawRoundedRect,
  drawLine,
  drawRect,
  drawDoubleLine,
  drawFoucsLine,
  fillEdgeCircle,
  drawString,
  getVectorLenth,
} from "./util";
import { EditorEvents, editorEventBus } from "./event-tool";

interface InitConfig {
  fontSize?: number;
  fontFamily?: string;
  fill?: string;
  text?: string;
  stroke?: string;
  lineWidth?: number;
  [key: string]: any;
}

interface MonitorGraphType {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  s: number;
  r: number;
  startTime: number;
  startPoint: number;
  endPoint: number;
  endTime: number;
  initconfig: InitConfig | any;
  loadedSrc: HTMLVideoElement | HTMLImageElement | null;
  text: string | null;
  type: string;
  url: string;
  // fillStyle: string;
  // strokeStyle: string;
  canvas: HTMLCanvasElement;
  // [key: string]: any;
}

export class MonitorGraph {
  id: string;
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  initconfig?: InitConfig;
  centerX: number;
  centerX0: number;
  centerY: number;
  centerY0: number;
  x: number;
  y: number;
  w: number;
  w0: number;
  h: number;
  h0: number;
  scale: number;
  scaleX: number;
  scaleY: number;
  rotate: number;
  opacity: number;
  startTime: number;
  endTime: number;
  startPoint?: number;
  endPoint?: number;
  layer_number?: number;
  square: number[][];
  squareMiddle: number[][];
  text: string | null;
  type: string;
  url: string;
  loadedSrc: any;
  selected: boolean;
  onfocus: boolean;
  focused: boolean;
  drawCount: number;
  focusIndex: number;
  playCurrentTime: number;
  duration: number;
  volume: number;

  constructor({
    id,
    canvas,
    initconfig,
    x,
    y,
    w,
    h,
    s,
    r,
    text,
    type,
    url,
    loadedSrc,
    startTime,
    endTime,
    startPoint,
    endPoint,
  }: MonitorGraphType) {
    this.id = id;
    this.canvas = canvas;
    this.initconfig = initconfig;
    this.ctx = canvas.getContext("2d")!;
    if (type === "textbox") {
      const newSize = `${this.initconfig!.fontSize!}px`;
      this.ctx.font = newSize + " " + this.initconfig!.fontFamily!;
      const textWidth = this.ctx.measureText(
        this.getLongestStr(this.initconfig!.text!),
      ).width;
      const textHeight =
        this.initconfig!.fontSize! * this.initconfig!.text!.split("\n").length +
        10;
      this.text = this.initconfig!.text as string;
      this.centerX = x + textWidth / 2;
      this.centerY = y + textHeight / 2;
      this.centerX0 = x + textWidth / 2;
      this.centerY0 = y + textHeight / 2;
      this.x = x;
      this.y = y;
      this.w = textWidth + 20;
      this.h = textHeight;
      this.w0 = textWidth + 20;
      this.h0 = textHeight;
    } else {
      this.centerX = x + w / 2;
      this.centerX0 = x + w / 2;
      this.centerY = y + h / 2;
      this.centerY0 = y + h / 2;
      this.w = w;
      this.w0 = w;
      this.h = h;
      this.h0 = h;
      this.text = text;
    }
    this.x = x;
    // this.x0 = x;
    this.y = y;
    // this.y0 = y;
    this.scale = s;
    this.opacity = this.initconfig!.opacity || 1;
    this.scaleX = s;
    this.scaleY = s;
    this.rotate = r;
    // this.rotate0 = r;
    this.startTime = startTime as number;
    this.endTime = endTime;
    this.startPoint = startPoint || 0;
    this.endPoint = endPoint || 0;
    this.layer_number = 0;

    this.square = [
      [-this.w / 2, -this.h / 2],
      [-this.w / 2 + this.w, -this.h / 2],
      [-this.w / 2 + this.w, -this.h / 2 + this.h],
      [-this.w / 2, -this.h / 2 + this.h],
    ];
    this.squareMiddle = [
      [0, -this.h / 2],
      [this.w / 2, 0],
      [0, this.h / 2],
      [-this.w / 2, 0],
    ];

    this.type = type;
    this.url = url;
    this.loadedSrc = loadedSrc;
    this.loadedSrc.id = id;
    this.selected = false;
    this.onfocus = false;
    this.focused = false;
    this.drawCount = 0;
    this.focusIndex = 0;
    this.playCurrentTime = 0;
    this.duration = 0;
    this.volume = this.initconfig!.volume || 1;
    if (this.type == "video" || this.type == "audio") {
      console.log(this.loadedSrc);
      this.loadedSrc.addEventListener("seeked", (event: any) => {
        editorEventBus.emit(EditorEvents.redrawMonitor, false as any);
      });
    }
  }

  forceUpdateTime(): void {
    this.playCurrentTime =
      window.currentTime - this.startTime + (this.startPoint || 0);

    if (this.type == "textbox") {
      this.calculateTextWidth();
    }
    if (this.type == "video") {
      (this.loadedSrc as HTMLVideoElement).currentTime = Math.max(
        0,
        Math.min(
          (this.loadedSrc as HTMLVideoElement).duration,
          this.playCurrentTime / 1000,
        ),
      );
      (this.loadedSrc as HTMLVideoElement).volume = Math.max(
        0,
        Math.min(1, this.volume),
      );
    }
    if (this.type == "audio") {
      (this.loadedSrc as HTMLAudioElement).currentTime = Math.max(
        0,
        Math.min(
          (this.loadedSrc as HTMLAudioElement).duration,
          this.playCurrentTime / 1000,
        ),
      );
      (this.loadedSrc as HTMLAudioElement).volume = Math.max(
        0,
        Math.min(1, this.volume),
      );
    }
  }
  getLongestStr(_string: string): string {
    const longestStr: string = _string.split("\n").reduce(function (
      a: string,
      b: string,
    ) {
      return a.length > b.length ? a : b;
    });
    return longestStr;
  }
  calculateTextWidth(): void {
    this.ctx.font = `${this.initconfig!.fontSize}px ${this.initconfig!.fontFamily}`;

    const textWidth = this.ctx.measureText(
      this.getLongestStr(this.text!),
    ).width;
    const textHeight =
      this.initconfig!.fontSize! * this.text!.split("\n").length + 10;
    // this.text = this.initconfig!.text as string;
    // this.centerX = this.x + textWidth / 2;
    // this.centerY = this.y + textHeight / 2;

    this.w = textWidth + 20;
    this.h = textHeight;
    // this.x = this.centerX - textWidth / 2;
    // this.y = this.centerY - textHeight / 2;
  }
  updateTime(): void {
    this.playCurrentTime =
      window.currentTime - this.startTime + (this.startPoint || 0);
    if (this.type == "audio" || this.type == "video") {
      if (
        this.playCurrentTime > this.endPoint! &&
        !this.loadedSrc.paused &&
        this.loadedSrc.playId == this.id
      ) {
        this.loadedSrc.pause();
      }
    }
  }
  checkIfinTime(): boolean {
    if (
      this.startTime <= window.currentTime &&
      this.endTime > window.currentTime
    ) {
      return true;
    }
    // this.selected = false;
    // this.onfocus = false;
    // this.focused = false;
    return false;
  }
  paint(_forceUpdate: boolean = false): void {
    if (_forceUpdate) {
      this.forceUpdateTime();
    } else {
      this.updateTime();
    }

    if (!this.checkIfinTime()) return;

    this.ctx.save();
    // this.ctx.scale(window.zoomScale,window.zoomScale)
    this.ctx.translate(this.centerX, this.centerY);
    this.ctx.rotate((this.rotate * Math.PI) / 180);
    switch (this.type) {
      case "textbox":
        if (!this.focused) {
          this.ctx.fillStyle = this.initconfig!.fill!;
          this.ctx.font = `${this.initconfig!.bold ? "Bold" : ""} ${this.initconfig!.italic ? "Italic" : ""} ${this.initconfig!.fontSize}px ${this.initconfig!.fontFamily}`;
          this.ctx.textAlign = this.initconfig!.textAlign!;
          this.ctx.strokeStyle = this.initconfig!.stroke!;
          this.ctx.lineWidth = this.initconfig!.lineWidth!;
          // this.ctx.fillText(this.text as string, 0, this.initconfig!.fontSize! / 3);
          // this.ctx.strokeText(this.text as string, 0, this.initconfig!.fontSize! / 3);
          drawString(
            this.ctx,
            this.text as string,
            0,
            0,
            this.initconfig!.fill!,
            0,
            `${this.initconfig!.fontSize}px ${this.initconfig!.fontFamily}`,
            this.initconfig!.fontSize!,
            this.initconfig!.textAlign!,
            this.w - 10,
            this.initconfig!.underline || false,
          );
        }
        break;
      case "video":
        if (
          this.playCurrentTime < this.endPoint! &&
          this.loadedSrc.paused &&
          window.akoolEditorState == "playing"
        ) {
          this.loadedSrc.currentTime = Math.max(
            0,
            Math.min(this.loadedSrc.duration, this.playCurrentTime / 1000),
          );
          console.log("paint play", this.playCurrentTime, this.endPoint);
          this.loadedSrc.play();
          this.loadedSrc.playId = this.id;
        }
        if (
          this.playCurrentTime < this.endPoint! &&
          !this.loadedSrc.paused &&
          window.akoolEditorState == "paused" &&
          this.loadedSrc.playId == this.id
        ) {
          this.loadedSrc.currentTime = Math.max(
            0,
            Math.min(this.loadedSrc.duration, this.playCurrentTime / 1000),
          );
          this.loadedSrc.pause();
        }

        // this.ctx.translate(-this.centerX, -this.centerY);
        this.ctx.drawImage(
          this.loadedSrc,
          -this.w / 2,
          -this.h / 2,
          this.w,
          this.h,
        );
        break;
      case "audio":
        if (
          this.playCurrentTime < this.endPoint! &&
          this.loadedSrc.paused &&
          window.akoolEditorState == "playing"
        ) {
          this.loadedSrc.currentTime = Math.max(
            0,
            Math.min(this.loadedSrc.duration, this.playCurrentTime / 1000),
          );
          this.loadedSrc.play();
          this.loadedSrc.playId = this.id;
        }
        if (
          this.playCurrentTime < this.endPoint! &&
          !this.loadedSrc.paused &&
          window.akoolEditorState == "paused" &&
          this.loadedSrc.playId == this.id
        ) {
          this.loadedSrc.currentTime = Math.max(
            0,
            Math.min(this.loadedSrc.duration, this.playCurrentTime / 1000),
          );
          this.loadedSrc.pause();
        }
        // this.ctx.translate(-this.centerX, -this.centerY);
        // this.ctx.drawImage(this.loadedSrc, this.x, this.y, this.w, this.h);
        break;
      case "image":
      case "avatar":
        // this.ctx.translate(-this.centerX, -this.centerY);
        this.ctx.drawImage(
          this.loadedSrc,
          -this.w / 2,
          -this.h / 2,
          this.w,
          this.h,
        );
        break;
      default:
    }
    this.ctx.restore();
  }

  isinRotate(x: number, y: number): boolean {
    if (
      Math.abs(
        x -
          this.centerX -
          ((this.square[1][0] - this.square[0][0]) / 2 +
            this.square[0][0] +
            Math.sin((this.rotate * Math.PI) / 180) * 30),
      ) < 8 &&
      Math.abs(
        y -
          this.centerY -
          ((this.square[1][1] - this.square[0][1]) / 2 +
            this.square[0][1] -
            Math.cos((this.rotate * Math.PI) / 180) * 30),
      ) < 8
    ) {
      return true;
    }
    return false;
  }
  isinCorner(x: number, y: number): number {
    if (
      Math.abs(x - this.square[0][0] - this.centerX) < 8 &&
      Math.abs(y - this.square[0][1] - this.centerY) < 8
    ) {
      return 11;
    } else if (
      Math.abs(x - this.square[1][0] - this.centerX) < 8 &&
      Math.abs(y - this.square[1][1] - this.centerY) < 8
    ) {
      return 1;
    } else if (
      Math.abs(x - this.square[2][0] - this.centerX) < 8 &&
      Math.abs(y - this.square[2][1] - this.centerY) < 8
    ) {
      return 5;
    } else if (
      Math.abs(x - this.square[3][0] - this.centerX) < 8 &&
      Math.abs(y - this.square[3][1] - this.centerY) < 8
    ) {
      return 7;
    }

    return 0;
  }
  isinMiddlePoint(x: number, y: number): number {
    if (
      Math.abs(x - this.squareMiddle[0][0] - this.centerX) < 8 &&
      Math.abs(y - this.squareMiddle[0][1] - this.centerY) < 8
    ) {
      return 1;
    } else if (
      Math.abs(x - this.squareMiddle[1][0] - this.centerX) < 8 &&
      Math.abs(y - this.squareMiddle[1][1] - this.centerY) < 8
    ) {
      return 2;
    } else if (
      Math.abs(x - this.squareMiddle[2][0] - this.centerX) < 8 &&
      Math.abs(y - this.squareMiddle[2][1] - this.centerY) < 8
    ) {
      return 3;
    } else if (
      Math.abs(x - this.squareMiddle[3][0] - this.centerX) < 8 &&
      Math.abs(y - this.squareMiddle[3][1] - this.centerY) < 8
    ) {
      return 4;
    }
    return 0;
  }
  isMouseInGraph(mouse: { x: number; y: number }): string {
    if (!this.checkIfinTime()) return "0";
    this.ctx.save();
    this.ctx.translate(this.centerX, this.centerY);
    drawRect(this.ctx, this.square);
    // this.ctx.restore();
    const cornerPoint = this.isinCorner(mouse.x, mouse.y);

    if (cornerPoint) {
      this.ctx.restore();
      switch (cornerPoint) {
        case 11:
          return "scale11";
          break;
        case 1:
          return "scale1";
          break;
        case 5:
          return "scale5";
          break;
        case 7:
          return "scale7";
          break;

        default:
          break;
      }
    }
    const middlePoint = this.isinMiddlePoint(mouse.x, mouse.y);
    if (middlePoint) {
      this.ctx.restore();
      switch (middlePoint) {
        case 1:
          return "scale12";
          break;
        case 2:
          return "scale3";
          break;
        case 3:
          return "scale6";
          break;
        case 4:
          return "scale9";
          break;

        default:
          break;
      }
      // return (middlePoint == 1 || middlePoint == 3) ? "scaleY" : 'scaleX';
      // return (middlePoint == 1 || middlePoint == 3) ? "scaleY" : 'scaleX';
    }
    if (this.isinRotate(mouse.x, mouse.y)) {
      this.ctx.restore();
      return "rotate";
    }
    if (this.ctx.isPointInPath(mouse.x, mouse.y)) {
      this.ctx.restore();
      return "move";
    }
    this.ctx.restore();
    return "none";
  }

  // drawTheXAttach (_x: number): void {
  //   this.context.save();
  //   this.context.translate(window.timelineScrollX, 0);
  //   drawLine(
  //     this.context,
  //     _x * window.timelineXScale,
  //     0,
  //     _x * window.timelineXScale,
  //     this.canvas.height,
  //   );
  //   this.context.restore();
  // }
  // drawTheLineonHover (): void {
  //   this.context.save();
  //   this.context.fillStyle = "rgba(200, 200, 200, 0.5)";
  //   this.context.rect(
  //     0,
  //     Math.floor((this.y + 10) / 28) * 28,
  //     this.canvas.width,
  //     this.h,
  //   );
  //   this.context.fill();
  //   this.context.restore();
  // }
  _rotateSquare(): void {
    this.square = [
      this._rotatePoint(
        -this.w / 2,
        -this.h / 2,
        this.centerX,
        this.centerY,
        this.rotate,
      ),
      this._rotatePoint(
        -this.w / 2 + this.w,
        -this.h / 2,
        this.centerX,
        this.centerY,
        this.rotate,
      ),
      this._rotatePoint(
        -this.w / 2 + this.w,
        -this.h / 2 + this.h,
        this.centerX,
        this.centerY,
        this.rotate,
      ),
      this._rotatePoint(
        -this.w / 2,
        -this.h / 2 + this.h,
        this.centerX,
        this.centerY,
        this.rotate,
      ),
    ];
    this.squareMiddle = [
      this._rotatePoint(
        0,
        -this.h / 2,
        this.centerX,
        this.centerY,
        this.rotate,
      ),
      this._rotatePoint(this.w / 2, 0, this.centerX, this.centerY, this.rotate),
      this._rotatePoint(0, this.h / 2, this.centerX, this.centerY, this.rotate),
      this._rotatePoint(
        -this.w / 2,
        0,
        this.centerX,
        this.centerY,
        this.rotate,
      ),
    ];
  }
  _rotatePoint(
    x: number,
    y: number,
    centerX: number,
    centerY: number,
    degrees: number,
  ): number[] {
    let newX =
      (x - 0) * Math.cos((degrees * Math.PI) / 180) -
      (y - 0) * Math.sin((degrees * Math.PI) / 180);
    let newY =
      (x - 0) * Math.sin((degrees * Math.PI) / 180) +
      (y - 0) * Math.cos((degrees * Math.PI) / 180);
    return [newX, newY];
  }
  rotateAction(
    px: number,
    py: number,
    x: number,
    y: number,
    currentGraph: MonitorGraph,
  ): void {
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
  }

  transformVertex(status: string, vector: any) {
    if (this.type === "textbox") {
      return;
    }
    const _x = parseFloat(vector[0]);

    const _y = parseFloat(vector[1]);

    const _angle = (this.rotate * Math.PI) / 180;

    let _x_x = Math.sin(_angle + Math.PI / 2);

    let _y_x = Math.cos(_angle + Math.PI / 2);

    if (_angle === 0) {
      _x_x = 1;
      _y_x = 0;
    }
    const n_x = getVectorLenth([_x_x, _y_x], [_x, -_y]);

    const _x_y = Math.sin(_angle) * 5;

    const _y_y = Math.cos(_angle) * 5;

    const n_y = getVectorLenth([_x_y, _y_y], [_x, -_y]);

    const tan = Math.atan(this.h / this.w);

    const pointZoom = (_angles: number) => {
      const n_tan = getVectorLenth(
        [-Math.cos(_angles), Math.sin(_angles)],
        [_x, -_y],
      );
      this.w += n_tan * Math.cos(tan);
      this.h += n_tan * Math.sin(tan);
      this.centerX = this.centerX - (n_tan * Math.cos(_angles)) / 2;
      this.centerY = this.centerY - (n_tan * Math.sin(_angles)) / 2;
      console.log();
    };

    // console.log(n_x,_angle,Math.sin(_angle),Math.cos(_angle))
    if (status === "scale11") {
      const _angles = tan + _angle;

      pointZoom(_angles);
    } else if (status === "scale1") {
      const _angles = Math.PI - tan + _angle;

      pointZoom(_angles);
    } else if (status === "scale5") {
      const _angles = Math.PI + tan + _angle;

      pointZoom(_angles);
    } else if (status === "scale7") {
      const _angles = 2 * Math.PI - tan + _angle;

      pointZoom(_angles);
    } else if (status === "scale9") {
      this.w -= n_x;
      this.centerX = this.centerX + (n_x * Math.cos(_angle)) / 2;
      this.centerY = this.centerY + (n_x * Math.sin(_angle)) / 2;
      // this.x = this.centerX - this.w / 2
      // this.y = this.centerY - this.h / 2
    } else if (status === "scale6") {
      this.h -= n_y;
      this.centerX = this.centerX + (n_y * Math.sin(_angle)) / 2;
      this.centerY -= (n_y * Math.cos(_angle)) / 2;

      console.log(this.h);
      console.log(this.centerY);
      // this.x = this.centerX - this.w / 2
      // this.y = this.centerY - this.h / 2
    } else if (status === "scale3") {
      this.w += n_x;
      this.centerX += (n_x * Math.cos(_angle)) / 2;
      this.centerY += (n_x * Math.sin(_angle)) / 2;
      // this.x = this.centerX - this.w / 2
      // this.y = this.centerY - this.h / 2
      // console.log(this.w)
      // console.log(this.h)
    } else if (status === "scale12") {
      this.h += n_y;
      this.centerX = this.centerX + (n_y * Math.sin(_angle)) / 2;
      this.centerY = this.centerY - (n_y * Math.cos(_angle)) / 2;
      // this.x = this.centerX - this.w / 2
      // this.y = this.centerY - this.h / 2
    }
  }

  transform(
    px: number,
    py: number,
    x: number,
    y: number,
    currentGraph: MonitorGraph,
    point: number = 0,
  ): void {
    if (this.type === "text") {
      return;
    }

    let deltX, deltY, directionX, directionY, direction;

    //
    // const lineA = Math.sqrt(
    //   Math.pow(this.centerX - px, 2) + Math.pow(this.centerY - py, 2),
    // );
    // const lineB = Math.sqrt(
    //   Math.pow(this.centerX - x, 2) + Math.pow(this.centerY - y, 2),
    // );
    //
    // const resize_rito = Math.max(
    //   diffXAfter / diffXBefore,
    //   diffYAfter / diffYBefore,
    // );

    if (
      this.type === "image" ||
      this.type === "avatar" ||
      this.type === "video"
    ) {
      // let new_w = currentGraph.w * resize_rito;
      // let new_h = currentGraph.h * resize_rito;
      // let new_s = currentGraph.scale * resize_rito;
      let diffXBefore;
      let diffYBefore;
      let diffXAfter;
      let diffYAfter;
      let resize_rito1;
      let angleBefore;
      let angleAfter;

      switch (point) {
        case 3:
          deltX = x - this.squareMiddle[3][0];
          deltY = y - this.squareMiddle[3][1];
          directionX = px - this.squareMiddle[3][0];
          directionY = py - this.squareMiddle[3][1];
          angleBefore = (Math.atan2(directionY, directionX) / Math.PI) * 180;
          angleAfter = (Math.atan2(deltY, deltX) / Math.PI) * 180;
          // angleBefore = angleBefore < 0 ? angleBefore + 360 : angleBefore
          // angleAfter = angleAfter < 0 ? angleAfter + 360 : angleAfter
          console.log(angleAfter, angleBefore);
          direction = Math.abs(angleAfter - angleBefore) < 90 ? true : false;

          this.w =
            Math.sqrt(deltX * deltX + deltY * deltY) * (direction ? 1 : 0);
          // this.x = this.centerX - new_w / 2;
          // this.centerX = this.x - new_w / 2;
          break;
        case 9:
          deltX = x - this.squareMiddle[1][0];
          deltY = y - this.squareMiddle[1][1];
          directionX = px - this.squareMiddle[1][0];
          directionY = py - this.squareMiddle[1][1];
          angleBefore = (Math.atan2(directionY, directionX) / Math.PI) * 180;
          angleAfter = (Math.atan2(deltY, deltX) / Math.PI) * 180;
          direction = Math.abs(angleAfter - angleBefore) < 90 ? true : false;

          this.w =
            Math.sqrt(deltX * deltX + deltY * deltY) * (direction ? 1 : 0);
          // this.w = new_w;
          this.x = currentGraph.w - this.w + currentGraph.x;
          // this.centerX = this.x - new_w / 2;
          break;

        default:
          diffXBefore = Math.abs(px - this.centerX);
          diffYBefore = Math.abs(py - this.centerY);
          diffXAfter =
            point == 6 || point == 12 ? 0 : Math.abs(x - this.centerX);
          diffYAfter =
            point == 3 || point == 9 ? 0 : Math.abs(y - this.centerY);
          break;
      }
      // if(onlyX){
      //
      // }else if(onlyY){
      //   this.h = new_h;
      //   this.y = this.centerY - new_h / 2;
      // }else {
      //   this.w = new_w;
      //   this.h = new_h;
      //   this.scale = new_s;
      //   this.x = this.centerX - new_w / 2;
      //   this.y = this.centerY - new_h / 2;
      // }
    }
  }
  erase(): void {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }
}
