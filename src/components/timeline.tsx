import React, { FC, useState, useEffect, memo } from "react";
import {
  randomInt,
  drawScale,
  drawSlider,
  drawTimePointer,
  clone,
  uuid,
  getPixRatio,
  loadImgProssse,
} from "./util";
// import { cloneDeep } from 'lodash';
import iconEmojo from "./icon/iconEmojo.svg";
import iconImage from "./icon/iconImage.svg";
import iconMusic from "./icon/iconMusic.svg";
import iconText from "./icon/iconText.svg";
import iconVideo from "./icon/iconVideo.svg";
import iconVoice from "./icon/iconVoice.svg";
import iconScript from "./icon/iconScript.svg";
// import videolocalSrc from './video/onlineclass3.mp4';
import { TimelineGraph } from "./timelineGraph";
import { sample } from "./sample";
import { EditorEvents, editorEventBus } from "./event-tool";

interface TimelineProps {
  // Define any props if needed
  eventBus: any;
}

const Timeline: FC<TimelineProps> = (props) => {
  const timelineHeight: number = 28;
  let timelineScrollYMax: number = 0;
  let timelineScrollYMin: number = 0;
  let timelineScrollXMax: number = 0;
  let timelineScrollXMin: number = 0;
  let projectDurationMax: number = 300000;
  let timelineXScalemax: number = 0;
  let timelineXScaleWidth: number = 0;
  let pixRatio: number = 0;
  const timelineHeightMainTrack: number = 40;
  const timelineGap: number = 4;
  let requestId: number | undefined;
  let performanceNow: number = 0;
  let canvasDom: HTMLCanvasElement;
  let timelineCtx: CanvasRenderingContext2D | null = null;
  let timelineGraphs: any[] = [];
  let graphAttr: any[] = [];
  let xArray: number[] = [];
  let vEdge: number[] = [];
  let tempGraphArr: any[] = [];
  // let editorEventBus:any;
  // editorEventBus = props.eventBus

  useEffect(() => {
    async function init() {
      if (window!.initReady !== true) {
        initCanvas();
        editorEventBus.on(EditorEvents.editorPlay, () => {
          console.log("TimelineEditorPlay! event.on");
          timelinePlay();
        });
        editorEventBus.on(EditorEvents.editorCut, () => {
          console.log("TimelineEditorPlay! event.on");
          timelineCut();
        });
        editorEventBus.on(EditorEvents.editorPause, () => {
          console.log("TimelineEditorPause! event.on");
          timelineStop();
        });

        editorEventBus.on(EditorEvents.initElement, (item: any) => {
          console.log("TimelineInitElement! event.on", item);
          initJsonForCanvas(item);
        });
        editorEventBus.on(EditorEvents.addElement, (item: any) => {
          console.log("TimelineAddElement! event.on", item);
          timelineAddElement_function(item);
        });
        editorEventBus.on(EditorEvents.updateElement, (item: any) => {
          console.log("TimelineUpdateElement! event.on", item.id);
        });
        editorEventBus.on(
          EditorEvents.delElement,

          (item: any) => {
            const _index = timelineGraphs.findIndex(
              (item) => item.selected === true,
            );
            const _id = timelineGraphs[_index].id;
            editorEventBus.emit(EditorEvents.delElementCallback, _id);
            timelineGraphs.splice(_index, 1);
            mainTrackSticky();

            clearCanvas();
            drawGraph();
            exportJson();
          },
        );
      }
    }
    init();
    window.akoolEditorState = "paused";
    window.initReady = true;
    return () => {
      // removeEvents();
    };
  }, []);

  const calcDuration = () => {
    let _duration = 0;
    for (const item of timelineGraphs) {
      _duration = Math.max(item.x + item.w, _duration);
    }
    _duration *= 100;
    window.projectDuration = _duration;
    editorEventBus.emit(EditorEvents.editorUpdateDuration, _duration);
    projectDurationMax = Math.max(window.projectDuration, projectDurationMax);
  };

  const checkIfInsideMove = (
    _shape: any,
    mouseX: number,
    mouseY: number,
    needtoPiant: boolean = true,
  ) => {
    const _x = checkIfInsidemoving(
      _shape.x,
      _shape.w,
      _shape.mapYposition(mouseY + 10),
      _shape.id,
      mouseX,
    );
    if (_x >= 0) {
      if (needtoPiant) {
        _shape.drawVirtuRect(_x, _shape.mapYposition(mouseY + 10));
      } else {
        _shape.x = _x;
      }
    } else {
      if (!needtoPiant && _x != -1) {
        mainTrackMoveBack(_shape.id, -_x);
        _shape.x = 0;
      }
    }
  };

  const checkIfLayerEmpty = (_shape: any) => {
    let needLoop: boolean = false;
    if (timelineGraphs.findIndex((item) => item.layer == 1) == -1) {
      for (const item of timelineGraphs) {
        if (item.layer > 1) {
          item.layer -= 1;
          item.y += timelineHeight + 6;
          needLoop = true;
        }
      }
      if (needLoop) {
        checkIfLayerEmpty(_shape);
        return;
      }
    }
    if (timelineGraphs.findIndex((item) => item.layer == -1) == -1) {
      for (const item of timelineGraphs) {
        if (item.layer < -1) {
          item.layer += 1;
          item.y -= timelineHeight + 6;
          needLoop = true;
        }
      }
      if (needLoop) {
        checkIfLayerEmpty(_shape);
        return;
      }
    }
    if (_shape.layer !== 0) {
      if (_shape.layer > 1) {
        if (
          timelineGraphs.findIndex((item) => item.layer == _shape.layer - 1) ==
          -1
        ) {
          for (const item of timelineGraphs) {
            if (item.layer == _shape.layer && item.id != _shape.id) {
              item.layer -= 1;
              item.y += timelineHeight + 6;
            }
          }
          _shape.layer -= 1;
          _shape.y += timelineHeight + 6;
          // _shape.y = _shape.mapYposition(_shape.y)
          checkIfLayerEmpty(_shape);
        }
      }
      if (_shape.layer < -1) {
        if (
          timelineGraphs.findIndex((item) => item.layer == _shape.layer + 1) ==
          -1
        ) {
          for (const item of timelineGraphs) {
            if (item.layer == _shape.layer && item.id != _shape.id) {
              item.layer += 1;
              item.y -= timelineHeight + 6;
            }
          }
          _shape.layer += 1;
          _shape.y -= timelineHeight + 6;
          // _shape.y = _shape.mapYposition(_shape.y)
          checkIfLayerEmpty(_shape);
        }
      }
    }
  };

  const shapeInserttoTrack = (_shape: any, _mouseX: number) => {
    let _xw: number = 0;
    let deltaX: number = 0;
    // let _xw:number = 0
    // debugger;
    for (const item of timelineGraphs
      .filter((item) => item.y === _shape.y && item.id != _shape.id)
      .sort((a, b) => a.x - b.x)) {
      console.log(item.x, item.y);
      if (_xw < _mouseX && _mouseX < item.x) {
        _shape.x = _xw;
        deltaX = _xw + _shape.w - item.x;
        item.x = _xw + _shape.w;
      } else if (item.x < _mouseX && _mouseX < item.x + item.w / 2) {
        _shape.x = item.x;
        item.x += _shape.w;
        deltaX = _shape.w;
      } else if (_mouseX > item.x + item.w / 2 && _mouseX < item.x + item.w) {
        _shape.x = item.x + item.w;
        deltaX = _shape.w;
      } else if (item.x > _mouseX) {
        item.x += deltaX;
      }
      _xw = item.x + item.w;
    }
  };
  const checkIfInsidetoInsert = (_shape: any, _mouseX: number) => {
    if (checkIfInside(_shape.x, _shape.w, _shape.y, _shape.id)) {
      shapeInserttoTrack(_shape, _mouseX / window.timelineXScale);
      // _shape.y = _shape.mapYposition( _shape.y - timelineHeight - 4);
      // _shape.layer = _shape.calLayer(_shape.y)

      // _shape.h = _shape.layer == 0 ? 40 : 28
      // (function(_shape:any) {
      // checkIfInsideLoop(_shape)
      // })(_shape)
      // await checkIfInsideLoop(_shape);
    }
  };
  const insertMainTrack = (_x: number, _w: number) => {
    for (const item of timelineGraphs) {
      console.log(_x, item.x);
      if (item.layer == 0) {
        if (_x >= item.x && _x <= item.x + item.w / 2) {
          item.x += _w;
        } else if (_x <= item.x) {
          item.x += _w;
        }
      }
    }
  };
  const mainTrackMoveBack = (_shape: any, _x: number) => {
    for (const item of timelineGraphs) {
      if (item.layer == 0 && item.id != _shape.id) item.x += _x;
    }
  };
  const mainTrackToZeroLoop = () => {
    let xMin: number = 10000;
    for (const item of timelineGraphs) {
      if (item.layer == 0) xMin = Math.min(item.x, xMin);
    }
    if (xMin != 0) {
      timelineGraphs.forEach((item) => {
        if (item.layer == 0) item.x -= xMin;
      });
    }
  };
  const gapAboveMoveUP = (_layer: number) => {
    for (const item of timelineGraphs) {
      if (item.layer >= _layer) {
        item.layer += 1;
        item.y -= timelineHeight + 6;
      }
    }
  };
  const mainTrackSticky = () => {
    let _x: number = 0;
    // console.log()
    for (const item of timelineGraphs
      .filter((item) => item.layer === 0)
      .sort((a, b) => a.x - b.x)) {
      item.x = _x;
      _x += item.w;
    }
  };

  const checkIfInside = (_x: number, _w: number, _y: number, _id: string) => {
    for (const item of timelineGraphs) {
      if (_id === item.id) continue;
      console.log(item.y);
      console.log(_y);
      if (_y >= item.y + timelineHeight || _y <= item.y - timelineHeight)
        continue;
      if (_x >= item.x && _x < item.x + item.w) {
        return true;
      }
      if (_x + _w > item.x && _x + _w <= item.x + item.w) {
        return true;
      }
      if (_x > item.x && _x + _w < item.x + item.w) {
        return true;
      }
      if (_x < item.x && _x + _w > item.x + item.w) {
        return true;
      }
    }
    return false;
  };

  const checkIfInsidemoving = (
    _x: number,
    _w: number,
    _y: number,
    _id: string,
    _mousex: number,
  ) => {
    let inside: boolean = false;
    for (const item of timelineGraphs) {
      if (_id === item.id) continue;
      // console.log()
      if (item.mapYposition(_y + 14) !== item.y) continue;
      if (_x >= item.x && _x < item.x + item.w) {
        inside = true;
      } else if (_x + _w > item.x && _x + _w <= item.x + item.w) {
        inside = true;
      } else if (_x > item.x && _x + _w < item.x + item.w) {
        inside = true;
      } else if (_x < item.x && _x + _w > item.x + item.w) {
        inside = true;
      }
      if (inside) {
        if (_mousex / window.timelineXScale > item.x + item.w / 2) {
          return item.x + item.w;
        } else {
          return item.x - _w;
        }
      }
    }
    return -1;
  };

  const checkIfAttach = (_x: number, _w: number) => {
    for (const item of xArray) {
      if (Math.abs(_x - item) < 0.1) {
        return [item, 0];
      } else if (Math.abs(_x + _w - item) < 0.1) {
        return [item - _w, 1];
      }
    }
    return false;
  };

  const getXArray = (_timelineGraphs: any[]) => {
    for (const item of _timelineGraphs) {
      xArray.push(item.x);
      xArray.push(item.x + item.w);
    }
  };

  const playLoop = (_stamp: number) => {
    const deltaTime: number = _stamp - performanceNow;
    window.currentTime += deltaTime;
    window.currentFrame = Math.floor((window.currentTime / 100) * 6);
    if (window.currentTime > window.projectDuration) {
      window.currentTime = window.projectDuration;
    }

    editorEventBus.emit(
      EditorEvents.editorUpdateCurrentTime,
      window.currentTime,
    );
    clearCanvas();
    drawGraph();

    editorEventBus.emit(EditorEvents.redrawMonitor, false as any);
    if (window.currentTime == window.projectDuration) {
      window.akoolEditorState = "paused";
      editorEventBus.emit(EditorEvents.editorPause);
    } else {
      performanceNow = _stamp;
      requestId = window.requestAnimationFrame(playLoop);
    }
  };

  const timelinePlay = () => {
    performanceNow = performance.now();
    if (window.currentTime === window.projectDuration) {
      window.currentTime = 0;
    }
    if (!requestId) {
      requestId = window.requestAnimationFrame(playLoop);
      window.akoolEditorState = "playing";
    }
  };

  const clearSelectItem = () => {
    timelineGraphs.forEach((item) => {
      item.selected = false;
    });
  };

  const handleSelectItem = (_id: string) => {
    timelineGraphs.find((item) => item.id === _id)!.selected = true;
    checkisCutable();
  };

  const timelineStop = () => {
    if (requestId) {
      window.cancelAnimationFrame(requestId);
      window.akoolEditorState = "paused";
      clearCanvas();
      drawGraph();

      editorEventBus.emit(EditorEvents.redrawMonitor, false as any);
      requestId = undefined;
    }
  };

  const checkisCutable = () => {
    let result = false;
    timelineGraphs.forEach((item, i) => {
      if (
        item.selected &&
        item.x < window.currentFrame / 6 &&
        item.x + item.w > window.currentFrame / 6
      ) {
        result = true;
      }
    });
    editorEventBus.emit(EditorEvents.cutable, result);
  };
  const timelineCut = () => {
    let _index: number = -1;
    let _item: any = {};
    timelineGraphs.forEach((item, i) => {
      if (
        item.selected &&
        item.x < window.currentFrame / 6 &&
        item.x + item.w > window.currentFrame / 6
      ) {
        const _id: string = uuid();
        _item = new TimelineGraph({
          id: _id,
          x: item.x,
          y: item.y,
          w: item.w,
          h: item.h,
          t: item.t,
          pixRatio: item.pixRatio,
          type: item.type,
          icon: item.icon,
          fillStyle: item.fillStyle,
          strokeStyle: item.strokeStyle,
          canvas: canvasDom,
          ctx: timelineCtx as CanvasRenderingContext2D,
          attachedPrveiwId:
            item.attachedPrveiwId !== "" ? item.attachedPrveiwId : item.id,
          startPoint: item.startPoint || 0,
          endPoint: item.endPoint || item.w,
          duration: item.duration || 0,
        });
        _item.x = window.currentFrame / 6;
        _item.w -= window.currentFrame / 6 - item.x;
        _item.startPoint += window.currentFrame / 6 - item.x;
        _index = i;
        item.w = window.currentFrame / 6 - item.x;
        item.endPoint = item.startPoint + window.currentFrame / 6 - item.x;
        _item.layer = item.layer;
        editorEventBus.emit(EditorEvents.monitorDuplicateElement, {
          _idOld: item.id,
          _id: _id,
          _deltaX: (window.currentFrame / 6 - item.x) * 100,
        });
      }
    });
    if (_index >= 0) {
      timelineGraphs.splice(_index, 0, _item);
      clearCanvas();
      drawGraph();
    }
  };

  const addElement = async (
    id: string,
    x: number,
    y: number,
    w: number,
    type: string,
  ) => {
    let color: string = "";
    let strokeStyle: string = "";
    let iconUrl: string = "";
    switch (type) {
      case "audio":
        color = "rgba(58, 96, 234, 0.10)";
        strokeStyle = "rgba(58, 96, 234, 1)";
        iconUrl = iconMusic;
        break;
      case "textbox":
        color = "rgba(208, 87, 41, 0.10)";
        strokeStyle = "rgba(208, 87, 41, 1)";
        iconUrl = iconText;
        break;
      case "Emojo":
        color = "rgba(242,73,143,0.6)";
        strokeStyle = "rgba(242,73,143,1)";
        iconUrl = iconEmojo;
        break;
      case "image":
        color = "rgba(15, 151, 61, 0.10)";
        strokeStyle = "rgba(15, 151, 61, 1)";
        iconUrl = iconImage;
        break;
      case "avatar":
      case "video":
        color = "rgba(140,26,255,0.1)";
        strokeStyle = "rgba(140,26,255,1)";
        iconUrl = iconVideo;
        break;
      default:
        color = "";
    }
    const graph = new TimelineGraph({
      id: id,
      x: window.currentFrame / 6 || x / 100,
      y:
        -y * (timelineHeight + 6) +
        canvasDom.height / pixRatio / 1.3 +
        (y == 0 ? 10 : y > 0 ? -24 : 10),
      w: w / 100,
      h: y == 0 ? 40 : timelineHeight,
      t: type,
      type: type,
      icon: await loadImgProssse(uuid(), iconUrl),
      fillStyle: color,
      strokeStyle: strokeStyle,
      canvas: canvasDom,
      pixRatio: pixRatio,
      ctx: timelineCtx as CanvasRenderingContext2D,
      attachedPrveiwId: null,
      startPoint: 0,
      endPoint: w / 100,
      duration: w / 100,
    });
    console.log("loop", type);
    // (function(graph) {

    // })(graph)
    console.log();
    graph.y = graph.mapYposition(graph.y);
    graph.layer = graph.calLayer(graph.y);
    console.log(graph.y, "y");
    console.log(graph.layer, "layer");
    insertMainTrack(graph.x, graph.w);

    timelineGraphs.push(graph);
    checkIfLayerEmpty(graph);
    mainTrackSticky();
    // checkIfInsideLoopstart(graph)
  };

  const clearCanvas = () => {
    if (timelineCtx) {
      timelineCtx.clearRect(0, 0, canvasDom!.width, canvasDom!.height);
    }
  };

  const drawGraph = () => {
    if (timelineCtx) {
      timelineCtx.save();
      timelineCtx.translate(window.timelineScrollX, 0);

      // timelineCtx.restore();
      for (let i = 0; i < timelineGraphs.length; i++) {
        timelineGraphs[i].paint();
      }
      drawScale(timelineCtx);

      // timelineCtx.save();
      // timelineCtx.translate(window.timelineScrollX, 0);
      drawTimePointer(
        timelineCtx,
        (window.currentFrame * window.timelineXScale) / 6,
        canvasDom!.height,
      );
      timelineCtx.restore();

      drawSlider(
        timelineCtx,
        (-window.timelineScrollX *
          (canvasDom!.width / pixRatio - timelineXScaleWidth)) /
          timelineXScalemax,
        canvasDom!.height / pixRatio - 10,
        timelineXScaleWidth,

        // canvasDom!.width / pixRatio / (projectDurationMax / 100) * (canvasDom!.width / pixRatio)
        // * (30 / window.timelineXScale )
      );
    }
  };

  const updateTimelineReverse = async (items: [any?]) => {
    if (items.length == 0) {
      timelineGraphs = [];
    } else {
      for (const item of items) {
        console.log(item, "updateTimelineReverse");
        console.log(item, "updateTimelineReverse");

        for (let index = 0; index < timelineGraphs.length; index++) {
          let _item = timelineGraphs[index];
          if (_item.id === item.id) {
            _item.x = item.x;
            _item.y =
              -item.layer * (timelineHeight + 6) +
              canvasDom.height / pixRatio / 1.3 +
              (item.layer == 0 ? 10 : item.layer > 0 ? -24 : 10);
            _item.w = item.w;
            _item.h = item.layer == 0 ? 40 : timelineHeight;
            _item.y = _item.mapYposition(_item.y);
            _item.layer = _item.calLayer(_item.y);
          }
        }

        console.log("updateTimelineReverse");
        console.log(
          timelineGraphs.findIndex((_item) => _item.id === item.id),
          "updateTimelineReverse timelineGraphs.findIndex",
        );
        if (timelineGraphs.findIndex((_item) => _item.id === item.id) == -1) {
          console.log("?????");
          await addElement(
            item.id,
            item.x * 100,
            item.layer,
            item.w * 100,
            item.type,
          );
        }
      }

      timelineGraphs = timelineGraphs.filter(
        (item) => items.findIndex((_item) => _item.id === item.id) != -1,
      );

      // if (removeList.length > 0) {
      //   for (let index = removeList.length - 1; index >= 0; index--) {
      //     timelineGraphs.splice(removeList[index], 1)
      //   }
      // }
      mainTrackSticky();
    }
  };
  const exportJson = () => {
    let result: any[] = [];
    timelineScrollYMin = 0;
    timelineScrollYMax = 0;
    for (const item of timelineGraphs) {
      const temp = {
        id: item.id,
        x: (item.x * 100).toFixed(),
        y: (item.y / timelineHeight).toFixed(),
        w: (item.w * 100).toFixed(),
        startPoint: item.startPoint * 100,
        endPoint: item.endPoint * 100,
        layer: item.layer,
      };
      result.push(temp);
      timelineScrollYMin = Math.min(
        timelineScrollYMin,
        item.layer * timelineHeight - 10 * pixRatio,
      );
      timelineScrollYMax = Math.max(
        timelineScrollYMax,
        item.layer * timelineHeight + 10 * pixRatio,
      );
      console.log(item.layer, item.layer * timelineHeight, "????");
    }
    // window.canvasEventDriver.pop('update', result);

    editorEventBus.emit(EditorEvents.updateTimeline, result);
    return result;
  };

  let eventFunctions: { [key: string]: (e: any) => void } = {};
  eventFunctions.mousedown = (e: MouseEvent) => {
    console.log(e.offsetX, e.offsetY, "e.offsetX,e.offsetY");
    const mouse = {
      x: e.offsetX,
      y: e.offsetY,
    };
    xArray = [];

    if (
      Math.abs(
        e.offsetX -
          window.timelineScrollX -
          (window.currentFrame * window.timelineXScale) / 6,
      ) < 5 ||
      (1 < e.offsetY && e.offsetY < 30)
    ) {
      window.timelineAction = "timeLinePointerMoving";
    } else if (170 < e.offsetY) {
      window.timelineAction = "timeLineSliderMoving";
    } else {
      timelineGraphs.forEach((shape) => {
        shape.selected = false;
        const offset = {
          x: mouse.x - shape.x,
          y: mouse.y - shape.y,
        };
        const timelineAction = shape.isMouseInGraph(mouse);
        console.log(timelineAction, "timelineAction");
        if (timelineAction) {
          shape.selected = true;
          checkisCutable();
          // window.handleMonitorSelectItem_function(shape.id);
          editorEventBus.emit(EditorEvents.itemSelected, true);
          editorEventBus.emit(EditorEvents.handleSelectItem, shape.id as any);
          tempGraphArr.push(shape);
          window.timelineAction = timelineAction;
        } else {
          xArray.push(shape.x);
          xArray.push(shape.x + shape.w);
        }
      });
    }
    if (window.timelineAction === "none") {
      // window.clearMonitorSelectItem_function();
      editorEventBus.emit(EditorEvents.clearMonitorSelectItem);
    } else if (window.timelineAction === "edge0") {
      vEdge[0] = tempGraphArr[0].x - tempGraphArr[0].startPoint;
      vEdge[1] = tempGraphArr[0].x + tempGraphArr[0].w;
    } else if (window.timelineAction === "edge1") {
      vEdge[0] = 0;
      vEdge[1] = -tempGraphArr[0].startPoint + tempGraphArr[0].duration;
      console.log(vEdge[1], "vEdge[1]");
    }
    clearCanvas();
    drawGraph();
    e.preventDefault();
  };

  eventFunctions.mousemoveFordocument = (e: MouseEvent) => {
    if (window.timelineAction === "timeLineSliderMoving") {
      window.timelineScrollX -=
        (e.movementX / (canvasDom!.width / pixRatio - timelineXScaleWidth)) *
        timelineXScalemax;
      window.timelineScrollX = Math.min(0, window.timelineScrollX);
      window.timelineScrollX = Math.max(
        -timelineXScalemax,
        window.timelineScrollX,
      );
      clearCanvas();
      drawGraph();
    }
    if (window.timelineAction === "timeLinePointerMoving") {
      window.currentFrame += (e.movementX / window.timelineXScale) * 6;

      if (window.currentFrame < 0) window.currentFrame = 0;
      window.currentTime = Math.floor((window.currentFrame * 1000) / 60);
      editorEventBus.emit(
        EditorEvents.editorUpdateCurrentTime,
        window.currentTime,
      );
      clearCanvas();
      drawGraph();

      editorEventBus.emit(EditorEvents.redrawMonitor, true as any);
    }
  };
  eventFunctions.mouseupForDocument = (e: MouseEvent) => {
    window.timelineAction = "none";
  };
  eventFunctions.mousemove = (e: MouseEvent) => {
    const mouse = {
      x: e.offsetX,
      y: e.offsetY,
    };

    let needtuPaint: boolean = true;
    for (const shape of timelineGraphs) {
      shape.hover = false;
      if (needtuPaint) {
        const timelineAction = shape.isMouseInGraph(mouse);
        if (timelineAction) {
          shape.hover = true;
          clearCanvas();
          drawGraph();
          needtuPaint = false;
        }
      }

      // needtuPaint = true
    }
    if (needtuPaint) {
      clearCanvas();
      drawGraph();
    }

    if (
      Math.abs(
        e.offsetX -
          window.timelineScrollX -
          (window.currentFrame * window.timelineXScale) / 6,
      ) < 5
    ) {
      canvasDom!.style.cursor = "pointer";
    } else {
      canvasDom!.style.cursor = "auto";
    }
    // console.log('window.timelineAction move',window.timelineAction)
    if (window.timelineAction === "timeLinePointerMoving") {
    } else if (tempGraphArr[tempGraphArr.length - 1]) {
      const shape = tempGraphArr[tempGraphArr.length - 1];
      if (1 < e.offsetY && e.offsetY < 50) {
        window.timelineScrollY = Math.min(
          Math.max(window.timelineScrollY + 3, timelineScrollYMin),
          timelineScrollYMax,
        );
        if (window.timelineScrollY < timelineScrollYMax) shape.y -= 3;
      }
      if (
        canvasDom.offsetHeight - 30 < e.offsetY &&
        e.offsetY < canvasDom.offsetHeight
      ) {
        window.timelineScrollY = Math.min(
          Math.max(window.timelineScrollY - 3, timelineScrollYMin),
          timelineScrollYMax,
        );
        if (window.timelineScrollY > timelineScrollYMin) shape.y += 3;
      }

      if (e.offsetX > canvasDom!.width - 35 && window.timelineScrollX > -2400) {
        if (window.timelineAction === "edge1") {
          shape.w += 1 / window.timelineXScale;
        } else {
          shape.x += 1 / window.timelineXScale;
        }
        window.timelineScrollX -= 1;
      } else if (e.offsetX < 35 && window.timelineScrollX < 0) {
        shape.x -= 1 / window.timelineXScale;
        window.timelineScrollX += 1;
        if (shape.x < 0) shape.x = 0;
      }

      if (window.timelineAction === "edge0") {
        shape.x += e.movementX / window.timelineXScale;
        shape.w -= e.movementX / window.timelineXScale;
        if (shape.type == "video" || shape.type == "audio") {
          shape.x = Math.min(Math.max(vEdge[0], shape.x), vEdge[1] - 1);
          shape.startPoint = shape.x - vEdge[0];
          shape.w = vEdge[1] - shape.x;
          // shape.endPoint =  vEdge[1] - vEdge[0]
        } else {
          shape.w = Math.max(10 / window.timelineXScale, shape.w);
        }

        if (shape.x < 0) shape.x = 0;
        clearCanvas();
        drawGraph();
      } else if (window.timelineAction === "edge1") {
        // console.log(e.movementX / window.timelineXScale)
        shape.w += e.movementX / window.timelineXScale;
        // console.log(shape.w)
        if (shape.type == "video" || shape.type == "audio") {
          shape.w = Math.min(Math.max(vEdge[0] + 1, shape.w), vEdge[1]);
          shape.endPoint = shape.w + shape.startPoint;
        } else {
          shape.w = Math.max(10 / window.timelineXScale, shape.w);
        }

        clearCanvas();
        drawGraph();
      } else if (window.timelineAction === "move") {
        shape.x += e.movementX / window.timelineXScale;
        if (shape.x < 0) shape.x = 0;
        const x = checkIfAttach(shape.x, shape.w);
        shape.y += e.movementY;
        clearCanvas();
        if (x) {
          shape.x = x[0];
        }
        shape.drawTheLineonHover();
        checkIfInsideMove(shape, e.offsetX, shape.y);
        drawGraph();
        if (x) {
          shape.drawTheXAttach(x[1] ? shape.x + shape.w : shape.x);
        }
      }
    }
  };

  eventFunctions.mouseup = (e: MouseEvent) => {
    const shape = tempGraphArr[tempGraphArr.length - 1];

    if (shape && shape.type == "audio") {
      if (shape.y < shape.baseLineBottom - 24) {
        shape.y += 1000;
      }
    }
    if (shape) {
      // shape.y = Math.floor((shape.y + 14) / timelineHeight) * timelineHeight;
      console.log(shape.checkisGap(shape.y + 10), "checkisGap?????");
      if (shape.checkisGap(shape.y + 10)) {
        gapAboveMoveUP(shape.calLayer(shape.y + 10));
      }
      shape.y = shape.mapYposition(shape.y + 10);
      checkIfInsideMove(shape, e.offsetX, shape.y, false);
      checkIfInsidetoInsert(shape, e.offsetX);
      // shape.y = Math.floor((shape.y + 14) / timelineHeight) * timelineHeight;
      // shape.y = shape.mapYposition(shape.y + 10)
      shape.layer = shape.calLayer(shape.y + 10);
      shape.h = shape.layer == 0 ? 40 : 28;

      checkIfLayerEmpty(shape);
      mainTrackToZeroLoop();
      // if(shape.layer == 0) {

      mainTrackSticky();
      // }
      clearCanvas();
      drawGraph();
    }
    // console.log('window.timelineAction',window.timelineAction)
    if (1 < e.offsetY && e.offsetY < 30) {
      window.currentFrame = Math.max(
        0,
        ((e.offsetX - window.timelineScrollX) * 6) / window.timelineXScale,
      );
      window.currentTime = Math.floor((window.currentFrame * 1000) / 60);
      editorEventBus.emit(
        EditorEvents.editorUpdateCurrentTime,
        window.currentTime,
      );
      clearCanvas();
      drawGraph();

      editorEventBus.emit(EditorEvents.redrawMonitor, true as any);
    }
    checkisCutable();
    console.log(timelineGraphs);
    tempGraphArr = [];
    getXArray(timelineGraphs);
    exportJson();
    calcDuration();
  };

  eventFunctions.mousewheel = (e: WheelEvent) => {
    e.preventDefault();
    window.timelineScrollX = Math.min(
      Math.max(window.timelineScrollX + e.deltaX, -2400),
      0,
    );
    console.log(timelineScrollYMin);
    console.log(timelineScrollYMax);
    window.timelineScrollY = Math.min(
      Math.max(window.timelineScrollY + e.deltaY, timelineScrollYMin),
      timelineScrollYMax,
    );
    clearCanvas();
    drawGraph();
    getXArray(timelineGraphs);
  };

  const addevents = () => {
    if (canvasDom) {
      canvasDom.addEventListener("mousedown", eventFunctions.mousedown, false);
      document.addEventListener(
        "mousemove",
        eventFunctions.mousemoveFordocument,
        false,
      );
      document.addEventListener(
        "mouseup",
        // (e) => {
        eventFunctions.mouseupForDocument as any,
        // },
        false,
      );
      canvasDom.addEventListener(
        "mousemove",
        (e) => {
          eventFunctions.mousemove(e);
        },
        false,
      );
      canvasDom.addEventListener(
        "mouseup",
        (e) => {
          eventFunctions.mouseup(e);
        },
        false,
      );
      canvasDom.addEventListener(
        "mouseout",
        (e) => {
          eventFunctions.mouseup(e);
        },
        false,
      );
      canvasDom.addEventListener(
        "wheel",
        (e) => {
          eventFunctions.mousewheel(e);
        },
        false,
      );
    }
  };

  const removeEvents = () => {
    if (canvasDom) {
      canvasDom.removeEventListener(
        "mousedown",
        (e) => {
          eventFunctions.mousedown(e);
        },
        false,
      );
      canvasDom.removeEventListener(
        "mousemove",
        (e) => {
          eventFunctions.mousemove(e);
        },
        false,
      );
      canvasDom.removeEventListener(
        "mouseup",
        (e) => {
          eventFunctions.mouseup(e);
        },
        false,
      );
      canvasDom.removeEventListener(
        "mouseout",
        (e) => {
          eventFunctions.mouseup(e);
        },
        false,
      );
      canvasDom.removeEventListener(
        "wheel",
        (e) => {
          eventFunctions.mousewheel(e);
        },
        false,
      );
    }
  };

  const initJsonForCanvas = async (_data: any) => {
    console.log(_data);
    const items: any[] = [];
    // for (const item of _data) {
    for (const variable in _data) {
      // if (item.hasOwnProperty(variable)) {
      if (variable === "bg_musics") {
        const bg_musics_item = _data[variable][0];
        items.push({
          id: bg_musics_item.id,
          x: bg_musics_item.start_time,
          w: bg_musics_item.end_time - bg_musics_item.start_time,
          y: 2,
          type: "audio",
        });
      }
      if (variable === "elements") {
        for (const elementsItem of _data[variable]) {
          items.push({
            id: elementsItem.id,
            x: elementsItem.start_time,
            w: elementsItem.end_time - elementsItem.start_time,
            y: elementsItem.layer_number,
            type: elementsItem.type,
          });
        }
      }
    }

    // y * timelineHeight + canvasDom.height / 2 - (y == 0 ? 24:timelineHeight / 2),
    // w:w / 100,
    // h:y == 0 ? 40:timelineHeight,
    // }
    // }
    // }
    // }
    // }

    timelineCtx!.clearRect(0, 0, canvasDom!.width, canvasDom!.height);
    timelineGraphs = [];
    for (const item of items) {
      await addElement(item.id, item.x, item.y, item.w, item.type);
    }

    drawGraph();
    calcDuration();
  };

  const initCanvas = async () => {
    if (window.initReady) return false;

    canvasDom = document.getElementById("timeLineCanvas") as HTMLCanvasElement;

    // canvasDom.width = canvasDom.offsetWidth;
    // canvasDom.width = canvasDom.offsetWidth;
    // timelineCtx = canvasDom.getContext('2d');
    pixRatio = getPixRatio(canvasDom.getContext("2d"));
    canvasDom.width = canvasDom.offsetWidth * pixRatio;
    canvasDom.height = canvasDom.offsetHeight * pixRatio;
    // canvasDom.style.width = w + "px";
    // canvasDom.style.height = h + "px";
    timelineCtx = canvasDom.getContext("2d");
    timelineCtx!.setTransform(pixRatio, 0, 0, pixRatio, 0, 0);
    // timelineCtx.pixRatio = pixRatio
    window.initReady = true;
    window.timelineScrollX = 0;
    window.timelineScrollY = 0;
    window.timelineXScale = 10;
    window.currentFrame = 0;
    window.videoFps = 60;
    window.currentTime = 0;
    timelineXScalemax =
      (projectDurationMax / 100) * window.timelineXScale -
      canvasDom!.width / pixRatio;
    timelineXScaleWidth =
      ((canvasDom!.width / pixRatio) * (canvasDom!.width / pixRatio)) /
      ((projectDurationMax / 100) * window.timelineXScale);
    editorEventBus.on(EditorEvents.updateTimelineReverse, async (items) => {
      await updateTimelineReverse(items);
      clearCanvas();
      drawGraph();
    });
    editorEventBus.on(EditorEvents.clearTimelineSelectItem, () => {
      clearSelectItem();
      clearCanvas();
      drawGraph();
    });
    editorEventBus.on(EditorEvents.timelineHandleSelectItem, (_id) => {
      clearSelectItem();
      handleSelectItem(_id);
      clearCanvas();
      drawGraph();
    });
    editorEventBus.on(EditorEvents.redrawTimeline, (_id) => {
      timelineXScalemax =
        (projectDurationMax / 100) * window.timelineXScale -
        canvasDom!.width / pixRatio;
      timelineXScaleWidth =
        ((canvasDom!.width / pixRatio) * (canvasDom!.width / pixRatio)) /
        ((projectDurationMax / 100) * window.timelineXScale);
      clearCanvas();
      drawGraph();
    });
    editorEventBus.on(EditorEvents.updateTimeline, (_id) => {
      clearCanvas();
      drawGraph();
    });

    // window.timelineAddElement_function = async (item: any) => {
    //   await addElement(item.id, item.x, item.y, item.w, item.type);
    //   exportJson();
    //   clearCanvas();
    //   drawGraph();
    // };

    addevents();
    drawGraph();
    // initJsonForCanvas(sample.data);
  };

  const timelineAddElement_function = async (item: any) => {
    await addElement(item.id, item.x, item.y, item.w, item.type);

    clearCanvas();
    drawGraph();
    exportJson();
    calcDuration();
  };

  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
      }}
    >
      <canvas
        id="timeLineCanvas"
        className="canvasBase"
        width="1500"
        height="241"
      ></canvas>
    </div>
  );
};

export const Timelinememo = memo(Timeline);
