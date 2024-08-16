import { useState, useEffect, memo } from "react";
import {fillCircle} from './util.js'

export function ColorPicker(props) {
  const [saturation,setSaturation]=useState(0)
  const [lightness,setLightness]=useState(0)
  var colorPickerCtx = null
  useEffect(() => {
    async function init() {
      if (typeof window !== "undefined" || window.initReady3 !== true) {
        initCanvas();
      }
    }
    init();
    window.initReady3 = true;
  }, []);

 const draw_color_square = (hue,ctx) => {
    var gradB = ctx.createLinearGradient(1, 1, 1, 256);
    gradB.addColorStop(0, "white");
    gradB.addColorStop(1, "black");

    var gradC = ctx.createLinearGradient(1,1,256,1);
    gradC.addColorStop(0, "hsla(" + hue + ",100%,50%,0)");
    gradC.addColorStop(1, "hsla(" + hue + ",100%,50%,1)");

    ctx.fillStyle = gradB;
    ctx.fillRect(10, 10, 256, 256);
    ctx.fillStyle = gradC;
    ctx.globalCompositeOperation = "multiply";
    ctx.fillRect(10, 10, 256, 256);
    ctx.globalCompositeOperation = "source-over";
  }

  const initCanvas = () =>{
    if (window.initReady3) return false;
    function hsv_to_hsl(h, s, v) {
        // both hsv and hsl values are in [0, 1]
        var l = (2 - s) * v / 2;

        if (l != 0) {
            if (l == 1) {
                s = 0;
            } else if (l < 0.5) {
                s = s * v / (l * 2);
            } else {
                s = s * v / (2 - l * 2);
            }
        }

        return [h, s, l];
    }

    var canvasDom = document.getElementById("colorPickerCanvas");
     colorPickerCtx = canvasDom.getContext("2d");
    draw_color_square(120,colorPickerCtx) //background

    // addevents

    canvasDom.addEventListener(
      "mousemove",
      (e) => {
        // console.log(e.offsetX,e.offsetY);
        colorPickerCtx.clearRect(0, 0, canvasDom.width, canvasDom.height);
        draw_color_square(120,colorPickerCtx)
        let color =  hsv_to_hsl(120,(( e.offsetX -10)  / 256),((266 - e.offsetY + 10) / 256))
        console.log(color[0],color[1],color[2])
        colorPickerCtx.fillStyle = "hsla(" + 120 + "," + color[1]* 100 + "%," + color[2]* 100 + "%,1)"
        // colorPickerCtx.fillStyle = "hsla(" + 120 + "," + (( e.offsetX -10) * 100 / 256) + "%," + 50 + "%,1)"
        // colorPickerCtx.fillStyle = "hsla(120，100%，100%,1)"
        colorPickerCtx.strokeStyle = 'black'
        fillCircle(colorPickerCtx,e.offsetX,e.offsetY,10)
        setSaturation(Math.floor(color[1] * 100))
        setLightness(Math.floor(color[2] * 100))
      },
      false,
    );
  }


  return (
    <div style={{display:'block'}}>
      <div>  <canvas
          id="colorPickerCanvas"
          className="canvasBase2"
          width="276"
          height="276"
        ></canvas></div>

      <br/>
      <p>hsl: 120,{saturation},{lightness},</p>
    </div>
  );
}
// export default Timeline;

export const ColorPickermemo = memo(ColorPicker);
