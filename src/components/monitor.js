import { useState, useEffect, memo } from "react";
import {Canvas,Rect} from 'fabric'


export function Monitor(props) {
  let monitorCanvas = null
  const initCanvas = () =>{
      // console.log(fabric)
     monitorCanvas = new Canvas('monitor_canvas');
     var rect = new Rect({
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
