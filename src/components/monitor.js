import { useState, useEffect, memo } from "react";
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
  uuid,
} from "./util";
import { monitorGraph } from "./monitorGraph";

export function Monitor(props) {
  const STROKE_COLOR = "#ff2b5d";
  window.textFoucsIntervalBool = false
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
  var isCommandKey = false
  var focusIndex = 0



  const handleOnKeyUp = function(e){
			isCommandKey = false;
			drawGraphs();
		}
    const handleOnKeyDown = function(e){
        if (selectedItem.length < 0 && !selectedItem[0].focused) {
          return
        }
  			if(e.key === "Meta" || e.key === "Control"){
  				isCommandKey = true;
  			}
  			if(selectedItem[0].focused){
  				e.preventDefault();
  			}
  			// if(this.isCommandKey && e.key === "a"){
  			// 	this.selected = true;
  			// 	this.render();
  			// 	return
  			// }
  			if(selectedItem[0].focused && e.key === "Backspace"){
  				// if(this.selected){
  				// 	this.focusIndex = 0;
  				// 	this.text = "";
  				// 	this.selected = false;
  				// 	this.render();
  				// }
  				var str = "";
  				for(var i =0; i < selectedItem[0].text.length; i++){
  					if(i !== selectedItem[0].focusIndex - 1){
  						str += selectedItem[0].text[i];
  					}
  				}

  				selectedItem[0].text = str;

  				selectedItem[0].focusIndex --;
  				if(selectedItem[0].focusIndex <0){
  					selectedItem[0].focusIndex = 0;
  				}
  				drawGraphs();
  			}
  			if(selectedItem[0].focused && e.key === "ArrowLeft"){
  				selectedItem[0].focusIndex --;
  				if(selectedItem[0].focusIndex < 0){
  					selectedItem[0].focusIndex = 0;
  				}
  				drawGraphs();
  			}
  			if(selectedItem[0].focused && e.key === "ArrowRight"){
  				selectedItem[0].focusIndex ++;
  				if(selectedItem[0].focusIndex > selectedItem[0].text.length){
  					selectedItem[0].focusIndex = selectedItem[0].text.length;
  				}
  				drawGraphs();
  			}
  			if(!isCommandKey && selectedItem[0].focused && (e.keyCode == 32 || (e.keyCode >= 65))){
  				selectedItem[0].text += e.key;
  				selectedItem[0].focusIndex += 1;
  				drawGraphs();
  			}


  		}
  const addEvents = () => {
    window.addEventListener("keydown", function(event){
      handleOnKeyDown(event);
    });
    window.addEventListener("keyup", function(event){
      handleOnKeyUp(event);
    });
    canvasDom.addEventListener("mousedown", function (e) {
      console.log(e);
      mouseDownX = e.clientX - canvasDom.getBoundingClientRect().left;
      mouseDownY = e.clientY - canvasDom.getBoundingClientRect().top;
      const textSelectedid = selectedItem.length > 0 ? selectedItem[0].id : ''
      monitorAction = "";
      monitorGraphsIn = [];
      if (window.textFoucsIntervalBool) {
        clearInterval(window.textFoucsInterval)
        window.textFoucsIntervalBool = false
      }

      monitorGraphs.forEach((item, i) => {
        item.selected = false;
        item.focused = false;
      });
      selectedItem = [];
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
        console.log(monitorGraphsIn, "monitorGraphsIn");
        const _selectedItem = monitorGraphsIn[monitorGraphsIn.length - 1]
        _selectedItem.selected = true;
        if (textSelectedid == _selectedItem.id){
          // console.log('focused : true')
          _selectedItem.focused = true;
          _selectedItem.focusIndex = _selectedItem.initconfig.text.length
        }
      }
      console.log("monitorGraphsIn", monitorGraphsIn);
      console.log("monitorGraphs", monitorGraphs);
      drawGraphs();
    });
    canvasDom.addEventListener("mouseup", function (e) {
      if (monitorGraphsIn[monitorGraphsIn.length - 1]) {
        const shape = monitorGraphsIn[monitorGraphsIn.length - 1];
        shape._rotateSquare();

        monitorGraphsIn = [];
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
      console.log(item.type,'type')
      if (item.type === "image" || item.type === "avatar") {
        (async function (item) {
          console.log("DataURL: ", item.url);
          var graph = new monitorGraph(
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
          );
          // checkIfInsideLoop(graph);
          console.log(graph);
          monitorGraphs.push(graph);
          drawGraphs();
        })(item);

        // monitorCanvas.renderAll();
      }
      else if (item.type === "textbox") {
        (async function (item) {
          const textinit = sample.data[0].objects.filter((_item) => _item.id == item.id)
          await loadTextProssse(textinit[0].fontFamily,textinit[0].data.fontURL)
          var graph = new monitorGraph(
            item.offset_x - item.width / 2,
            item.offset_y - item.height / 2,
            item.width,
            item.height,
            item.angle,
            item.scale_x,
            textinit[0].text,
            item.type,
            // await loadImgProssse(canvasDom, iconUrl),
            null,
            canvasDom,
            textinit[0]
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
  const drawGraphs = () => {
    // console.log(timelineGraphs)
    if (monitorCtx) monitorCtx.clearRect(0, 0, canvasDom.width, canvasDom.height);

    for (var i = 0; i < monitorGraphs.length; i++) {
      monitorGraphs[i].paint();
    }

    if (selectedItem.length > 0) {
      drawBorder(selectedItem[0]);
    } else {
      selectedItem = monitorGraphs.filter((item) => item.selected == true);
      if (selectedItem.length > 0) {
        drawBorder(selectedItem[0]);
      }
    }
  };
  window.monitor_drawGraphs_function = () =>{
    console.log('monitor_drawGraphs_function')
    drawGraphs()
  }
  const initCanvas = async () => {
    canvasDom = document.getElementById("monitor_canvas");
    monitorCtx = canvasDom.getContext("2d");
    for (var i = 0; i < 1; i++) {
      // var typeTemp = ["Music", "Text", "Emojo", "image", "Video"][
      //   randomInt(0, 5)
      // ];
      var typeTemp = ["image", "image", "image", "image", "image"][
        randomInt(0, 5)
      ];
      var iconUrl =
        "https://static.website-files.org/assets/avatar/avatar/thumbnail/1716457024475-tristan_cloth1_20240522.webp";

      var graph = new monitorGraph(
        randomInt(0, 500),
        randomInt(0, 500),
        randomInt(10, 500),
        randomInt(10, 500),
        randomInt(0, 360),
        randomInt(0.5, 1),
        typeTemp,
        typeTemp,
        // await loadImgProssse(canvasDom, iconUrl),
        await loadImgProssse(uuid(), iconUrl),
        canvasDom,
      );
      // checkIfInsideLoop(graph);
      console.log(graph);
      monitorGraphs.push(graph);
    }
    drawGraphs();
    initJson();
    addEvents();
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
      <canvas
        id="monitor_canvas"
        className="canvasBase"
        width="1600"
        height="900"
      ></canvas>
    </div>
  );
}
// export default Timeline;

export const Monitormemo = memo(Monitor);
