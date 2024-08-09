import { useState, useEffect, memo } from "react";
import {fabric} from 'fabric'
import { sample } from "./sample";
import{drawCircleIcon} from './util'


export function Monitor(props) {
  let monitorCanvas = null
  const addEvents = ()=>{
    monitorCanvas.on('mouse:wheel', function(opt) {
      var delta = opt.e.deltaY;
      var pointer = monitorCanvas.getPointer(opt.e);
      var zoom = monitorCanvas.getZoom();
      zoom = zoom + delta/200;
      if (zoom > 20) zoom = 20;
      if (zoom < 0.01) zoom = 0.01;
      monitorCanvas.zoomToPoint({ x: opt.e.offsetX, y: opt.e.offsetY }, zoom);
      opt.e.preventDefault();
      opt.e.stopPropagation();
    });
    monitorCanvas.on('mouse:up', function(options) {
      console.log(options);
      console.log(options.e.clientX, options.e.clientY);
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
          // fabric.Image.fromURL(item.url, function (img) {
          //     // var img = new fabric.Image(_img)
          //     img.scaleToWidth(item.width);
          //     img.scaleToHeight(item.height);
          //     img.id = item.id
          //     img.perPixelTargetFind = true
          //
          //    img.set({
          //      left: item.offset_x,
          //      top: item.offset_y,
          //    });
          //
          //    monitorCanvas.add(img);
          // },{
          //     crossOrigin: 'Anonymous'
          // });

          fabric.util.loadImage(item.url, function (_img) {
              var img = new fabric.Image(_img)
              img.scaleToWidth(item.width);
              img.scaleToHeight(item.height);
              img.id = item.id
              // img.perPixelTargetFind = true

             img.set({
               left: item.offset_x,
               top: item.offset_y,
             });

             monitorCanvas.add(img);
          });

      })(item)

         // monitorCanvas.renderAll();

      }
    }
    console.log(monitorCanvas)
  }
  const initCanvas = () =>{
      // console.log(fabric)
     monitorCanvas = new fabric.Canvas('monitor_canvas');
     fabric.Object.prototype.originX = 'center'
     fabric.Object.prototype.originY = 'center'
     fabric.Object.prototype.transparentCorners = false
     fabric.Object.prototype.cornerColor = '#20bf6b'
     fabric.Object.prototype.cornerStyle = 'circle'
     fabric.Object.prototype.borderColor = '#3782F7'
     fabric.Object.prototype.cornerSize = 12
     fabric.Object.prototype.borderScaleFactor = 0
     fabric.Object.prototype.borderOpacityWhenMoving = 0.8
     console.log(monitorCanvas)
     // console.log(FabricObject)

      monitorCanvas.renderAll();
      initJson()
      addEvents()
  }


  useEffect(() => {
    async function init() {
      if (window.initReady2 !== true) {
        initCanvas();
      }
    }
    init();
    window.initReady2 = true;
  }, []);




  return (
    <div>
      <canvas id="monitor_canvas" className="canvasBase" width="1600" height="900"></canvas>
    </div>
  );
}
// export default Timeline;

export const Monitormemo = memo(Monitor);
