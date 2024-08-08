import { useState, useEffect, memo } from "react";
import { randomInt, drawScale, loadImgProssse } from "./util";
import iconEmojo from "./icon/iconEmojo.svg";
import iconImage from "./icon/iconImage.svg";
import iconMusic from "./icon/iconMusic.svg";
import iconText from "./icon/iconText.svg";
import iconVideo from "./icon/iconVideo.svg";
import iconVoice from "./icon/iconVoice.svg";
import iconScript from "./icon/iconScript.svg";
import { dragGraph } from "./dragGraph";


export function Monitor(props) {


  useEffect(() => {
    async function init() {
      if (typeof window !== "undefined" || window.initReady !== true) {
        // initCanvas();
      }
    }
    init();
    // window.initReady = true;
  }, []);




  return (
    <div>
      <canvas id="monitor_canvas" className="canvas" width="1600" height="900"></canvas>
    </div>
  );
}
// export default Timeline;

export const Monitormemo = memo(Monitor);
