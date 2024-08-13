import { useState, useEffect, memo } from "react";
import {fabric} from 'fabric'
import { sample } from "./sample";
import{
  drawCircleIcon,
  loadImgProssse,
  loadImgByDom,
  randomInt,
  uuid,
} from './util'
import { monitorGraph } from "./monitorGraph";

export function Monitor(props) {
  const STROKE_COLOR = '#ff2b5d'
  var canvasDom = null,
    monitorCtx = null,
    monitorGraphs = [],
    monitorGraphsIn = [];
  window.monitorAction = ''
  const addEvents = ()=>{
    canvasDom.addEventListener(
      "mousedown",
      function (e) {
        console.log(e)
        var mouse = {
          x: e.clientX - canvasDom.getBoundingClientRect().left,
          y: e.clientY - canvasDom.getBoundingClientRect().top,
        };
        monitorGraphsIn=[]
        monitorGraphs.forEach(function (shape) {
          var offset = {
            x: mouse.x - shape.x,
            y: mouse.y - shape.y,
          };
          var monitorAction = shape.isMouseInGraph(mouse);
          if (monitorAction) {
            monitorGraphsIn.push(shape);
            window.monitorAction = monitorAction;
          }
        });
        console.log('monitorGraphsIn',monitorGraphsIn)

    });
    canvasDom.addEventListener(
      "mouseup",
      function (e) {
        drawGraphs()
    });
  }
  const initJson = () =>{
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
    console.log(jsonTemp)
    jsonTemp.sort((a, b) => a.layer_number - b.layer_number);
    console.log(jsonTemp)



    for (var item of jsonTemp) {
      if (item.type === "image" || "avatar") {
        (function(item){
          console.log('DataURL: ',item.url);


        })(item)

         // monitorCanvas.renderAll();

      }
    }
    // console.log(monitorCanvas)
  }
  const drawGraphs = () => {
    // console.log(timelineGraphs)
    monitorCtx.clearRect(0, 0, canvasDom.width, canvasDom.height);
    for (var i = 0; i < monitorGraphs.length; i++) {
      monitorGraphs[i].paint();
    }

    if (monitorGraphsIn.length > 0) {
      monitorCtx.save()
      monitorCtx.setLineDash([4, 5])
      monitorCtx.lineWidth = 1
      monitorCtx.strokeStyle = STROKE_COLOR
      monitorCtx.translate(monitorGraphsIn[0].centerX0, monitorGraphsIn[0].centerY0)
      monitorCtx.rotate(monitorGraphsIn[0].thisRotate)
      monitorCtx.translate(-monitorGraphsIn[0].centerX0, -monitorGraphsIn[0].centerY0)
      monitorCtx.strokeRect(monitorGraphsIn[0].x, monitorGraphsIn[0].y, monitorGraphsIn[0].w, monitorGraphsIn[0].h)
    }
  };
  const initCanvas = async() =>{
    canvasDom = document.getElementById("monitor_canvas");
    monitorCtx = canvasDom.getContext("2d");
    for (var i = 0; i < 1; i++) {
      // var typeTemp = ["Music", "Text", "Emojo", "Image", "Video"][
      //   randomInt(0, 5)
      // ];
      var typeTemp = ["Image", "Image", "Image", "Image", "Image"][
        randomInt(0, 5)
      ];
      var iconUrl = "https://static.website-files.org/assets/avatar/avatar/thumbnail/1716457024475-tristan_cloth1_20240522.webp";

      var graph = new monitorGraph(
        randomInt(0, 500),
        randomInt(0, 500),
        randomInt(10, 500),
        randomInt(10, 500),
        randomInt(0, 3),
        typeTemp,
        typeTemp,
        // await loadImgProssse(canvasDom, iconUrl),
        await loadImgProssse(uuid(), iconUrl),
        canvasDom
      );
      // checkIfInsideLoop(graph);
      console.log(graph)
      monitorGraphs.push(graph);

    }
    drawGraphs()
      // initJson()
    addEvents()
  }


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
      <canvas id="monitor_canvas" className="canvasBase" width="1600" height="900"></canvas>
    </div>
  );
}
// export default Timeline;

export const Monitormemo = memo(Monitor);
