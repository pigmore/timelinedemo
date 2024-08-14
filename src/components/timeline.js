import { useState, useEffect, memo } from "react";
import { randomInt,
  drawScale,
  drawTimePointer,
  loadImgProssse } from "./util";
import iconEmojo from "./icon/iconEmojo.svg";
import iconImage from "./icon/iconImage.svg";
import iconMusic from "./icon/iconMusic.svg";
import iconText from "./icon/iconText.svg";
import iconVideo from "./icon/iconVideo.svg";
import iconVoice from "./icon/iconVoice.svg";
import iconScript from "./icon/iconScript.svg";
import { timelineGraph } from "./timelineGraph";
(function () {
  var table = {};
  window.canvasEventDriver = {};
  // console.log(canvasEventDriver,'Commons.canvasEventDriver')
  window.canvasEventDriver.register = function (event, callback) {
    var tablelist = table[event] || [];
    tablelist.push(callback);
    table[event] = tablelist;
  };
  window.canvasEventDriver.unregister = function (event, callback) {
    var tablelist = table[event] || [];
    var mark = -1;
    for (var i = 0; i < tablelist.length; i++) {
      if (tablelist[i] === callback) {
        mark = i;
        break;
      }
    }
    if (mark != -1) {
      tablelist.splice(mark, 1);
    }
  };
  window.canvasEventDriver.pop = function (event, props) {
    var tablelist = table[event];
    if (tablelist) {
      for (var item of tablelist) {
        item(props);
      }
    }
  };
})();

export function Timeline(props) {
  var canvasDom = null,
    timelineCtx = null,
    timelineGraphs = [],
    graphAttr = [],
    xArray = [],
    tempGraphArr = [];

  useEffect(() => {
    async function init() {
      if (typeof window !== "undefined" || window.initReady !== true) {
        initCanvas();
      }
    }
    init();
    window.initReady = true;
  }, []);
  const checkIfInsideLoop = (_shape) => {
    if (checkIfInside(_shape.x, _shape.w, _shape.y, _shape.id)) {
      _shape.y += 28;
      console.log(_shape.y);
      checkIfInsideLoop(_shape);
    }
  };
  const checkIfInside = (_x, _w, _y, _id) => {
    for (var item of timelineGraphs) {
      if (_id === item.id) continue;
      if (_y >= item.y + 28 || _y <= item.y - 28) continue;
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

  const exportJson = () => {
    let result = [];
    for (var item of timelineGraphs) {
      var temp = {
        x: (item.x * 100).toFixed(),
        y: (item.y / 28).toFixed(),
        w: (item.w * 100).toFixed(),
      };

      result.push(temp);
    }
    window.mapJson = result;
    window.canvasEventDriver.pop("update", result);
    // window.canvasCallBack(result)
    // let event = new Event("hello", {bubbles: true}); // (2)
    // canvas.dispatchEvent(event);

    return result;
  };
  const checkIfAttach = (_x, _w) => {
    for (var item of xArray) {
      if (Math.abs(_x - item) < 0.1) {
        return [item, 0];
        break;
      } else if (Math.abs(_x + _w - item) < 0.1) {
        return [item - _w, 1];
        break;
      }
    }
    return false;
  };

  const getXArray = (_timelineGraphs) => {
    for (var item of _timelineGraphs) {
      xArray.push(item.x);
      xArray.push(item.x + item.w);
    }
  };
  const addElement= async() =>{
    var typeTemp = ["Music", "Text", "Emojo", "Image", "Video"][
      randomInt(0, 5)
    ];
    var color = "";
    var strokeStyle = "";
    var iconUrl = "";
    switch (typeTemp) {
      case "Music":
        color = "rgba(140,26,255,0.6)";
        strokeStyle = "rgba(140,26,255,1)";
        iconUrl = iconMusic;
        break;
      case "Text":
        color = "rgba(255,114,26,0.6)";
        strokeStyle = "rgba(255,114,26,1)";
        iconUrl = iconText;
        break;
      case "Emojo":
        color = "rgba(242,73,143,0.6)";
        strokeStyle = "rgba(242,73,143,1)";
        iconUrl = iconEmojo;
        break;
      case "Image":
        color = "rgba(0,217,109,0.6)";
        strokeStyle = "rgba(0,217,109,1)";
        iconUrl = iconImage;
        break;
      case "Video":
        color = "rgba(0,170,255,0.6)";
        strokeStyle = "rgba(0,170,255,1)";
        iconUrl = iconVideo;
        break;
      default:
        color = "";
    }
    var graph = new timelineGraph(
      randomInt(0, 124),
      randomInt(2, 6) * 28,
      randomInt(10, 40),
      24,
      typeTemp,
      typeTemp,
      await loadImgProssse(canvasDom, iconUrl),
      color,
      strokeStyle,
      canvasDom,
      "rectangle",
    );
    checkIfInsideLoop(graph);
    timelineGraphs.push(graph);
  }
  const initCanvas = async () => {
    if (window.initReady) return false;

    canvasDom = document.getElementById("timeLineCanvas");
    timelineCtx = canvasDom.getContext("2d");
    window.initReady = true;
    window.timelineScrollX = 0;
    window.timelineXScale = 10;
    window.currentFrame = 120;
    window.videoFps = 60;
    window.currentTime = 2000;

    for (var i = 0; i < 12; i++) {
      await addElement()
    }
    // addevents()
    canvasDom.addEventListener(
      "mousedown",
      function (e) {
        var mouse = {
          x: e.clientX - canvasDom.getBoundingClientRect().left,
          y: e.clientY - canvasDom.getBoundingClientRect().top,
        };
        // console.log(mouse.x);
        xArray = [];
        if(Math.abs(e.offsetX - window.timelineScrollX - window.currentFrame * window.timelineXScale / 10) < 5){
          window.timelineAction = 'timeLinePointerMoving'
        }else{
          timelineGraphs.forEach(function (shape) {
            var offset = {
              x: mouse.x - shape.x,
              y: mouse.y - shape.y,
            };
            var timelineAction = shape.isMouseInGraph(mouse);
            if (timelineAction) {
              tempGraphArr.push(shape);
              window.timelineAction = timelineAction;
            } else {
              xArray.push(shape.x);
              xArray.push(shape.x + shape.w);
            }
            // shape.paint();
          });
        }


        clearCanvas();
        drawGraph();
        // getXArray(timelineGraphs)
        e.preventDefault();
      },
      false,
    );
    canvasDom.addEventListener(
      "mousemove",
      function (e) {
        var mouse = {
          x: e.clientX - canvasDom.getBoundingClientRect().left,
          y: e.clientY - canvasDom.getBoundingClientRect().top,
        };
        // hoverThePointer
        if(Math.abs(e.offsetX - window.timelineScrollX - window.currentFrame * window.timelineXScale / 10) < 5){
          canvasDom.style.cursor="pointer"
        }else{
          canvasDom.style.cursor="auto"
        }

        if (window.timelineAction == 'timeLinePointerMoving') {
          window.currentFrame += e.movementX / window.timelineXScale * 10
          clearCanvas();
          drawGraph();
        }
        else if (tempGraphArr[tempGraphArr.length - 1]) {
          var shape = tempGraphArr[tempGraphArr.length - 1];
          if (e.offsetX > canvasDom.width - 35 && window.timelineScrollX > -2400) {
            if (window.timelineAction === "edge1") {
              shape.w += 1 / window.timelineXScale;
            } else {
              shape.x += 1 / window.timelineXScale;
            }

            window.timelineScrollX -= 1;
          }
          else if (e.offsetX < 35 && window.timelineScrollX < 0) {
            shape.x -= 1 / window.timelineXScale;
            window.timelineScrollX += 1;
          }

          // console.log('mouse.x',mouse.x)
          // console.log('shape.w + shape.x',shape.w + shape.x)
          // console.log('mouse.x - (shape.w + shape.x)',mouse.x - (shape.w + shape.x))

          if (window.timelineAction === "edge0") {
            shape.w = Math.max(
              10 / window.timelineXScale,
              shape.w - e.movementX / window.timelineXScale,
            );
            shape.x +=
              shape.w == 10 / window.timelineXScale ? 0 : e.movementX / window.timelineXScale;
            clearCanvas();
            drawGraph();
          } else if (window.timelineAction === "edge1") {
            shape.w = Math.max(
              10 / window.timelineXScale,
              shape.w + e.movementX / window.timelineXScale,
            );

            clearCanvas();
            drawGraph();
          } else if (window.timelineAction === "move") {
            shape.x += e.movementX / window.timelineXScale;
            const x = checkIfAttach(shape.x, shape.w);

            shape.y += e.movementY;
            clearCanvas();
            if (x) {
              shape.x = x[0];
            }
            shape.drawTheLineonHover();
            drawGraph();
            if (x) {
              shape.drawTheXAttach(x[1] ? shape.x + shape.w : shape.x);
            }
          }
          exportJson();
        }
      },
      false,
    );
    canvasDom.addEventListener(
      "mouseup",
      function (e) {
        var shape = tempGraphArr[tempGraphArr.length - 1];

        if (shape) {
          shape.y = Math.floor((shape.y + 10) / 28) * 28;
          checkIfInsideLoop(shape);
          shape.y = Math.floor((shape.y + 10) / 28) * 28;

          clearCanvas();
          drawGraph();
        }
        if (e.offsetY < 30) {
          window.currentFrame = (e.offsetX - window.timelineScrollX) * 10 / window.timelineXScale
          clearCanvas();
          drawGraph();
        }


        tempGraphArr = [];
        getXArray(timelineGraphs);
        exportJson();
        window.timelineAction = "none";
      },
      false,
    );
    canvasDom.addEventListener(
      "mousewheel",
      function (e) {
        e.preventDefault();
        // console.log(e);
        window.timelineScrollX = Math.min(
          Math.max(window.timelineScrollX + e.deltaY, -2400),
          0,
        );
        clearCanvas();
        drawGraph();
        getXArray(timelineGraphs);
        // console.log(e.window.scrollX)
      },
      false,
    );

    const clearCanvas = () => {
      timelineCtx.clearRect(0, 0, canvasDom.width, canvasDom.height);
    }
    const drawGraph = () => {
      // console.log(timelineGraphs)
      timelineCtx.save();
      timelineCtx.translate(window.timelineScrollX, 0);
      drawScale(timelineCtx);
      timelineCtx.restore();
      for (var i = 0; i < timelineGraphs.length; i++) {
        timelineGraphs[i].paint();
      }
      timelineCtx.save();
      timelineCtx.translate(window.timelineScrollX, 0);
      drawTimePointer(timelineCtx,window.currentFrame * window.timelineXScale / 10 ,canvasDom.height)
      timelineCtx.restore();
    };
    // const checkIfInside = () => {
    //   // console.log(timelineGraphs)
    //   for (var i = 0; i < timelineGraphs.length; i++) {
    //     checkIfInside(timelineGraphs[i].x,timelineGraphs[i].w,timelineGraphs[i].y);
    //   }
    // };
    window.redraw_function = () => {
      clearCanvas();
      drawGraph();
    };
    window.addElement_function = async() => {
      await addElement();
      clearCanvas();
      drawGraph();
    };

    window.initJsonForCanvas = (items) => {
      // clearCanvas();

      timelineCtx.clearRect(0, 0, canvasDom.width, canvasDom.height);
      timelineGraphs = [];
      for (var item of items) {
        var graph = new timelineGraph(
          item.x / 100,
          item.y * 28,
          item.w / 100,
          24,
          "timelineGraph",
          `rgba(${randomInt(0, 255)}, ${randomInt(0, 255)}, ${randomInt(0, 255)} , 1) `,
          canvasDom,
          "rectangle",
        );
        timelineGraphs.push(graph);
      }

      drawGraph();
    };

    drawGraph();
  };

  return (
    <div>
      <canvas id="timeLineCanvas" className="canvasBase" width="1500" height="300"></canvas>
    </div>
  );
}
// export default Timeline;

export const Timelinememo = memo(Timeline);
