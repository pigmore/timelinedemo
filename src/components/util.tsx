// interface CanvasEventDriver {
//   register: (event: any, callback: Function) => void;
//   unregister: (event: any, callback: Function) => void;
//   pop: (event: string, props: any) => void;
// }
import { cloneDeep } from 'lodash';
import WASM from "./wasm";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { toBlobURL, fetchFile } from "@ffmpeg/util";
import { EditorEvents, editorEventBus } from "./event-tool";
interface HTMLMediaElementWithCaptureStream extends HTMLMediaElement {
  captureStream(): MediaStream;
}

const $readFrameWorker =  new Worker(process.env.PUBLIC_URL + "/readFrame-lib/readFrameWorker.js")
let $readFrameTaskStack:any[] = [],
    $isReadFrameBusy:boolean = false,
    $currentReadFrameVideoIndex = 0,
    $videoFrameBuffer = new Map(),
    $rightCount = 0,
    $errorCount = 0
//
//
// export const excuteReadFrameTask = (
//   readFrameTaskStack:any,
//   isReadFrameBusy:boolean,
//   currentReadFrameVideoIndex:number,
//   readFrameWorker:any,
//   videoFrameWidth:number,
//   videoFrameHeight:number,
//   videoFrameBuffer:any,
//   rightCount:number,
//   errorCount:number
// ) => {
//   if (
//     isReadFrameBusy === false &&
//     readFrameTaskStack.length !== 0
//   ) {
//     const task = readFrameTaskStack.pop();
//     // 优化 readFrameTaskStack
//     // debugger;
//     readFrameTaskStack = optimizeTaskStack(
//       task,
//       readFrameTaskStack,
//       videoFrameBuffer
//     );
//     // 优化完成
//     // debugger;
//
//     const readFrameList = task.readFrameList
//       .map((frame:any) => Mapping.frame2ms(frame, 30))
//       .join(",");
//     currentReadFrameVideoIndex = task.videoIndex;
//     WASM.readFrame(
//       readFrameWorker,
//       task.file,
//       videoFrameWidth,
//       videoFrameHeight,
//       readFrameList,
//       isReadFrameBusy,
//       currentReadFrameVideoIndex,
//       (blobUrl:string, frame:any, videoIndex:number) => {
//         // if (videoIndex !== currentReadFrameVideoIndex.value) {
//         //   console.log("shit", videoIndex, currentReadFrameVideoIndex.value);
//         // }
//         const key = JSON.stringify({
//           videoIndex: videoIndex,
//           frame: frame
//         });
//
//         const value = blobUrl;
//
//         // console.log("key: " + key);
//         // console.log("value: " + value);
//
//         if (!videoFrameBuffer.has(key)) {
//           videoFrameBuffer.set(key, value);
//           rightCount++;
//         } else {
//           errorCount++;
//         }
//       }
//     );
//   }
// };
//
// const optimizeTaskStack = (
//   currentTask:any,
//   readFrameTaskStack:any,
//   videoFrameBuffer:any
// ) => {
//   const currentTaskHashMap = new Map();
//   currentTask.readFrameList.forEach((frame:any) =>
//     currentTaskHashMap.set(
//       JSON.stringify({ videoIndex: currentTask.videoIndex, frame: frame }),
//       ""
//     )
//   );
//
//   for (let i = 0; i < readFrameTaskStack.length; i++) {
//     const task = readFrameTaskStack[i];
//     const readFrameList = task.readFrameList.filter((frame:any) => {
//       const isFrameInVideoFrameBuffer = videoFrameBuffer.has(
//         JSON.stringify({ videoIndex: task.videoIndex, frame: frame })
//       );
//       const isFrameInCurrentTask = currentTaskHashMap.has(
//         JSON.stringify({ videoIndex: task.videoIndex, frame: frame })
//       );
//       return !isFrameInVideoFrameBuffer && !isFrameInCurrentTask;
//     });
//     task.readFrameList = readFrameList;
//   }
//
//   return readFrameTaskStack.filter((task:any) => task.readFrameList.length !== 0);
// };



declare global {
  interface Window {
    projConfig: any;
    timelineXScale: number;
    zoomScale: number;
    imageFrames: any;
    timelineScrollX: number;
    timelineScrollY: number;
    akoolEditorState: string;
    timelineAction: string;
    initReady: boolean;
    initMonitorReady: boolean;
    wasmReady: boolean;
    canvasEventDriver: any;
    currentTime: number;
    projectDuration: number;
    videoFps: number;
    currentFrame: number;
    readFrameListTemp: string;
    MediaStreamTrackProcessor: any;
    // devicePixelRatio  :any;
    timelineRedraw_function: () => void;
    // clearMonitorSelectItem_function  : () => void;
    // timelineClearSelectItem_function  : () => void;
    // monitorAddElement_function  : (item:any) => void;
    timelineCut_function: () => void;
    timelinePlay_function: () => void;
    timelineStop_function: () => void;
    initJsonForCanvas: (data: any) => void;
    // timelineAddElement_function  : (data:any) => void;
    // handleMonitorSelectItem_function  : (id:string) => void;
    // timelineHandleSelectItem_function   : (id:string) => void;
  }
}

export const getPixRatio = (ctx: any): number => {
  // let ctx = ((canvasDom.getContext("2d")) as any,
  const dpr = window.devicePixelRatio || 1,
    bsr =
      ctx.webkitBackingStorePixelRatio ||
      ctx.mozBackingStorePixelRatio ||
      ctx.msBackingStorePixelRatio ||
      ctx.oBackingStorePixelRatio ||
      ctx.backingStorePixelRatio ||
      1;

  return dpr / bsr;
};

export const between = (
  input: number,
  a: number,
  b: number,
  inclusive: boolean = false,
): boolean => {
  var min = Math.min(a, b),
    max = Math.max(a, b);

  return inclusive ? input >= min && input <= max : input > min && input < max;
};
export const clone = (instance: Object): Object => {
  return Object.assign(
    Object.create(Object.getPrototypeOf(instance)),
    JSON.parse(JSON.stringify(instance)),
  );
};

export const drawEdgePoint = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
): void => {
  drawCircleIcon(ctx, x, y);
  drawCircleIcon(ctx, x + w / 2, y);
  drawCircleIcon(ctx, x + w, y);
  drawCircleIcon(ctx, x + w, y + h / 2);
  drawCircleIcon(ctx, x + w, y + h);
  drawCircleIcon(ctx, x + w / 2, y + h);
  drawCircleIcon(ctx, x, y + h / 2);
  drawCircleIcon(ctx, x, y + h);
  drawCircleIcon(ctx, x + w / 2, y - 45);
};
export const drawRotatePoint = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
): void => {
  drawCircleIcon(ctx, x + w / 2, y - 45);
};

export const randomInt = (a: number, b: number): number => {
  return Math.random() * (b - a) + a;
};

export function drawCircleIcon(
  ctx: CanvasRenderingContext2D,
  left: number,
  top: number,
): void {
  ctx.save();
  ctx.translate(left, top);
  ctx.beginPath();
  ctx.arc(0, 0, 8, 0, 2 * Math.PI);
  ctx.closePath();
  ctx.shadowColor = "#333333";
  ctx.shadowBlur = 3;
  ctx.fillStyle = "#ffffff";
  ctx.fill();
  ctx.restore();
}

export function loadTextProssse(textName: string, _url: string): Promise<void> {
  console.log(textName, _url);
  return new Promise((resolve, reject) => {
    let f = new FontFace(textName, `url(${_url})`);

    f.load().then((font) => {
      document.fonts.add(font);
      resolve();
    });
  });
}

function startVideoCapturebyWasm(_id: string, _file:File,_width:number,_height:number,_readFrameList:string) {
  if (!window.imageFrames[_id]) {
    window.imageFrames[_id] = [];
  }
  window.readFrameListTemp = _readFrameList
  const _readFrameListTemplength:number = _readFrameList.length
  window.wasmReady = false
  console.log(window.readFrameListTemp,'WASM.readFrame readFrameListTemp???')
  WASM.readFrame(
    $readFrameWorker,
    _file,
    _width,
    _height,
    cloneDeep(window.readFrameListTemp),
    cloneDeep(window.readFrameListTemp[0]),
    // currentReadFrameVideoIndex,
    (blobUrl:any, frame:number, frameIndex:number) => {
      console.log(frameIndex,'frameIndex?????')
        const imgel = new Image();
        imgel.src = blobUrl;
        imgel.width = (_width * 38) / _height;
        imgel.height = 38;
        window.imageFrames[_id].push({
          id: frame,
          imgel,
        });
      // }
      // setTimeout(() => {
      //   if (window.wasmReady && window.readFrameListTemp.length > 0 && (window.readFrameListTemp.length != _readFrameListTemplength)){
      //     startVideoCapturebyWasm(_id,_file,_width,_height,window.readFrameListTemp)
      //   }
      // }, 50);


    },
    () => {
      window.wasmReady = true
    }
  );



}
async function startVideoCapture(_id: string, _src: string) {
  const video = document.createElement("video") as any;
  video.src = _src;
  let seekComplete: any;
  video.onseeked = async (event: any) => {
    if (seekComplete) seekComplete();
  };
  while (
    (video.duration === Infinity || isNaN(video.duration)) &&
    video.readyState < 2
  ) {
    await new Promise((r) => setTimeout(r, 500));
  }
  video.crossOrigin = "Anonymous";
  video.height = 160;
  video.width = 320;
  const canvas = document.createElement("canvas");
  canvas.width = video.width;
  canvas.height = video.height;
  var ctx = canvas.getContext("2d");
  var track = video.captureStream().getVideoTracks()[0];
  var processor = new window.MediaStreamTrackProcessor(track);
  const frameReader = processor.readable.getReader();
  const FPS = 1;
  const totalExpectedFrames = Math.floor(FPS * video.duration);
  const intervalPerFrame = 1 / FPS;
  let currentTime = intervalPerFrame;
  let i = 0;
  video.currentTime = 0.05;
  await new Promise((r) => (seekComplete = r));
  window.imageFrames[_id] = [];
  frameReader.read().then(async function processFrame({
    done,
    value,
  }: {
    done: boolean;
    value: any;
  }) {
    if (done) {
      return;
    }

    var img = await createImageBitmap(value);
    ctx!.drawImage(img, 0, 0, canvas.width, canvas.height);
    i++;
    canvas.toBlob(async (blob: any) => {
      const url = URL.createObjectURL(blob);
      const imgel = new Image();
      imgel.src = url;
      imgel.width = video.width;
      imgel.height = video.height;
      window.imageFrames[_id].push({
        id: i,
        img,
        imgel,
        url,
        t: currentTime,
      });
      currentTime += intervalPerFrame;
      console.log(`frame#${i}`, url);
      img.close();
      value.close();
      if (i == totalExpectedFrames) {
        frameReader.releaseLock();
        processor.readable.cancel();
        value.close();
        video.remove();
        console.log(window.imageFrames);
        canvas.width = 1920;
        window.imageFrames[_id].push({
          id: i + 1,
          canvas: canvas,
          ctx: ctx,
        });
        editorEventBus.emit(EditorEvents.redrawTimeline);
        return;
      }

      video.currentTime = currentTime;
      await new Promise((r) => (seekComplete = r));
      frameReader.read().then(processFrame);
    });
  });
}

export function loadGifProssse(
  _url: string,
  _id: string,
  _ffmpeg: any,
): Promise<{
  videoEl: HTMLVideoElement;
  width: number;
  height: number;
  duration: number;
}> {
  return new Promise(async (resolve, reject) => {
    // const videoURL = "https://drz0f01yeq1cx.cloudfront.net/1726290486212-xxx.gif";
    // const ffmpeg = ffmpegRef.current;
    await _ffmpeg.writeFile("input.gif", await fetchFile(_url));
    await _ffmpeg.exec([
      "-f",
      "gif",
      "-i",
      "input.gif",
      "-movflags",
      "+faststart",
      "-pix_fmt",
      "yuv420p",
      "-vf",
      "scale=trunc(iw/2)*2:trunc(ih/2)*2",
      "-threads",
      "8",
      "output.mp4",
    ]);
    const fileData = await _ffmpeg.readFile("output.mp4");
    const data = new Uint8Array(fileData as ArrayBuffer);
    const _blob = URL.createObjectURL(
      new Blob([data.buffer], { type: "video/mp4" }),
    );
    let videoEl = document.createElement("video");
    videoEl.src = _blob;
    videoEl.addEventListener(
      "loadedmetadata",
      async function (e) {
        resolve({
          videoEl: videoEl,
          width: this.videoWidth,
          height: this.videoHeight,
          duration: this.duration,
        });
        await startVideoCapture(_id, _blob);
      },
      false,
    );
  });
}
export function loadVideoProssse(
  _url: string,
  _id: string,
): Promise<{
  videoEl: HTMLVideoElement;
  width: number;
  height: number;
  duration: number;
}> {
  return new Promise(async (resolve, reject) => {
    await fetch(_url)
      .then((response) => response.body)
      .then(async (body) => {
        const reader = body!.getReader();
        let buffer: Uint8Array[] = [];
        let videoEl = document.createElement("video");
        while (1) {
          const { value, done } = await reader.read();
          if (done) {
            const blob = new Blob(buffer);
            const blobUrl = URL.createObjectURL(blob);

            videoEl.src = blobUrl;
            videoEl.addEventListener(
              "loadedmetadata",

              async function (e) {
                resolve({
                  videoEl: videoEl,
                  width: this.videoWidth,
                  height: this.videoHeight,
                  duration: this.duration,
                });
                // console.log("????");
                const myFile = new File(
                    [blob],
                    `v${_id}.mp4`,
                    { type: 'video/mp4' }
                );
                let framelist = '';
                // for (let index = 0; index < this.duration - 1; index++) {
                //   framelist.push(Math.floor(index * 1000 + 5))
                // }
                framelist = '0,1000,2000,3000'
                await startVideoCapturebyWasm(_id, myFile, this.videoWidth,this.videoHeight,framelist);
              },
              false,
            );

            break;
          }

          buffer.push(value);
        }
      });
  });
}

export function loadAudioProssse(
  _url: string,
): Promise<{ audioEl: HTMLAudioElement; duration: Number }> {
  return new Promise(async (resolve, reject) => {
    await fetch(_url)
      .then((response) => response.body)
      .then(async (body) => {
        const reader = body!.getReader();
        let audioEl = document.createElement("audio");
        let buffer: Uint8Array[] = [];
        while (1) {
          const { value, done } = await reader.read();
          // console.log('???')
          if (done) {
            const blob = new Blob(buffer);
            const blobUrl = URL.createObjectURL(blob);
            audioEl.src = blobUrl;
            audioEl.addEventListener(
              "loadedmetadata",
              function (e) {
                resolve({ audioEl: audioEl, duration: this.duration });
              },
              false,
            );
            break;
          }
          buffer.push(value);
        }
      });
  });
}
export function loadLocalAudioProssse(): Promise<{
  audioEl: HTMLAudioElement;
  duration: Number;
}> {
  return new Promise(async (resolve, reject) => {
    const file = await loadFile({ "audio/*": [".mp3", ".m4a"] });
    if (!file) {
      reject();
      return;
    }
    const stream = file.stream();
    let audioEl = document.createElement("audio");
    const reader = stream.getReader();
    let buffer: Uint8Array[] = [];
    while (1) {
      const { value, done } = await reader.read();
      if (done) {
        const blob = new Blob(buffer);
        const blobUrl = URL.createObjectURL(blob);
        audioEl.src = blobUrl;
        audioEl.addEventListener(
          "loadedmetadata",
          function (e) {
            resolve({ audioEl: audioEl, duration: this.duration });
          },
          false,
        );
        break;
      }
      buffer.push(value);
    }
  });
}
export function loadLocalVideoProssse(
  _id: string,
): Promise<{
  videoEl: HTMLVideoElement;
  width: number;
  height: number;
  duration: number;
}> {
  return new Promise(async (resolve, reject) => {
    const file = await loadFile({ "video/*": [".mp4", ".mov"] });
    if (!file) {
      reject();
      return;
    }
    const stream = file.stream();
    let videoEl = document.createElement("video");
    // videoEl.src = stream;
    const reader = stream.getReader();
    let buffer: Uint8Array[] = [];
    while (1) {
      const { value, done } = await reader.read();
      if (done) {
        const blob = new Blob(buffer);
        const blobUrl = URL.createObjectURL(blob);
        videoEl.src = blobUrl;
        videoEl.addEventListener(
          "loadedmetadata",
          async function (e) {
            resolve({
              videoEl: videoEl,
              width: this.videoWidth,
              height: this.videoHeight,
              duration: this.duration,
            });
            // await startVideoCapture(_id, blobUrl);
            let framelist = '';
            // for (let index = 0; index < this.duration - 1; index++) {
            //   framelist.push(Math.floor(index * 1000 + 5))
            // }
            // framelist = '0,3333.3333333333335,6700,10066.666666666666,13433.333333333334,16800,20166.666666666668,23533.333333333336,26900,30266.666666666664'
            framelist = '0,8000,16000,24000,56000'
            startVideoCapturebyWasm(
              _id,
              file,
              this.videoWidth,
              this.videoHeight,
              framelist
            );
          },
          false,
        );
        break;
      }
      buffer.push(value);
    }
  });
}

async function loadFile(accept: {
  [key: string]: string[];
}): Promise<File | false> {
  try {
    const [fileHandle] = await window.showOpenFilePicker({
      types: [{ accept }],
    });

    return await fileHandle.getFile();
  } catch (e) {
    return false;
  }
}

export function loadImgProssse(
  _id: string,
  _url: string,
): Promise<HTMLImageElement> {
  return new Promise(async (resolve, reject) => {
    // let imgE = document.createElement("img");
    // imgE.setAttribute("id", _id);
    // imgE.src = _url;
    // document.append(imgE)
    // console.log('imgE???',imgE)
    var seal = new Image();
    seal.crossOrigin = "anonymous";
    seal.src = _url;

    await seal.decode();

    const canvas = document.createElement("canvas");
    canvas.width = (seal.width * 38) / seal.height;
    canvas.height = 38;
    var ctx = canvas.getContext("2d");
    ctx!.drawImage(seal, 0, 0, canvas.width, canvas.height);
    const canvas0 = document.createElement("canvas");
    canvas0.width = (seal.width * 26) / seal.height;
    canvas0.height = 26;
    var ctx0 = canvas0.getContext("2d");
    ctx0!.drawImage(seal, 0, 0, canvas0.width, canvas0.height);
    window.imageFrames[_id] = canvas;
    window.imageFrames[_id + "0"] = canvas0;
    resolve(seal);
    // seal.onload = () => {
    //
    // };
  });
}

export function loadLocalImgProssse(): Promise<HTMLImageElement> {
  return new Promise(async (resolve, reject) => {
    const file = await loadFile({ "image/*": [] });
    if (!file) {
      reject();
      return;
    }
    const blobUrl = URL.createObjectURL(file);
    var seal = new Image();
    seal.src = blobUrl;
    await seal.decode();
    resolve(seal);
    // seal.onload = () => {
    //   await seal.decode();
    //   resolve(seal);
    // };
  });
}

export function loadImgByDom(
  _id: string,
  _url: string,
): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    let seal = document.createElement("img");
    seal.setAttribute("id", _id);
    seal.src = _url;
    seal.onload = () => {
      resolve(seal);
    };
  });
}

export function fitString(
  ctx: CanvasRenderingContext2D,
  str: string,
  maxWidth: number,
): string {
  var width = ctx.measureText(str).width,
    ellipsis = "...",
    ellipsisWidth = ctx.measureText(ellipsis).width;

  if (width <= maxWidth || width <= ellipsisWidth) {
    return str;
  } else {
    var len = str.length;
    while (width >= maxWidth - ellipsisWidth && len-- > 0) {
      str = str.substring(0, len);
      width = ctx.measureText(str).width;
    }
    return str + ellipsis;
  }
}

export function uuid(): string {
  var u = "",
    i = 0;
  while (i++ < 4) {
    var c = "xxxx"[i - 1],
      r = (Math.random() * 16) | 0,
      v = c == "x" ? r : (r & 0x3) | 0x8;
    u += c == "-" || c == "4" ? c : v.toString(16);
  }
  return u;
}

export function fillCircle(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
) {
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2, false);
  ctx.fill();
  ctx.stroke();
  return;
}

export function fillEdgeCircle(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
) {
  ctx.fillStyle = "rgba(255, 255, 255 , 1)";
  fillCircle(ctx, x + 5, y + 5, 2);
  fillCircle(ctx, x + 5, y + 10, 2);
  fillCircle(ctx, x + 5, y + 15, 2);
  fillCircle(ctx, x + w - 5, y + 5, 2);
  fillCircle(ctx, x + w - 5, y + 10, 2);
  fillCircle(ctx, x + w - 5, y + 15, 2);
  return;
}

export function drawDoubleLine(
  ctx: CanvasRenderingContext2D,
  a: number,
  b: number,
  c: number,
  d: number,
  _strokeStyle: string,
): void {
  ctx.lineWidth = 1;
  ctx.strokeStyle = _strokeStyle;
  ctx.beginPath();
  ctx.moveTo(a, b);
  ctx.lineTo(c, d);
  ctx.stroke();
  ctx.closePath();
  ctx.beginPath();
  ctx.moveTo(a + 4, b);
  ctx.lineTo(c + 4, d);
  ctx.closePath();
  ctx.stroke();
}

export function drawFoucsLine(
  ctx: CanvasRenderingContext2D,
  a: number,
  b: number,
  c: number,
  d: number,
  _strokeStyle: string,
): void {
  ctx.lineWidth = 1;
  ctx.strokeStyle = _strokeStyle;
  ctx.beginPath();
  ctx.moveTo(a, b);
  ctx.lineTo(c, d);
  ctx.stroke();
}

export function drawTimePointer(
  ctx: CanvasRenderingContext2D,
  x: number,
  h: number,
): void {
  drawLine(ctx, x, 0, x, h, "#5297ff", 2);
  ctx.fillStyle = "#5297ff";
  ctx.beginPath();
  ctx.moveTo(x - 5, 0);
  ctx.lineTo(x + 5, 0);
  ctx.lineTo(x + 5, 10);
  ctx.lineTo(x + 0, 15);
  ctx.lineTo(x - 5, 10);
  ctx.closePath();
  ctx.fill();
}

export function drawSlider(
  ctx: CanvasRenderingContext2D,
  _x: number,
  _y: number,
  _w: number,
): void {
  ctx.fillStyle = "#555";
  ctx.strokeStyle = "#888";
  drawRoundedRect(ctx, _x, _y, _w, 8, 4);
}
export function drawScale(ctx: CanvasRenderingContext2D): void {
  let iStart: number = 0;
  if (window.timelineXScale <= 2) {
    iStart = Math.max(
      Math.floor(-window.timelineScrollX / 50 / window.timelineXScale) - 10,
      0,
    );
  } else if (window.timelineXScale > 2 && window.timelineXScale <= 5) {
    iStart = Math.max(
      Math.floor(-window.timelineScrollX / 10 / window.timelineXScale),
      0,
    );
  } else if (window.timelineXScale > 5 && window.timelineXScale < 15) {
    iStart = Math.max(
      Math.floor(-window.timelineScrollX / 10 / window.timelineXScale),
      0,
    );
  } else if (window.timelineXScale >= 15 && window.timelineXScale < 25) {
    iStart = Math.max(
      Math.floor(-window.timelineScrollX / 5 / window.timelineXScale),
      0,
    );
  } else if (window.timelineXScale >= 25) {
    iStart = Math.max(
      Math.floor(-window.timelineScrollX / 2.5 / window.timelineXScale),
      0,
    );
  }
  for (var i = iStart; i < iStart + 200; i++) {
    if (window.timelineXScale <= 2) {
      const _x = i * 50 * window.timelineXScale + 0;

      if (i % 2 == 0) {
        drawLine(ctx, _x, 0, _x, 10, "white", 1);
        ctx.fillStyle = "rgba(255, 255, 255 , 1)";
        ctx.font = "12px Arial";
        ctx.fillText(secondTrans(i * 5), _x + 6, 15);
      } else {
        drawLine(ctx, _x, 0, _x, 7, "white", 1);
      }
    } else if (window.timelineXScale > 2 && window.timelineXScale <= 5) {
      const _x = i * 10 * window.timelineXScale + 0;

      if (i % 5 == 0) {
        drawLine(ctx, _x, 0, _x, 10, "white", 1);
        ctx.fillStyle = "rgba(255, 255, 255 , 1)";
        ctx.font = "12px Arial";
        ctx.fillText(secondTrans(i), _x + 6, 15);
      } else {
        drawLine(ctx, _x, 0, _x, 7, "white", 1);
      }
    } else if (window.timelineXScale > 5 && window.timelineXScale < 15) {
      const _x = i * 10 * window.timelineXScale + 0;

      if (i % 2 == 0) {
        drawLine(ctx, _x, 0, _x, 10, "white", 1);
        ctx.fillStyle = "rgba(255, 255, 255 , 1)";
        ctx.font = "12px Arial";
        ctx.fillText(secondTrans(i), _x + 6, 15);
      } else {
        drawLine(ctx, _x, 0, _x, 7, "white", 1);
      }
    } else if (window.timelineXScale >= 15 && window.timelineXScale < 25) {
      const _x = i * 5 * window.timelineXScale + 0;

      if (i % 2 == 0) {
        drawLine(ctx, _x, 0, _x, 10, "white", 1);
        ctx.fillStyle = "rgba(255, 255, 255 , 1)";
        ctx.font = "12px Arial";
        ctx.fillText(secondTrans(i / 2), _x + 6, 15);
      } else {
        drawLine(ctx, _x, 0, _x, 7, "white", 1);
      }
    } else if (window.timelineXScale >= 25) {
      const _x = i * 2.5 * window.timelineXScale + 0;

      if (i % 4 == 0) {
        drawLine(ctx, _x, 0, _x, 10, "white", 1);
        ctx.fillStyle = "rgba(255, 255, 255 , 1)";
        ctx.font = "12px Arial";
        ctx.fillText(secondTrans(i / 4), _x + 6, 15);
      } else {
        drawLine(ctx, _x, 0, _x, 7, "white", 1);
      }
    }
  }
}

export function secondTrans(_s: number): string {
  return new Date(_s * 1000).toISOString().substring(14, 19);
}

export function drawLine(
  ctx: CanvasRenderingContext2D,
  a: number,
  b: number,
  c: number,
  d: number,
  _color: string = "purple",
  _lineWidth: number = 1,
): void {
  ctx.lineWidth = _lineWidth;
  ctx.strokeStyle = _color;
  ctx.beginPath();
  ctx.moveTo(a, b);
  ctx.lineTo(c, d);
  ctx.stroke();
}

export function drawRect(ctx: CanvasRenderingContext2D, _square: number[][]) {
  const p = _square;
  ctx.beginPath();
  ctx.moveTo(p[0][0], p[0][1]);
  ctx.lineTo(p[1][0], p[1][1]);
  ctx.lineTo(p[2][0], p[2][1]);
  ctx.lineTo(p[3][0], p[3][1]);
  ctx.closePath();
  return;
}

export function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
): void {
  if (w < 2 * r) r = Math.abs(w / 2);
  if (h < 2 * r) r = h / 2;
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
  ctx.stroke();
  ctx.fill();
}
export function drawRoundedRect0(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
): void {
  if (w < 2 * r) r = Math.abs(w / 2);
  if (h < 2 * r) r = h / 2;
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, 0);
  ctx.arcTo(x, y, x + w, y, 0);
  ctx.closePath();
  ctx.stroke();
  ctx.fill();
}
export function drawRoundedRect1(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
): void {
  if (w < 2 * r) r = Math.abs(w / 2);
  if (h < 2 * r) r = h / 2;
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, 0);
  ctx.arcTo(x + w, y + h, x, y + h, 0);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
  ctx.stroke();
  ctx.fill();
}
export function getVectorLenth(
  v1: [number, number],
  v2: [number, number],
): number {
  const [x1, y1] = v1;
  const [x2, y2] = v2;
  return (x1 * x2 + y1 * y2) / Math.sqrt(x1 * x1 + y1 * y1);
}

export const exportTextboxtoBase64 = (item: any) => {
  const canvasDom = document.createElement("canvas");
  canvasDom.width = item.w;
  canvasDom.height = item.h;
  let ctx = canvasDom!.getContext("2d");
  ctx!.fillStyle = item.initconfig!.fill!;
  ctx!.font = `${item.initconfig!.bold ? "Bold" : ""} ${item.initconfig!.italic ? "Italic" : ""} ${item.initconfig!.fontSize}px ${item.initconfig!.fontFamily}`;
  ctx!.textAlign = item.initconfig!.textAlign!;
  ctx!.strokeStyle = item.initconfig!.stroke!;
  ctx!.lineWidth = item.initconfig!.lineWidth!;
  ctx!.lineWidth = item.initconfig!.lineWidth!;
  ctx!.translate(item.w / 2, item.h / 2);
  drawString(
    ctx!,
    item.text as string,
    0,
    0,
    item.initconfig!.fill!,
    0,
    `${item.initconfig!.fontSize}px ${item.initconfig!.fontFamily}`,
    item.initconfig!.fontSize!,
    item.initconfig!.textAlign!,
    item.w - 10,
    item.initconfig!.underline || false,
  );
  const jpegUrl = canvasDom.toDataURL();
  return jpegUrl;
};
export const saveTemplateAsFile = (filename: string, dataObjToWrite: JSON) => {
  const blob = new Blob([JSON.stringify(dataObjToWrite)], {
    type: "text/json",
  });
  const link = document.createElement("a");

  link.download = filename;
  link.href = window.URL.createObjectURL(blob);
  link.dataset.downloadurl = ["text/json", link.download, link.href].join(":");

  const evt = new MouseEvent("click", {
    view: window,
    bubbles: true,
    cancelable: true,
  });

  link.dispatchEvent(evt);
  link.remove();
};
export const drawString = (
  ctx: CanvasRenderingContext2D,
  text: string,
  posX: number,
  posY: number,
  textColor?: string,
  rotation?: number,
  font?: string,
  fontSize?: number,
  textAlign?: string,
  textlineWidth?: number,
  underline?: boolean,
): void => {
  const lines: string[] = text.split("\n");
  if (!rotation) rotation = 0;
  if (!font) font = "'serif'";
  if (!fontSize) fontSize = 16;
  if (!textColor) textColor = "#000000";
  ctx.save();
  ctx.font = fontSize + "px " + font;
  ctx.fillStyle = textColor;
  switch (textAlign) {
    case "left":
      posX -= textlineWidth! / 2 || 0;
      break;
    case "right":
      posX += textlineWidth! / 2 || 0;
      break;

    default:
      break;
  }
  ctx.translate(posX, (-fontSize * (lines.length - 1.7)) / 2);
  ctx.rotate((rotation * Math.PI) / 180);
  for (let i = 0; i < lines.length; i++) {
    ctx.fillText(lines[i], 0, i * fontSize);
    if (underline) {
      switch (textAlign) {
        case "left":
          drawLine(
            ctx,
            0,
            i * fontSize + 5,
            ctx.measureText(lines[i]).width,
            i * fontSize + 5,
            textColor,
            2,
          );
          break;
        case "right":
          drawLine(
            ctx,
            -ctx.measureText(lines[i]).width,
            i * fontSize + 5,
            0,
            i * fontSize + 5,
            textColor,
            2,
          );
          break;

        default:
          drawLine(
            ctx,
            -ctx.measureText(lines[i]).width / 2,
            i * fontSize + 5,
            ctx.measureText(lines[i]).width / 2,
            i * fontSize + 5,
            textColor,
            2,
          );
          break;
      }
    }
  }
  ctx.restore();
};
export const msToHMS = (ms: number): string => {
  let seconds: number = ms / 1000;
  let hours: number = Math.floor(seconds / 3600);
  seconds = seconds % 3600;
  let minutes: number = Math.floor(seconds / 60);
  let secondsS = (seconds % 60).toFixed(2);
  seconds = seconds % 60;
  let hoursS: string = hours.toString();
  let minutesS: string = minutes.toString();
  if (hours < 10) hoursS = "0" + hoursS;
  if (minutes < 10) minutesS = "0" + minutesS;
  if (seconds < 10) secondsS = "0" + secondsS;
  return hoursS + ":" + minutesS + ":" + secondsS;
};
