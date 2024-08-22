import { useState, useEffect, memo } from "react";
import {
  randomInt,
  drawScale,
  drawTimePointer,
  clone,
  uuid,
  loadImgProssse,
} from "./util";
import { cloneDeep } from "lodash";
import iconEmojo from "./icon/iconEmojo.svg";
import iconImage from "./icon/iconImage.svg";
import iconMusic from "./icon/iconMusic.svg";
import iconText from "./icon/iconText.svg";
import iconVideo from "./icon/iconVideo.svg";
import iconVoice from "./icon/iconVoice.svg";
import iconScript from "./icon/iconScript.svg";
import { timelineGraph } from "./timelineGraph";
import { sample } from "./sample";
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
  var requestId ,
    performanceNow = 0,
    canvasDom = null,
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
    return ()=>{removeEvents()}
  }, []);
  const checkIfInsideMoveing = (_shape, mouseX, needtoPiant = true) => {
    const _x = checkIfInsidemoving(
      _shape.x,
      _shape.w,
      _shape.y,
      _shape.id,
      mouseX,
    );
    console.log(_x);
    if (_x >= 0) {
      if (needtoPiant) {
        _shape.drawVirtuRect(_x);
      } else {
        _shape.x = _x;
      }
      console.log(_shape.y);
      // checkIfInsideLoop(_shape);
    }
  };
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
  const checkIfInsidemoving = (_x, _w, _y, _id, _mousex) => {
    var inside = false;
    for (var item of timelineGraphs) {
      if (_id === item.id) continue;
      if (Math.floor((_y + 10) / 28) * 28 != item.y) continue;
      if (_x >= item.x && _x < item.x + item.w) {
        inside = true;
      } else if (_x + _w > item.x && _x + _w <= item.x + item.w) {
        inside = true;
      } else if (_x > item.x && _x + _w < item.x + item.w) {
        inside = true;
      } else if (_x < item.x && _x + _w > item.x + item.w) {
        inside = true;
      }
      if (inside) {
        if (_mousex / window.timelineXScale > item.x + item.w / 2) {
          return item.x + item.w;
        } else if (item.x - _w > 0) {
          return item.x - _w;
        }
        return 0;
      }
    }
    return -1;
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
  const playLoop = (_stamp) => {
    const deltaTime = _stamp - performanceNow
    window.currentTime += deltaTime;
    window.currentFrame =  Math.floor(window.currentTime / 100 * 6);
    clearCanvas();
    drawGraph();
    window.monitor_drawGraphs_function()
    performanceNow = _stamp
    requestId = window.requestAnimationFrame(playLoop)
    // timelinePlay();
  }
  const timelinePlay = () => {
    performanceNow = performance.now()
    if (!requestId) {
       requestId = window.requestAnimationFrame(playLoop);
       window.akoolEditorState = 'playing'
    }
  }
  const timelineStop = () => {
    if (requestId) {
      window.cancelAnimationFrame(requestId);
      requestId = undefined;
      window.akoolEditorState = 'paused'
    }
  }
  const timelineCut = () => {
    var _index = -1;
    var _item = {};
    timelineGraphs.forEach((item, i) => {
      if (item.selected &&  ( item.x < window.currentFrame / 6 &&  item.x + item.w > window.currentFrame / 6)) {
        _item = new timelineGraph(
          item.x,
          item.y,
          item.w,
          24,
          item.t,
          item.type,
          item.icon,
          item.fillStyle,
          item.strokeStyle,
          canvasDom,
          "rectangle",
        );
        _item.id = uuid();
        _item.x = window.currentFrame / 6;
        _item.w -= window.currentFrame / 6 - item.x;
        _index = i;
        item.w = window.currentFrame / 6 - item.x;
      }
    });
    if (_index >= 0) {
      timelineGraphs.splice(_index, 0, _item);
      clearCanvas();
      drawGraph();
    }
  };
  const addElement = async (x,y,w,type) => {
    // var typeTemp = ["music", "textbox", "Emojo", "Image", "Video"][
    //   randomInt(0, 5)
    // ];
    var color = "";
    var strokeStyle = "";
    var iconUrl = "";
    switch (type) {
      case "music":
        color = "rgba(140,26,255,0.6)";
        strokeStyle = "rgba(140,26,255,1)";
        iconUrl = iconMusic;
        break;
      case "textbox":
        color = "rgba(255,114,26,0.6)";
        strokeStyle = "rgba(255,114,26,1)";
        iconUrl = iconText;
        break;
      case "Emojo":
        color = "rgba(242,73,143,0.6)";
        strokeStyle = "rgba(242,73,143,1)";
        iconUrl = iconEmojo;
        break;
      case "image":
        color = "rgba(0,217,109,0.6)";
        strokeStyle = "rgba(0,217,109,1)";
        iconUrl = iconImage;
        break;
      case "avatar":
      case "video":
        color = "rgba(0,170,255,0.6)";
        strokeStyle = "rgba(0,170,255,1)";
        iconUrl = iconVideo;
        break;
      default:
        color = "";
    }
    var graph = new timelineGraph(
      x / 100,
      y * 28,
      w / 100,
      24,
      type,
      type,
      await loadImgProssse(canvasDom, iconUrl),
      color,
      strokeStyle,
      canvasDom,
      "rectangle",
    );
    checkIfInsideLoop(graph);
    timelineGraphs.push(graph);
  };

  const clearCanvas = () => {
    timelineCtx.clearRect(0, 0, canvasDom.width, canvasDom.height);
  };
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
    drawTimePointer(
      timelineCtx,
      (window.currentFrame * window.timelineXScale) / 6,
      canvasDom.height,
    );
    timelineCtx.restore();
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
  let eventFunctions = {};
  eventFunctions.mousedown = (e) => {
    var mouse = {
      x: e.offsetX,
      y: e.offsetY,
    };
    // console.log(mouse.x);
    xArray = [];
    if (
      Math.abs(
        e.offsetX -
          window.timelineScrollX -
          (window.currentFrame * window.timelineXScale) / 6,
      ) < 5
    ) {
      window.timelineAction = "timeLinePointerMoving";
    } else {
      timelineGraphs.forEach(function (shape) {
        shape.selected = false;
        var offset = {
          x: mouse.x - shape.x,
          y: mouse.y - shape.y,
        };
        var timelineAction = shape.isMouseInGraph(mouse);
        if (timelineAction) {
          shape.selected = true;
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
  };
  eventFunctions.mousemove = (e) => {
    var mouse = {
      x: e.clientX - canvasDom.getBoundingClientRect().left,
      y: e.clientY - canvasDom.getBoundingClientRect().top,
    };
    // hoverThePointer
    if (
      Math.abs(
        e.offsetX -
          window.timelineScrollX -
          (window.currentFrame * window.timelineXScale) / 6,
      ) < 5
    ) {
      canvasDom.style.cursor = "pointer";
    } else {
      canvasDom.style.cursor = "auto";
    }

    if (window.timelineAction == "timeLinePointerMoving") {
      window.currentFrame += (e.movementX / window.timelineXScale) * 6;
      window.currentTime = Math.floor(window.currentFrame * 1000 / 60);
      clearCanvas();
      drawGraph();
      window.monitor_drawGraphs_function(true)
    } else if (tempGraphArr[tempGraphArr.length - 1]) {
      var shape = tempGraphArr[tempGraphArr.length - 1];
      if (e.offsetX > canvasDom.width - 35 && window.timelineScrollX > -2400) {
        if (window.timelineAction === "edge1") {
          shape.w += 1 / window.timelineXScale;
        } else {
          shape.x += 1 / window.timelineXScale;
        }

        window.timelineScrollX -= 1;
      } else if (e.offsetX < 35 && window.timelineScrollX < 0) {
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
          shape.w == 10 / window.timelineXScale
            ? 0
            : e.movementX / window.timelineXScale;
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
        checkIfInsideMoveing(shape, e.offsetX);

        drawGraph();
        if (x) {
          shape.drawTheXAttach(x[1] ? shape.x + shape.w : shape.x);
        }
      }
      exportJson();
    }
  };
  eventFunctions.mouseup = (e) => {
    var shape = tempGraphArr[tempGraphArr.length - 1];

    if (shape) {
      shape.y = Math.floor((shape.y + 10) / 28) * 28;
      checkIfInsideMoveing(shape, e.offsetX, false);
      checkIfInsideLoop(shape);
      shape.y = Math.floor((shape.y + 10) / 28) * 28;

      clearCanvas();
      drawGraph();
    }
    if (e.offsetY < 30) {
      window.currentFrame =
        ((e.offsetX - window.timelineScrollX) * 6) / window.timelineXScale;
      window.currentTime = Math.floor(window.currentFrame * 1000 / 60)
      clearCanvas();
      drawGraph();
      window.monitor_drawGraphs_function(true)
      // window.forceUpdateTime_function()
    }

    tempGraphArr = [];
    getXArray(timelineGraphs);
    exportJson();
    window.timelineAction = "none";
  };
  eventFunctions.mousewheel = (e) => {
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
  };

  const addevents = () => {
    canvasDom.addEventListener(
      "mousedown",
      (e) => {
        eventFunctions.mousedown(e);
      },
      false,
    );
    canvasDom.addEventListener(
      "mousemove",
      (e) => {
        eventFunctions.mousemove(e);
      },
      false,
    );
    canvasDom.addEventListener(
      "mouseup",
      (e) => {
        eventFunctions.mouseup(e);
      },
      false,
    );
    canvasDom.addEventListener(
      "mousewheel",
      (e) => {
        eventFunctions.mousewheel(e);
      },
      false,
    );
  };
  const removeEvents = () => {
    canvasDom.removeEventListener(
      "mousedown",
      (e) => {
        eventFunctions.mousedown(e);
      },
      false,
    );
    canvasDom.removeEventListener(
      "mousemove",
      (e) => {
        eventFunctions.mousemove(e);
      },
      false,
    );
    canvasDom.removeEventListener(
      "mouseup",
      (e) => {
        eventFunctions.mouseup(e);
      },
      false,
    );
    canvasDom.removeEventListener(
      "mousewheel",
      (e) => {
        eventFunctions.mousewheel(e);
      },
      false,
    );
  };
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
    window.timelineStop_function = () => {
      timelineStop();
    };
    window.timelinePlay_function = () => {
      timelinePlay();
    };
    window.timelineCut_function = () => {
      timelineCut();
    };
    window.redraw_function = () => {
      clearCanvas();
      drawGraph();
    };
    window.addElement_function = async () => {
      await addElement();
      clearCanvas();
      drawGraph();
    };
    window.initJsonForCanvas = async(_data) => {
      // clearCanvas();
      var items = [];
      for (var item of _data) {
        for (var variable in item) {
          if (item.hasOwnProperty(variable)) {
            if (variable == "bg_musics") {
              const bg_musics_item = item[variable][0];
              items.push({
                x: bg_musics_item.start_time,
                w: bg_musics_item.end_time - bg_musics_item.start_time,
                y: 2,
                type:'music'
              });
            }
            if (variable == "elements") {
              for (var elementsItem of item[variable]) {
                items.push({
                  x: elementsItem.start_time,
                  w: elementsItem.end_time - elementsItem.start_time,
                  y: elementsItem.layer_number + 2,
                  type:elementsItem.type
                });
              }
            }
          }
        }
      }

      timelineCtx.clearRect(0, 0, canvasDom.width, canvasDom.height);
      timelineGraphs = [];
      for (var item of items) {
        await addElement(
          item.x,
          item.y,
          item.w,
          item.type
        )
      }

      drawGraph();
    };

    // for (var i = 0; i < 12; i++) {
    //   await addElement();
    // }
    addevents();
    drawGraph();
    window.initJsonForCanvas(sample.data)
  };

  return (
    <div>
      <canvas
        id="timeLineCanvas"
        className="canvasBase"
        width="1500"
        height="300"
      ></canvas>
    </div>
  );
}
// export default Timeline;

export const Timelinememo = memo(Timeline);
