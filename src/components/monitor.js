import { useState, useEffect, memo,createRef } from "react";
import { fabric } from "fabric";
import { cloneDeep } from "lodash";
import { sample } from "./sample";
import {
  drawCircleIcon,
  loadImgProssse,
  loadImgByDom,
  drawEdgePoint,
  randomInt,
  loadTextProssse,
  loadVideoProssse,
  uuid,
} from "./util";
import { monitorGraph } from "./monitorGraph";

export function Monitor(props) {
  const monitorTextCoverRef = createRef()
  const STROKE_COLOR = "#ff2b5d";
  // window.textFoucsIntervalBool = false
  var canvasDom = null,
    monitorCtx = null,
    monitorGraphs = [],
    selectedItem = [],
    monitorGraphsIn = [],
    mouseDownX = 0,
    mouseDownY = 0,
    currentGraph = {},
    monitorAction = "";

  const drawBorder = (item) => {
    monitorCtx.save();
    monitorCtx.setLineDash([4, 5]);
    monitorCtx.lineWidth = 2;
    monitorCtx.strokeStyle = STROKE_COLOR;
    monitorCtx.translate(item.centerX, item.centerY);
    monitorCtx.rotate((item.rotate * Math.PI) / 180);
    monitorCtx.translate(-item.centerX, -item.centerY);
    monitorCtx.strokeRect(item.x, item.y, item.w, item.h);
    drawEdgePoint(monitorCtx, item.x, item.y, item.w, item.h);
    monitorCtx.restore();
  };
  // var focused = false

  const clearSelectItem = () => {
    monitorGraphs.forEach((item, i) => {
      item.selected = false
      item.onfocus = false
      item.focused = false
    });
    selectedItem = [];
  }
  const handleSelectItem = (_id) => {
    clearSelectItem()
    monitorGraphs[monitorGraphs.findIndex(item => item.id === _id)].selected = true
    selectedItem = monitorGraphs.filter((item) => item.selected == true)
  }
  const monitorDuplicateElement = (_idOld,_id) => {

    const duplicateItem = monitorGraphs.find(item => item.id === _idOld)
    let clone = Object.assign(Object.create(Object.getPrototypeOf(duplicateItem)), duplicateItem)
    clone.id = _id
    monitorGraphs.push(clone)

  }
  const updateElement = (_elarray) => {
      // console.log(_elarray)
      for (var item of _elarray) {
        for (var _item of monitorGraphs) {
          if (_item.id == item.id) {
            _item.startTime = item.x
            _item.endTime = parseInt(item.x) + parseInt(item.w)
            break;
          }
        }
      }
      drawGraphs(true)
  };
  const addEvents = () => {

    canvasDom.addEventListener("mousedown", function (e) {
      console.log(monitorGraphs);
      mouseDownX = e.clientX - canvasDom.getBoundingClientRect().left;
      mouseDownY = e.clientY - canvasDom.getBoundingClientRect().top;

      monitorAction = "";
      // monitorGraphsIn = [];
      // if (window.textFoucsIntervalBool) {
      //   clearInterval(window.textFoucsInterval)
      //   window.textFoucsIntervalBool = false
      // }

      monitorGraphs.forEach((item, i) => {
        item.selected = false;
        item.onfocus = false;
        item.focused = false;
      });

      monitorGraphs.forEach(function (shape) {
        var offset = {
          x: mouseDownX - shape.x,
          y: mouseDownY - shape.y,
        };
        var _monitorActiontemp = shape.isMouseInGraph({
          x: mouseDownX,
          y: mouseDownY,
        });
        if (_monitorActiontemp) {
          monitorGraphsIn.push(shape);
          monitorAction = _monitorActiontemp;
          currentGraph = cloneDeep(shape);
        }
      });
      if (monitorGraphsIn.length > 0) {
        // console.log(monitorGraphsIn, "monitorGraphsIn");
        const shape = monitorGraphsIn[monitorGraphsIn.length - 1];
        shape.selected = true;
        window.timelineHandleSelectItem_function(shape.id)
        drawGraphs();
        if(selectedItem.length > 0 && shape.id == selectedItem[0].id && shape.type == "textbox"){
            shape.onfocus = true;
        }else{
          selectedItem = monitorGraphs.filter((item) => item.selected == true);
        }


      }else{
        selectedItem = [];
        window.timelineClearSelectItem_function()
        drawGraphs();
      }
      // console.log("monitorGraph/sIn", monitorGraphsIn);
      // console.log("monitorGraphs", monitorGraphs);

    });
    canvasDom.addEventListener("mouseup", function (e) {
      const textSelectedid = selectedItem.length > 0 ? selectedItem[0].id : ''
      if (monitorGraphsIn[monitorGraphsIn.length - 1]) {
        const shape = monitorGraphsIn[monitorGraphsIn.length - 1];
        // ;
        shape._rotateSquare();
        // console.log('focused : true??',shape)
        // console.log('focused : true??',shape.focused)
        if (shape.onfocus && monitorAction == 'move'){

          console.log('focused : true')
          shape.focused = true
          // shape.focusIndex = shape.text.length
          monitorTextCoverRef.current.style.color = shape.initconfig.fill
          monitorTextCoverRef.current.style.fontSize = shape.initconfig.fontSize + 'px'
          monitorTextCoverRef.current.style.fontFamily = shape.initconfig.fontFamily
          monitorTextCoverRef.current.style.display = 'block'
          monitorTextCoverRef.current.style.width = shape.w + 'px'
          monitorTextCoverRef.current.style.height = shape.h + 'px'
          monitorTextCoverRef.current.style.left = shape.x + 'px'
          monitorTextCoverRef.current.style.top = shape.y + 'px'
          monitorTextCoverRef.current.style.rotate = shape.rotate + 'deg'
          monitorTextCoverRef.current.value = shape.text
          monitorTextCoverRef.current.focus()
        }

        drawGraphs();
        monitorGraphsIn = [];
      }else{

      }
    });
    canvasDom.addEventListener("mousemove", function (e) {
      if (selectedItem.length > 0) {
        if (
          selectedItem[0].isinCorner(e.offsetX, e.offsetY) ||
          selectedItem[0].isinRotate(e.offsetX, e.offsetY)
        ) {
          canvasDom.style.cursor = "pointer";
        } else {
          canvasDom.style.cursor = "auto";
        }
      }
      if (monitorGraphsIn[monitorGraphsIn.length - 1]) {
        const shape = monitorGraphsIn[monitorGraphsIn.length - 1];
        // console.log(monitorAction, "monitorAction");
        if (shape.focused) return
        if (Math.abs(e.movementX >=1) || Math.abs(e.movementY > 1)){
          shape.onfocus = false
        }
        switch (monitorAction) {
          case "move":
            shape.x += e.movementX;
            shape.y += e.movementY;
            shape.centerX += e.movementX;
            shape.centerY += e.movementY;

            // console.log(shape, "move");
            // shape._rotateSquare()
            drawGraphs();
            break;
          case "scale":
            shape.transform(
              mouseDownX,
              mouseDownY,
              e.offsetX,
              e.offsetY,
              currentGraph,
            );
            drawGraphs();
            break;
          case "rotate":
            shape.rotateAction(
              mouseDownX,
              mouseDownY,
              e.offsetX,
              e.offsetY,
              currentGraph,
            );
            drawGraphs();
            break;
          // console.log(shape.x,'shape.x')
          // console.log(shape.y,'shape.y')
          default:
        }
      }
    });
  };
  const initJson = () => {
    var jsonTemp = [];
    for (var item of sample.data) {
      for (var variable in item) {
        if (item.hasOwnProperty(variable)) {
          switch (variable) {
            case "elements":
              for (var elementsItem of item[variable]) {
                jsonTemp.push({
                  type: elementsItem.type,
                  url: elementsItem.url,
                  id: elementsItem.id,
                  angle: elementsItem.angle,
                  scale_x: elementsItem.scale_x,
                  scale_y: elementsItem.scale_y,
                  width: elementsItem.width,
                  height: elementsItem.height,
                  offset_x: elementsItem.offset_x,
                  offset_y: elementsItem.offset_y,
                  opacity: elementsItem.opacity,
                  layer_number: elementsItem.layer_number,
                  start_time: elementsItem.start_time,
                  end_time: elementsItem.end_time,
                });
              }
              break;
            default:
          }
        }
      }
    }
    // console.log(jsonTemp);
    jsonTemp.sort((a, b) => a.layer_number - b.layer_number);
    // console.log(jsonTemp);

    for (var item of jsonTemp) {
      // console.log(item.type,'type')
      if (item.type === "image" || item.type === "avatar") {
        (async function (item) {
          console.log("DataURL: ", item.url);
          var graph = new monitorGraph(
            item.id,
            item.offset_x - item.width / 2,
            item.offset_y - item.height / 2,
            item.width,
            item.height,
            item.angle,
            item.scale_x,
            item.type,
            item.type,
            // await loadImgProssse(canvasDom, iconUrl),
            await loadImgProssse(uuid(), item.url),
            canvasDom,
            item.start_time,
            item.end_time,
          );
          // checkIfInsideLoop(graph);
          console.log(graph);
          monitorGraphs.push(graph);
          drawGraphs();
        })(item);

        // monitorCanvas.renderAll();
      }
      else if (item.type === "video") {
        (async function (item) {
          // console.log("DataURL: ", item.url);
          var graph = new monitorGraph(
            item.id,
            item.offset_x - item.width / 2,
            item.offset_y - item.height / 2,
            item.width,
            item.height,
            item.angle,
            item.scale_x,
            item.type,
            item.type,
            // await loadImgProssse(canvasDom, iconUrl),
            await loadVideoProssse(uuid(), item.url),
            canvasDom,
            item.start_time,
            item.end_time,
          );
          // checkIfInsideLoop(graph);
          console.log(graph,'???video');
          monitorGraphs.push(graph);
          drawGraphs();
        })(item);

        // monitorCanvas.renderAll();
      }
      else if (item.type === "textbox") {
        (async function (item) {
          const textinit = sample.data[0].objects.find(_item => _item.id == item.id)
          await loadTextProssse(textinit.fontFamily,textinit.data.fontURL)
          var graph = new monitorGraph(
            item.id,
            item.offset_x - item.width / 2,
            item.offset_y - item.height / 2,
            item.width,
            item.height,
            item.angle,
            item.scale_x,
            textinit.text,
            item.type,
            // await loadImgProssse(canvasDom, iconUrl),
            null,
            canvasDom,
            item.start_time,
            item.end_time,
            textinit
          );
          // checkIfInsideLoop(graph);
          console.log(graph);
          monitorGraphs.push(graph);
          drawGraphs();
          console.log(monitorGraphs,'???');
        })(item);
      }

    }
    console.log(monitorGraphs);
    // console.log(monitorCanvas)
  };
  const drawGraphs = (forceUpdate = false) => {
    // console.log(timelineGraphs)
    if (monitorCtx) monitorCtx.clearRect(0, 0, canvasDom.width, canvasDom.height);

    for (var i = 0; i < monitorGraphs.length; i++) {
      monitorGraphs[i].paint(forceUpdate);
    }
    // if () {
    if (selectedItem.length > 0 && !selectedItem[0].focused && selectedItem[0].checkIfinTime()) {
      drawBorder(selectedItem[0]);
    }
    else if (selectedItem.length > 0 && !selectedItem[0].checkIfinTime()){
      selectedItem = []
    }

  };
  // window.forceUpdateTime_function = () =>{
  //   console.log('monitor_drawGraphs_function')
  //   drawGraphs(true)
  // }
  window.monitor_drawGraphs_function = (forceUpdate = false) =>{
    console.log('monitor_drawGraphs_function')
    drawGraphs(forceUpdate)
  }
  window.monitorDuplicateElement_function = (_idOld,_id) =>{
    console.log('monitorDuplicateElement_function')
    monitorDuplicateElement(_idOld,_id)
  }
  window.handleMonitorSelectItem_function = (_id) =>{
    console.log('handleSelectItem_function')
    handleSelectItem(_id)
  }
  window.clearMonitorSelectItem_function = (_id) =>{
    console.log('clearSelectItem_function')
    clearSelectItem(_id)
  }
  const initCanvas = async () => {
    canvasDom = document.getElementById("monitor_canvas");
    monitorCtx = canvasDom.getContext("2d");
    drawGraphs();
    initJson();
    addEvents();
    // registerEvent
    window.canvasEventDriver.register("update", (_prop) => {
      updateElement(_prop);
    });
  };

  useEffect(() => {
    async function init() {
      if (window.initMonitorReady !== true) {
        initCanvas();
      }
    }
    init();
    window.initMonitorReady = true;
  }, []);

  return (
    <div>
      <div id = "monitorWarp">
        <canvas
          id="monitor_canvas"
          className="canvasBase"
          width="1600"
          height="900"
        >

        </canvas>
        <textarea
          name=""
          id="monitorTextCover"
          ref = {monitorTextCoverRef}
          onChange = {
            (e)=>{
              console.log(e)
              selectedItem[0].text = e.target.value
              drawGraphs()
            }
          }
          onBlur = {
            (e)=>{
              // console.log(e)
              e.target.style.display = 'none'
              drawGraphs()
            }
          }
          ></textarea>
      </div>

    </div>
  );
}
// export default Timeline;

export const Monitormemo = memo(Monitor);
