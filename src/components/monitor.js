import { useState, useEffect, memo } from "react";
import {fabric} from 'fabric'
import{drawCircleIcon} from './util'


export function Monitor(props) {
  let monitorCanvas = null
  const initCanvas = () =>{
      // console.log(fabric)
     monitorCanvas = new fabric.Canvas('monitor_canvas');
     fabric.Object.prototype.originX = 'center'
     fabric.Object.prototype.originY = 'center'
     fabric.Object.prototype.transparentCorners = false
     fabric.Object.prototype.cornerColor = '#20bf6b'
     fabric.Object.prototype.cornerStyle = 'circle'
     fabric.Object.prototype.borderColor = '#3782F7'
     fabric.Object.prototype.cornerSize = 16
     fabric.Object.prototype.borderScaleFactor = 4
     fabric.Object.prototype.borderOpacityWhenMoving = 0.8
     console.log(monitorCanvas)
     // console.log(FabricObject)

     var rect = new fabric.Rect({
        left: 100,
        top: 100,
        fill: 'red',
        width: 200,
        height: 200
      });

      monitorCanvas.add(rect);
      monitorCanvas.renderAll();
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
