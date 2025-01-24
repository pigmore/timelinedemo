import { FC, useState, useEffect, memo, createRef, RefObject } from "react";
import { cloneDeep, isEqual } from "lodash";
import deepEqual from "deep-equal";
import { sample } from "./sample";
import loading from "./icon/loading.svg";
import {
  drawCircleIcon,
  loadImgProssse,
  loadImgByDom,
  drawEdgePoint,
  randomInt,
  secondTrans,
  // clone,
  saveTemplateAsFile,
  loadTextProssse,
  loadVideoProssse,
  loadAudioProssse,
  drawRotatePoint,
  exportTextboxtoBase64,
  uuid,
} from "./util";
import { MonitorGraph } from "./monitorGraph";
import { FullScreenControl } from "./fullScreenControl";
import { EditorEvents, editorEventBus } from "./event-tool";
interface MonitorProps {
  // Define any props if needed
  eventBus: any;
}

const Monitor: FC<MonitorProps> = (props) => {
  // const [monitorloading, setMonitorloading] = useState(false);
  const monitorTextCoverRef: RefObject<HTMLTextAreaElement> = createRef();
  const monitorCanvasCoverRef: RefObject<HTMLCanvasElement> = createRef();
  const monitorCanvaRef: RefObject<HTMLCanvasElement> = createRef();
  const STROKE_COLOR: string = "#ff2b5d";
  let canvasDom: HTMLCanvasElement;
  let canvasCoverDom: HTMLCanvasElement;
  let monitorloadingDom: HTMLCanvasElement;
  let monitorCanvasRatio: number = 1;
  let monitorCtx: CanvasRenderingContext2D | null;
  let monitorCoverCtx: CanvasRenderingContext2D | null;
  let monitorGraphs: MonitorGraph[] = [];
  let selectedItem: any[] = [];
  let monitorGraphsIn: MonitorGraph[] = [];
  let mouseDownX: number = 0;
  let mouseDownY: number = 0;
  let disTop: number = 0;
  let disLeft: number = 0;
  let currentGraph: MonitorGraph;
  let monitorAction: string = "";
  let history: any[] = [];
  let historyIndex: number;
  let monitorCurrentTime: string = "00:00";
  let fullscreenPlayBtn: boolean = false;
  window.currentTime = 0;

  const alignElement = (_align: string): void => {
    if (selectedItem.length == 0) return;
    const shape = selectedItem[0];
    switch (_align) {
      case "left":
        shape.centerX = shape.w / 2;
        break;

      case "right":
        shape.centerX = canvasDom.width - shape.w / 2;
        break;

      case "hcenter":
        shape.centerX = canvasDom.width / 2;
        break;

      case "top":
        shape.centerY = shape.h / 2;
        break;

      case "bottom":
        shape.centerY = canvasDom.height - shape.h / 2;
        break;

      case "vcenter":
        shape.centerY = canvasDom.height / 2;
        break;

      default:
        break;
    }
    clearBorder();
    drawGraphs();
    actionUpateHistory();
  };
  const setBgcolor = (_color: string): void => {
    window.projConfig.bgColor = _color;
    window.projConfig.bgUrl = "";
    document.getElementById("monitor_canvas")!.style.background = _color;
  };
  const setBgUrl = (_url: string): void => {
    window.projConfig.bgUrl = _url;
    window.projConfig.bgColor = "";
    document.getElementById("monitor_canvas")!.style.background =
      `url('${_url}')`;
  };
  const redo = (): void => {
    historyIndex = Math.min(historyIndex + 1, history.length - 1);
    monitorGraphs = cloneDeep(history[historyIndex].monitorGraphs) || [];
    if (window.projConfig.ratio != history[historyIndex].projConfig.ratio) {
      editorEventBus.emit(
        EditorEvents.switchRatio,
        history[historyIndex].projConfig.ratio,
      );
    }
    window.projConfig = cloneDeep(history[historyIndex].projConfig);
    selectedItem = [];
    clearBorder();
    updateTimelinebyHistroy();
    drawGraphs(true);
    editorEventBus.emit(EditorEvents.editorUndoRedoable, [
      historyIndex > 0 ? true : false,
      historyIndex == history.length - 1 ? false : true,
    ]);
  };
  const undo = (): void => {
    historyIndex = Math.max(historyIndex - 1, 0);
    monitorGraphs = cloneDeep(history[historyIndex].monitorGraphs) || [];
    if (window.projConfig.ratio != history[historyIndex].projConfig.ratio) {
      editorEventBus.emit(
        EditorEvents.switchRatio,
        history[historyIndex].projConfig.ratio,
      );
    }
    window.projConfig = cloneDeep(history[historyIndex].projConfig);
    selectedItem = [];
    clearBorder();
    updateTimelinebyHistroy();
    drawGraphs(true);
    editorEventBus.emit(EditorEvents.editorUndoRedoable, [
      historyIndex > 0 ? true : false,
      historyIndex == history.length - 1 ? false : true,
    ]);
  };
  const actionUpateHistory = (
    windowsettingAtionsBool: boolean = false,
  ): void => {
    try {
      let snapshot = cloneDeep(monitorGraphs);
      snapshot.forEach((object) => {
        object["selected"] = false;
        object["onfocus"] = false;
        object["focused"] = false;
        object["playCurrentTime"] = 0;
      });
      let historyItem = {
        projConfig: cloneDeep(window.projConfig),
        monitorGraphs: snapshot,
      };
      if (
        historyIndex != history.length - 1 &&
        !deepEqual(history[historyIndex], historyItem)
      ) {
        history.push(historyItem);
        history.splice(historyIndex + 1, history.length - (historyIndex + 2));

        historyIndex = history.length - 1;
      } else if (!deepEqual(history[history.length - 1], historyItem)) {
        history.push(historyItem);
        historyIndex = history.length - 1;
      }
    } catch (error) {
      history.push([]);
      historyIndex = 0;
    }
    console.log("history", history);
    // editorScreenIsEmpty
    editorEventBus.emit(
      EditorEvents.editorScreenIsEmpty,
      monitorGraphs.length == 0 ? true : false,
    );

    editorEventBus.emit(EditorEvents.editorUndoRedoable, [
      historyIndex > 0 ? true : false,
      historyIndex == history.length - 1 ? false : true,
    ]);
  };

  const clearBorder = (): void => {
    if (monitorCoverCtx) {
      monitorCoverCtx.clearRect(
        0,
        0,
        canvasCoverDom.width,
        canvasCoverDom.height,
      );
    }
  };
  const drawBorder = (item: MonitorGraph): void => {
    if (monitorCoverCtx) {
      monitorCoverCtx.clearRect(
        0,
        0,
        canvasCoverDom.width,
        canvasCoverDom.height,
      );

      monitorCoverCtx.save();

      monitorCoverCtx.translate(
        disLeft * monitorCanvasRatio,
        disTop * monitorCanvasRatio,
      );

      monitorCoverCtx.translate(
        canvasCoverDom.width / 2,
        canvasCoverDom.height / 2
      );

      monitorCoverCtx.scale(window.zoomScale,window.zoomScale)

      monitorCoverCtx.drawImage(
        canvasDom,
        (0 - canvasDom.width) / 2,
        (0 - canvasDom.height) / 2,
        canvasDom.width,
        canvasDom.height,
      );
      monitorCoverCtx.translate(
        -canvasCoverDom.width / 2,
        -canvasCoverDom.height / 2
      );
      // monitorCoverCtx.fillStyle = "white";
      // monitorCoverCtx.fillRect(0, 0, canvasCoverDom!.width, canvasCoverDom!.height);


      monitorCoverCtx.setLineDash([4, 5]);
      monitorCoverCtx.lineWidth = 2;
      monitorCoverCtx.strokeStyle = STROKE_COLOR;
      monitorCoverCtx.translate(item.centerX, item.centerY);
      monitorCoverCtx.rotate((item.rotate * Math.PI) / 180);
      // monitorCtx.translate(item.centerX, item.centerY);
      monitorCoverCtx.strokeRect(-item.w / 2, -item.h / 2, item.w, item.h);
      if (item.type !== "textbox") {
        drawEdgePoint(
          monitorCoverCtx,
          -item.w / 2,
          -item.h / 2,
          item.w,
          item.h,
        );
      } else {
        drawRotatePoint(
          monitorCoverCtx,
          -item.w / 2,
          -item.h / 2,
          item.w,
          item.h,
        );
      }

      monitorCoverCtx.restore();
    }
  };

  const clearSelectItem = (): void => {
    monitorGraphs.forEach((item) => {
      item.selected = false;
      item.onfocus = false;
      item.focused = false;
    });
    editorEventBus.emit(EditorEvents.itemSelected, false);

    selectedItem = [];
    clearBorder();
  };

  const handleSelectItem = (_id: string): void => {
    clearSelectItem();
    const foundItem = monitorGraphs.find((item) => item.id === _id);
    if (foundItem) {
      foundItem.selected = true;
      selectedItem = monitorGraphs.filter((item) => item.selected === true);
      // if (foundItem.type == 'textbox'){
      // console.log(foundItem.initconfig!.fontSize!)
      editorEventBus.emit(EditorEvents.exportElementAttribution, foundItem);
      editorEventBus.emit(EditorEvents.itemSelected, true);
      // }
    }
  };

  const monitorDuplicateElement = (
    _idOld: string,
    _id: string,
    _deltaX: number,
  ): void => {
    const duplicateItem = monitorGraphs.find((item) => item.id === _idOld);
    if (duplicateItem) {
      let clone = Object.assign(
        Object.create(
          Object.getPrototypeOf(
            new MonitorGraph({
              id: duplicateItem.id,
              x: duplicateItem.x,
              y: duplicateItem.y,
              w: duplicateItem.w,
              h: duplicateItem.h,
              r: duplicateItem.rotate,
              s: duplicateItem.scale,
              text: duplicateItem.text,
              type: duplicateItem.type,
              url: duplicateItem.url,
              loadedSrc: duplicateItem.loadedSrc,
              canvas: canvasDom,
              startTime: duplicateItem.startTime,
              endTime: duplicateItem.endTime,
              initconfig: duplicateItem.initconfig,
              startPoint: duplicateItem.startPoint || 0,
              endPoint: duplicateItem.endPoint || 0,
            }),
          ),
        ),
        duplicateItem,
      );
      clone.id = _id;
      if (clone.type === "video" || clone.type === "audio") {
        clone.startTime += _deltaX;
        clone.startPoint += _deltaX;
        duplicateItem.endTime = duplicateItem.startTime + _deltaX;
        duplicateItem.endPoint = duplicateItem.startPoint! + _deltaX;
      }

      monitorGraphs.push(clone);
    }
    actionUpateHistory();
  };

  const updateTimelinebyHistroy = (): void => {
    let result: any[] = [];
    for (const item of monitorGraphs) {
      const temp = {
        id: item.id,
        x: item.startTime / 100,
        layer: item.layer_number,
        type: item.type,
        w: (item.endTime - item.startTime) / 100,
      };
      result.push(temp);
    }
    editorEventBus.emit(EditorEvents.updateTimelineReverse, result);
  };
  const updateElementFromTimeline = (_elarray: any): void => {
    for (const item of _elarray) {
      for (const _item of monitorGraphs) {
        if (_item.id === item.id) {
          _item.startTime = Number(item.x as number);
          _item.endTime = Number(
            parseInt(item.x.toString()) + parseInt(item.w.toString()),
          );
          _item.layer_number = item.layer;
          _item.startPoint = item.startPoint;
          _item.endPoint = item.endPoint;
          break;
        }
      }
    }
    monitorGraphs.sort((a, b) => a.layer_number! - b.layer_number!);
    drawGraphs(true);
    console.log("history timeline");
    actionUpateHistory();
  };

  const addEvents = (): void => {
    if (canvasDom) {
      canvasDom.addEventListener("mousedown", function (e: MouseEvent) {
        console.log(monitorGraphs);
        mouseDownX =
          (e.clientX - canvasDom.getBoundingClientRect().left) *
          monitorCanvasRatio;
        mouseDownY =
          (e.clientY - canvasDom.getBoundingClientRect().top) *
          monitorCanvasRatio;

        monitorAction = "";
        monitorGraphs.forEach((item) => {
          item.selected = false;
          item.onfocus = false;
          item.focused = false;
        });
        console.log(monitorGraphs, "monitorGraphs");
        monitorGraphsIn = [];
        for (const shape of monitorGraphs) {
          const _monitorActiontemp = shape.isMouseInGraph({
            x: mouseDownX,
            y: mouseDownY,
          });
          if (_monitorActiontemp != "none" && _monitorActiontemp != "0") {
            monitorGraphsIn.push(shape);
            monitorAction = _monitorActiontemp;
            currentGraph = cloneDeep(shape);
            if (selectedItem.length > 0 && shape.id == selectedItem[0].id) {
              break;
            }
          }
        }

        if (monitorGraphsIn.length > 0) {
          const shape = monitorGraphsIn[monitorGraphsIn.length - 1];
          shape.selected = true;
          editorEventBus.emit(EditorEvents.timelineHandleSelectItem, shape.id);
          editorEventBus.emit(EditorEvents.exportElementAttribution, shape);
          editorEventBus.emit(EditorEvents.itemSelected, true);
          drawGraphs();
          if (
            selectedItem.length > 0 &&
            shape.id === selectedItem[0].id &&
            shape.type === "textbox"
          ) {
            shape.onfocus = true;
            monitorCanvasCoverRef.current!.style.display = "block";
            monitorCanvasCoverRef.current!.style.pointerEvents = "all";
            drawGraphs();
          } else {
            selectedItem = monitorGraphs.filter(
              (item) => item.selected === true,
            );
            monitorCanvasCoverRef.current!.style.display = "block";
            monitorCanvasCoverRef.current!.style.pointerEvents = "all";
            drawGraphs();
          }
        } else {
          selectedItem = [];
          editorEventBus.emit(EditorEvents.clearTimelineSelectItem);
          editorEventBus.emit(EditorEvents.itemSelected, false);
          clearBorder();
          drawGraphs();
        }
      });
      canvasCoverDom.addEventListener("mousedown", function (e: MouseEvent) {
        console.log(monitorGraphs);
        mouseDownX =
          (e.clientX - canvasDom.getBoundingClientRect().left) *
          monitorCanvasRatio;
        mouseDownY =
          (e.clientY - canvasDom.getBoundingClientRect().top) *
          monitorCanvasRatio;

        monitorAction = "";
        monitorGraphs.forEach((item) => {
          item.selected = false;
          item.onfocus = false;
          item.focused = false;
        });
        console.log(monitorGraphs, "monitorGraphs");
        monitorGraphsIn = [];
        for (const shape of monitorGraphs) {
          const _monitorActiontemp = shape.isMouseInGraph({
            x: mouseDownX,
            y: mouseDownY,
          });
          if (_monitorActiontemp != "none" && _monitorActiontemp != "0") {
            monitorGraphsIn.push(shape);
            monitorAction = _monitorActiontemp;
            currentGraph = cloneDeep(shape);
            if (selectedItem.length > 0 && shape.id == selectedItem[0].id) {
              break;
            }
          }
        }

        if (monitorGraphsIn.length > 0) {
          const shape = monitorGraphsIn[monitorGraphsIn.length - 1];
          shape.selected = true;
          editorEventBus.emit(EditorEvents.timelineHandleSelectItem, shape.id);
          editorEventBus.emit(EditorEvents.exportElementAttribution, shape);
          editorEventBus.emit(EditorEvents.itemSelected, true);
          drawGraphs();
          if (
            selectedItem.length > 0 &&
            shape.id === selectedItem[0].id &&
            shape.type === "textbox"
          ) {
            shape.onfocus = true;
            monitorCanvasCoverRef.current!.style.display = "block";
            monitorCanvasCoverRef.current!.style.pointerEvents = "all";
            drawGraphs();
          } else {
            selectedItem = monitorGraphs.filter(
              (item) => item.selected === true,
            );
            monitorCanvasCoverRef.current!.style.display = "block";
            monitorCanvasCoverRef.current!.style.pointerEvents = "all";
            drawGraphs();
          }
        } else {
          selectedItem = [];
          editorEventBus.emit(EditorEvents.clearTimelineSelectItem);
          editorEventBus.emit(EditorEvents.itemSelected, false);
          clearBorder();
          drawGraphs();
        }
      });

      canvasCoverDom.addEventListener("mouseup", function (e: MouseEvent) {
        const textSelectedid =
          selectedItem.length > 0 ? selectedItem[0].id : "";

        if (monitorGraphsIn[monitorGraphsIn.length - 1]) {
          const shape = monitorGraphsIn[monitorGraphsIn.length - 1];
          shape._rotateSquare();
          if (shape.onfocus && monitorAction === "move") {
            shape.focused = true;
            console.log(shape.focused, "???");
            if (monitorTextCoverRef.current) {
              monitorTextCoverRef.current.style.color = shape.initconfig!
                .fill as string;
              monitorTextCoverRef.current.style.fontSize =
                shape.initconfig!.fontSize! / monitorCanvasRatio + "px";
              monitorTextCoverRef.current.style.fontFamily = shape.initconfig!
                .fontFamily as string;
              monitorTextCoverRef.current.style.display = "block";
              monitorTextCoverRef.current.style.textAlign =
                shape.initconfig!.textAlign!;
              monitorTextCoverRef.current.style.fontWeight = shape.initconfig!
                .bold
                ? "bold"
                : "";
              monitorTextCoverRef.current.style.fontWeight = shape.initconfig!
                .bold
                ? "bold"
                : "";
              monitorTextCoverRef.current.style.fontStyle = shape.initconfig!
                .italic
                ? "italic"
                : "";
              monitorTextCoverRef.current.style.fontStyle = shape.initconfig!
                .italic
                ? "italic"
                : "";
              monitorTextCoverRef.current.style.width =
                shape.w / monitorCanvasRatio + "px";
              // 100 + "%";
              monitorTextCoverRef.current.style.height =
                shape.h / monitorCanvasRatio + "px";
              monitorTextCoverRef.current.style.left =
                shape.centerX / monitorCanvasRatio + "px";
              // 0 + "px";
              monitorTextCoverRef.current.style.top =
                shape.centerY / monitorCanvasRatio + "px";
              monitorTextCoverRef.current.style.transform =
                " translate(-50%, -50%)" +
                ` rotate(${shape.rotate}deg)` +
                " translate(0%, 2%)";
              // monitorTextCoverRef.current.style.rotate =  + "deg";
              monitorTextCoverRef.current.value = shape.text as string;
              monitorTextCoverRef.current.focus();
            }
          }
          drawGraphs();
          monitorGraphsIn = [];
          editorEventBus.emit(EditorEvents.exportElementAttribution, shape);
          actionUpateHistory();
          monitorCanvasCoverRef.current!.style.pointerEvents = "none";
          monitorCanvaRef.current!.style.pointerEvents = "all";
        } else {
          monitorCanvasCoverRef.current!.style.display = "none";
          monitorCanvasCoverRef.current!.style.pointerEvents = "all";
          monitorCanvaRef.current!.style.pointerEvents = "all";
        }
      });

      canvasCoverDom.addEventListener("mousemove", function (e: MouseEvent) {
        if (selectedItem.length > 0) {
          if (
            selectedItem[0].isinCorner(
              e.offsetX * monitorCanvasRatio,
              e.offsetY * monitorCanvasRatio,
            ) ||
            selectedItem[0].isinRotate(
              e.offsetX * monitorCanvasRatio,
              e.offsetY * monitorCanvasRatio,
            ) ||
            selectedItem[0].isinMiddlePoint(
              e.offsetX * monitorCanvasRatio,
              e.offsetY * monitorCanvasRatio,
            )
          ) {
            canvasDom.style.cursor = "pointer";
          } else {
            canvasDom.style.cursor = "auto";
          }
        }
        if (monitorGraphsIn[monitorGraphsIn.length - 1]) {
          const shape = monitorGraphsIn[monitorGraphsIn.length - 1];
          if (shape.focused) return;
          if (Math.abs(e.movementX) >= 1 || Math.abs(e.movementY) > 1) {
            shape.onfocus = false;
          }
          // mouseX =
          switch (monitorAction) {
            case "move":
              // shape.x += e.movementX * monitorCanvasRatio;
              // shape.y += e.movementY * monitorCanvasRatio;
              shape.centerX += e.movementX * monitorCanvasRatio;
              shape.centerY += e.movementY * monitorCanvasRatio;
              drawGraphs();
              break;
            case "rotate":
              shape.rotateAction(
                mouseDownX,
                mouseDownY,
                (e.offsetX - disLeft) * monitorCanvasRatio,
                (e.offsetY - disTop) * monitorCanvasRatio,
                currentGraph,
              );
              drawGraphs();
              break;
            // case "scale3":

            default:
              shape.transformVertex(monitorAction, [
                e.movementX * monitorCanvasRatio,
                e.movementY * monitorCanvasRatio,
              ]);
              drawGraphs();
              break;
              break;
          }
        }
      });
    }
  };

  const updateElementAttribute = (item: any): void => {
    if (selectedItem.length == 0) return;
    for (const variable in item) {
      if (selectedItem[0]!.hasOwnProperty(variable)) {
        if (variable == "initconfig") {
          for (const key in item[variable]) {
            selectedItem[0].initconfig![key as any] = item.initconfig[key];
          }
        } else {
          selectedItem[0][variable as keyof MonitorGraph] = item[variable];
        }
      }
    }
    selectedItem[0]._rotateSquare();

    drawGraphs(true);
    actionUpateHistory();
  };
  const addElement = async (item: any): Promise<void> => {
    let initconfig = item.initconfig || {};
    initconfig.opacity = item.opacity || 1;
    initconfig.volume = item.volume || 1;
    if (item.type === "image" || item.type === "avatar") {
      let loadedSrc: any;
      if (!item.loadedSrc) {
        loadedSrc = await loadImgProssse(item.id, item.url);
      } else {
        loadedSrc = item.loadedSrc;
      }
      const graph = await new MonitorGraph({
        id: item.id,
        x: (item.offset_x || canvasDom!.width / 2) - item.width / 2,
        y: (item.offset_y || canvasDom!.height / 2) - item.height / 2,
        w: item.width,
        h: item.height,
        r: item.angle || 0,
        s: item.scale_x || 1,
        text: item.type,
        type: item.type,
        url: item.url,
        loadedSrc: loadedSrc,
        canvas: canvasDom!,
        startTime: item.start_time || 0,
        endTime: item.end_time || 1000,
        initconfig: initconfig || {},
        startPoint: item.startPoint || 0,
        endPoint: item.endPoint || 0,
      });
      monitorGraphs.push(graph);
      drawGraphs();
    } else if (item.type === "video") {
      const graph = await new MonitorGraph({
        id: item.id,
        x: (item.offset_x || canvasDom!.width / 2) - item.width / 2,
        y: (item.offset_y || canvasDom!.height / 2) - item.height / 2,
        w: item.width,
        h: item.height,
        r: item.angle || 0,
        s: item.scale_x || 1,
        text: item.type,
        type: item.type,
        url: item.url,
        loadedSrc:
          item.loadedSrc || (await loadVideoProssse(item.url, item.id)).videoEl,
        canvas: canvasDom!,
        startTime: item.start_time || (0 as number),
        endTime: item.end_time || 1000,
        initconfig: initconfig || {},
        startPoint: item.startPoint || 0,
        endPoint: item.endPoint || 0,
      });
      monitorGraphs.push(graph);
      drawGraphs();
    } else if (item.type === "audio") {
      const graph = await new MonitorGraph({
        id: item.id,
        x: (item.offset_x || canvasDom!.width / 2) - item.width / 2,
        y: (item.offset_y || canvasDom!.height / 2) - item.height / 2,
        w: item.width,
        h: item.height,
        r: item.angle || 0,
        s: item.scale_x || 1,
        text: item.type,
        type: item.type,
        url: item.url,
        loadedSrc: item.loadedSrc || (await loadAudioProssse(item.url)).audioEl,
        canvas: canvasDom!,
        startTime: item.start_time || 0,
        endTime: item.end_time || 1000,
        initconfig: initconfig || {},
        startPoint: item.startPoint || 0,
        endPoint: item.endPoint || 0,
      });
      monitorGraphs.push(graph);
      drawGraphs();
    } else if (item.type === "textbox") {
      let textinit: any;
      if (item.initconfig != null) {
        textinit = item.initconfig;
      } else {
        textinit = sample.data[0].objects.find(
          (_item: any) => _item.id === item.id,
        );
      }
      textinit.opacity = item.opacity || 1;
      textinit.volume = item.volume || 1;

      await loadTextProssse(
        textinit!.fontFamily as string,
        textinit!.data!.fontURL!,
      );
      const graph = await new MonitorGraph({
        id: item.id,
        x: (item.offset_x || canvasDom!.width / 2) - item.width / 2,
        y: (item.offset_y || canvasDom!.height / 2) - item.height / 2,
        w: item.width,
        h: item.height,
        r: item.angle || 0,
        s: item.scale_x || 1,
        text: textinit!.text!,
        type: item.type,
        url: item.url,
        loadedSrc: null,
        canvas: canvasDom!,
        startTime: item.start_time || 0,
        endTime: item.end_time || 5000,
        initconfig: item.initconfig || textinit,
        startPoint: item.startPoint || 0,
        endPoint: item.endPoint || 0,
      });
      monitorGraphs.push(graph);
      drawGraphs();
    }
  };

  const exportProjJson = (): void => {
    console.log();
    let projJson: any = {};
    projJson.data = [];
    projJson.data[0] = {};
    projJson.data[0].width = window.projConfig.width || 1920;
    projJson.data[0].height = window.projConfig.height || 1080;
    // projJson.data[0].backgroundColor='#000000'
    // projJson.data[0].backgroundUrl=''
    projJson.data[0].background =
      window.projConfig.bgUrl || window.projConfig.bgColor || "#000000";
    projJson.data[0].ratio = window.projConfig.ratio;
    projJson.data[0].background = "#000000";
    projJson.data[0].avatarFrom = 2;
    projJson.data[0].videoUrl = "";
    projJson.data[0].sourceImage = "";
    projJson.data[0].bg_musics = [];
    projJson.data[0].elements = [];
    projJson.data[0].objects = [];
    // projJson.data[0].voice={}
    // projJson.data[0].voice.voice_url='https://drz0f01yeq1cx.cloudfront.net/1721791391640-5f92387b-1a4b-4909-8f40-2ce9f751b711-5252.mp3'

    projJson.draftId = false;
    let endTimeLast = 0;
    for (const item of monitorGraphs) {
      let elementItem: any = {};
      let objectItem: any = {};
      elementItem.id = item.id;
      elementItem.url = item.url || item.loadedSrc?.src || "";
      elementItem.scale_x = item.scaleX;
      elementItem.scale_y = item.scaleY;
      elementItem.width = item.w;
      elementItem.height = item.h;
      elementItem.offset_x = item.centerX;
      elementItem.offset_y = item.centerY;
      elementItem.angle = item.rotate;
      elementItem.opacity = item.opacity || 1;
      elementItem.type = item.type;
      elementItem.layer_number = item.layer_number;
      elementItem.start_time = item.startTime;
      elementItem.end_time = item.endTime;
      elementItem.start_point = item.startPoint;
      elementItem.end_point = item.endPoint;
      elementItem.attributes = {};

      elementItem.attributes.flipX = false;
      elementItem.attributes.flipY = false;
      objectItem.type = item.type;
      objectItem.version = "5.3.0";
      objectItem.originX = "center";
      objectItem.originY = "center";
      objectItem.left = item.centerX;
      objectItem.top = item.centerY;
      objectItem.width = item.w;
      objectItem.height = item.h;
      objectItem.fill = "rgb(0,0,0)";
      objectItem.stroke = null;
      objectItem.strokeWidth = 0;
      objectItem.scaleX = item.scaleX;
      objectItem.scaleY = item.scaleY;
      objectItem.angle = item.rotate;
      objectItem.flipX = false;
      objectItem.flipY = false;
      objectItem.opacity = item.opacity || 1;
      objectItem.shadow = 1;
      objectItem.backgroundColor = "";
      objectItem.fillRule = "nonzero";
      objectItem.paintFirst = "fill";
      objectItem.globalCompositeOperation = "source-over";
      objectItem.skewX = 0;
      objectItem.skewY = 0;
      objectItem.cropX = 0;
      objectItem.cropY = 0;
      objectItem.id = item.id;
      objectItem.src = item.url || item.loadedSrc?.src || "";
      objectItem.crossOrigin = "anonymous";
      objectItem.filters = [];

      if (item.type == "textbox") {
        elementItem.imageUrl = exportTextboxtoBase64(item);
        objectItem.fontFamily = item.initconfig!.fontFamily;
        objectItem.fontWeight = "normal";
        objectItem.fontSize = item.initconfig!.fontSize;
        objectItem.fill = item.initconfig!.fill;
        objectItem.stroke = item.initconfig!.stroke;
        objectItem.strokeWidth = item.initconfig!.strokeWidth;
        objectItem.text = item.text;
        objectItem.underline = item.initconfig!.underline || false;
        objectItem.overline = item.initconfig!.overline || false;
        objectItem.linethrough = item.initconfig!.linethrough || false;
        objectItem.textAlign = item.initconfig!.textAlign || "center";
        objectItem.fontStyle = item.initconfig!.fontStyle || "normal";
        objectItem.lineHeight = 1.16;
        objectItem.textBackgroundColor = "";
        objectItem.charSpacing = 0;
        objectItem.styles = [];
        objectItem.direction = "ltr";
        objectItem.path = null;
        objectItem.pathStartOffset = 0;
        objectItem.pathSide = "left";
        objectItem.pathAlign = "baseline";
        objectItem.minWidth = 20;
        objectItem.splitByGrapheme = false;
        objectItem.data = {};
        objectItem.data.type = "text";
        objectItem.data.fontURL =
          item.initconfig!.data!.fontURL ||
          "https://d11fbe263bhqij.cloudfront.net/public/Fonts/Anton/Anton-Regular.ttf";
      } else if (item.type == "image") {
        objectItem.data = {};
        objectItem.data.type = "image";
        objectItem.data.fontURL = item.url || item.loadedSrc.src;
      } else if (item.type == "video") {
        elementItem.volume = item.volume;
      } else if (item.type == "audio") {
        elementItem.volume = item.volume;
      }

      projJson.data[0].elements.push(elementItem);
      projJson.data[0].objects.push(objectItem);
      endTimeLast = Math.max(endTimeLast, item.endTime);
    }

    projJson.data[0].duration = endTimeLast;
    projJson.duration = endTimeLast;
    console.log("projJson::", projJson);

    saveTemplateAsFile("videoEditor.json", projJson);
  };
  const initJson = async (_data: any) => {
    const jsonTemp: any[] = [];
    // for (const item of _data) {
    for (const variable in _data) {
      if (_data.hasOwnProperty(variable)) {
        switch (variable) {
          case "elements":
            for (const elementsItem of _data[variable]) {
              jsonTemp.push(elementsItem);
            }
            break;
          case "objects":
            for (const objectItem of _data[variable]) {
              jsonTemp.find((item) => item.id === objectItem.id).initconfig =
                objectItem;
            }
            break;
          default:
        }
      }
    }
    // }
    jsonTemp.sort((a, b) => a.layer_number - b.layer_number);
    monitorGraphs = [];
    for (const item of jsonTemp) {
      await addElement(item);
    }

    actionUpateHistory();
  };

  const drawGraphs = (forceUpdate: boolean = false): void => {
    if (monitorCtx) {
      monitorCtx.clearRect(0, 0, canvasDom!.width, canvasDom!.height);
      monitorCtx.fillStyle = "black";
      monitorCtx.fillRect(0, 0, canvasDom!.width, canvasDom!.height);
      for (const graph of monitorGraphs) {
        graph.paint(forceUpdate);
      }
      if (
        selectedItem.length > 0 &&
        !selectedItem[0].focused &&
        selectedItem[0].type !== "audio" &&
        selectedItem[0].checkIfinTime()
      ) {
        drawBorder(selectedItem[0]);
      } else if (selectedItem.length > 0 && !selectedItem[0].checkIfinTime()) {
        selectedItem = [];
        clearBorder();
      }
    }
  };

  window.projConfig = {
    width: 1920,
    height: 1080,
    ratio: "16:9",
    bgColor: "black",
    bgurl: "",
  };
  window.imageFrames = {};

  const initCanvas = async (): Promise<void> => {
    canvasDom = document.getElementById("monitor_canvas") as HTMLCanvasElement;

    canvasCoverDom = document.getElementById(
      "monitor_canvasOver",
    ) as HTMLCanvasElement;
    monitorloadingDom = document.getElementById(
      "loadingwrap",
    ) as HTMLCanvasElement;
    monitorCtx = canvasDom.getContext("2d");
    monitorCoverCtx = canvasCoverDom.getContext("2d");

    disTop = canvasDom.getBoundingClientRect().top;
    disLeft = canvasDom.getBoundingClientRect().left;
    monitorCanvasRatio = canvasDom.height / canvasDom.offsetHeight;
    canvasCoverDom.style.display = "block";
    canvasCoverDom.height = canvasCoverDom.offsetHeight * monitorCanvasRatio;
    canvasCoverDom.width = canvasCoverDom.offsetWidth * monitorCanvasRatio;
    canvasCoverDom.style.display = "none";
    drawGraphs();
    // initJson(sample);
    addEvents();
    actionUpateHistory();
    // window.canvasEventDriver.register("update", (_prop: any) => {
    //   updateElement(_prop);
    // });
    editorEventBus.on(EditorEvents.updateTimeline, (_prop: any) => {
      updateElementFromTimeline(_prop);
    });

    editorEventBus.on(EditorEvents.editorLoading, (_prop: any) => {
      // setMonitorloading(_prop as boolean)
      monitorloadingDom.style.display = (_prop as boolean) ? "block" : "none";
    });
  };

  useEffect(() => {
    async function init(): Promise<void> {
      if (window.initMonitorReady !== true) {
        window.zoomScale = 1
        editorEventBus.on(EditorEvents.editorZoominout, (prop: boolean) => {
          window.zoomScale += prop ? 0.1 : -0.1
          window.zoomScale = Math.max(0.2,Math.min(window.zoomScale,2))
          drawGraphs();
        });
        editorEventBus.on(EditorEvents.alignElement, (prop: string) => {
          alignElement(prop);
        });
        editorEventBus.on(EditorEvents.setBgColor, (prop: string) => {
          setBgcolor(prop);
        });
        editorEventBus.on(EditorEvents.setBgUrl, (prop: string) => {
          setBgUrl(prop);
        });
        editorEventBus.on(EditorEvents.editorRedo, () => {
          redo();
        });
        editorEventBus.on(EditorEvents.editorUndo, () => {
          undo();
        });
        editorEventBus.on(EditorEvents.handleSelectItem, (id: any) => {
          handleSelectItem(id);
        });
        editorEventBus.on(EditorEvents.clearMonitorSelectItem, () => {
          clearSelectItem();
        });
        editorEventBus.on(EditorEvents.monitorDuplicateElement, (data: any) => {
          monitorDuplicateElement(data._idOld, data._id, data._deltaX);
        });
        editorEventBus.on(
          EditorEvents.redrawMonitor,
          (forceUpdate: boolean) => {
            drawGraphs(forceUpdate);
          },
        );
        editorEventBus.on(EditorEvents.initElement, async (item: any) => {
          console.log("MonitorInitElement! event.on", item);
          editorEventBus.emit(EditorEvents.switchRatio, item.ratio);
          await initJson(item);
        });
        editorEventBus.on(EditorEvents.addElement, async (item: any) => {
          console.log("MonitorAddElement! event.on", item);
          await addElement(item);
          // setTimeout(() => {
          //   actionUpateHistory()
          // }, 50);
        });

        editorEventBus.on(
          EditorEvents.updateElement,
          (item: any, updateHistory: boolean = true) => {
            console.log("MonitorUpdateElement! event.on", item);
            updateElementAttribute(item);
            if (updateHistory) actionUpateHistory();
          },
        );
        editorEventBus.on(EditorEvents.delElement, (item: any) => {
          monitorGraphs.splice(
            monitorGraphs.findIndex((item) => item.selected === true),
            1,
          );
          selectedItem.splice(
            selectedItem.findIndex((item) => item.selected === true),
            1,
          );
          // updateTimelinebyHistroy()
          // actionUpateHistory()

          // clearCanvas();
          drawGraphs(true);
        });
        editorEventBus.on(EditorEvents.exportProjJson, () => {
          exportProjJson();
        });
        await initCanvas();
        editorEventBus.on(
          EditorEvents.switchRatio,
          (ratio: string, updateHistory: boolean = false) => {
            console.log("MonitorSwitchRatio! event.on", ratio);
            switch (ratio) {
              case "16:9":
                canvasDom.width = 1920;
                canvasDom.height = 1080;
                window.projConfig.width = 1920;
                window.projConfig.height = 1080;
                window.projConfig.ratio = "16:9";
                monitorCanvasRatio = canvasDom.height / canvasDom.offsetHeight;
                if (updateHistory) {
                  for (const shape of monitorGraphs) {
                    shape.centerX += (1920 - 1080) / 2;
                    shape.centerY -= (1920 - 1080) / 2;
                  }
                }
                break;
              case "9:16":
                canvasDom.width = 1080;
                canvasDom.height = 1920;
                window.projConfig.width = 1080;
                window.projConfig.height = 1920;
                window.projConfig.ratio = "9:16";
                monitorCanvasRatio = canvasDom.width / canvasDom.offsetWidth;
                if (updateHistory) {
                  for (const shape of monitorGraphs) {
                    shape.centerX -= (1920 - 1080) / 2;
                    shape.centerY += (1920 - 1080) / 2;
                  }
                }

                break;
              case "1:1":
                canvasDom.width = 1080;
                canvasDom.height = 1080;
                window.projConfig.width = 1080;
                window.projConfig.height = 1080;
                window.projConfig.ratio = "1:1";
                monitorCanvasRatio = canvasDom.width / canvasDom.offsetWidth;
                break;

              default:
                break;
            }
            disTop = canvasDom.getBoundingClientRect().top;
            disLeft = canvasDom.getBoundingClientRect().left;
            // monitorCanvasRatio = canvasDom.height / canvasDom.offsetHeight;
            drawGraphs();
            if (updateHistory) actionUpateHistory();
          },
        );
      }
    }
    init();
    window.initMonitorReady = true;
  }, []);

  return (
    <div
      id="fullScreenWrap"
      onClick={(e) => {
        e.stopPropagation();
      }}
    >
      <div id="monitorwrap">
        <canvas
          id="monitor_canvas"
          ref={monitorCanvaRef}
          className="canvasBase"
          width="1920"
          height="1080"
        ></canvas>
        <textarea
          name=""
          id="monitorTextCover"
          ref={monitorTextCoverRef}
          onChange={(e) => {
            if (selectedItem[0]) {
              selectedItem[0].text = e.target.value;
              selectedItem[0].calculateTextWidth();
              e.target.style.width =
                selectedItem[0].w / monitorCanvasRatio + "px";
              e.target.style.height = "auto";
              e.target.style.height = e.target.scrollHeight + "px";
              selectedItem[0].h = e.target.scrollHeight * monitorCanvasRatio;
              // selectedItem[0].w / monitorCanvasRatio + "px";
              // e.target.style.left =
              // selectedItem[0].x / monitorCanvasRatio + "px";
              drawBorder(selectedItem[0]);
            }
          }}
          onBlur={(e) => {
            if (selectedItem[0]) {
              selectedItem[0].focused = false;
            }
            e.target.style.display = "none";
            actionUpateHistory();
            drawGraphs();
          }}
        ></textarea>
        <FullScreenControl />
        {/*
          <div id="controlsWrap">
            <button
              onClick = {
                ()=>{
                  if (window.akoolEditorState == 'playing'){
                    editorEventBus.emit(
                      EditorEvents.editorPause,
                    )
                  }else{
                    editorEventBus.emit(
                      EditorEvents.editorPlay,
                    )
                  }
                }
              }
            >
              {fullscreenPlayBtn ? 'pause':'play'}
            </button>
            <input id='controlTimeslider' type="range" min={0} max={1000} step={1} />
            <span>{monitorCurrentTime}</span>
            <span>/ {secondTrans(window.currentTime)}</span>
            <button
              onClick={() => {
                editorEventBus.emit(
                  EditorEvents.fullScreen,
                  false
                )
              }}
            >
              full screen
            </button>
          </div>
          <div id="loadingwrap">
            <img src={loading} id='monitorloading' alt=""/>
          </div>

          */}
      </div>
      <canvas
        id="monitor_canvasOver"
        ref={monitorCanvasCoverRef}
        // width="1920"
        // height="1080"
      ></canvas>
    </div>
  );
};

export const Monitormemo = memo(Monitor);
