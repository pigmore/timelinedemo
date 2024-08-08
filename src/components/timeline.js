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
  var canvas = null,
    canvasCtx = null,
    graphs = [],
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
    for (var item of graphs) {
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
    for (var item of graphs) {
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

  const getXArray = (_graphs) => {
    for (var item of _graphs) {
      xArray.push(item.x);
      xArray.push(item.x + item.w);
    }
  };
  const initCanvas = async () => {
    if (window.initReady) return false;

    canvas = document.getElementById("canvas");
    canvasCtx = canvas.getContext("2d");
    window.initReady = true;
    window.myscrollX = 0;
    window.xScale = 10;

    for (var i = 0; i < 12; i++) {
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
      var graph = new dragGraph(
        randomInt(0, 124),
        randomInt(2, 6) * 28,
        randomInt(10, 40),
        24,
        typeTemp,
        typeTemp,
        await loadImgProssse(canvas, iconUrl),
        color,
        strokeStyle,
        canvas,
        "rectangle",
      );
      checkIfInsideLoop(graph);
      graphs.push(graph);
    }

    canvas.addEventListener(
      "mousedown",
      function (e) {
        var mouse = {
          x: e.clientX - canvas.getBoundingClientRect().left,
          y: e.clientY - canvas.getBoundingClientRect().top,
        };
        // console.log(mouse.x);
        xArray = [];
        graphs.forEach(function (shape) {
          var offset = {
            x: mouse.x - shape.x,
            y: mouse.y - shape.y,
          };
          var action = shape.isMouseInGraph(mouse);
          if (action) {
            tempGraphArr.push(shape);
            window.action = action;
          } else {
            xArray.push(shape.x);
            xArray.push(shape.x + shape.w);
          }
          // shape.paint();
        });
        graphs[0].erase();
        drawGraph();
        // getXArray(graphs)
        e.preventDefault();
      },
      false,
    );
    canvas.addEventListener(
      "mousemove",
      function (e) {
        var mouse = {
          x: e.clientX - canvas.getBoundingClientRect().left,
          y: e.clientY - canvas.getBoundingClientRect().top,
        };

        if (tempGraphArr[tempGraphArr.length - 1]) {
          var shape = tempGraphArr[tempGraphArr.length - 1];
          if (e.offsetX > canvas.width - 35 && window.myscrollX > -2400) {
            if (window.action === "edge1") {
              shape.w += 1 / window.xScale;
            } else {
              shape.x += 1 / window.xScale;
            }

            window.myscrollX -= 1;
          } else if (e.offsetX < 35 && window.myscrollX < 0) {
            shape.x -= 1 / window.xScale;
            window.myscrollX += 1;
          }

          // console.log('mouse.x',mouse.x)
          // console.log('shape.w + shape.x',shape.w + shape.x)
          // console.log('mouse.x - (shape.w + shape.x)',mouse.x - (shape.w + shape.x))

          if (window.action === "edge0") {
            shape.w = Math.max(
              10 / window.xScale,
              shape.w - e.movementX / window.xScale,
            );
            shape.x +=
              shape.w == 10 / window.xScale ? 0 : e.movementX / window.xScale;
            shape.erase();
            drawGraph();
          } else if (window.action === "edge1") {
            shape.w = Math.max(
              10 / window.xScale,
              shape.w + e.movementX / window.xScale,
            );

            shape.erase();
            drawGraph();
          } else if (window.action === "move") {
            shape.x += e.movementX / window.xScale;
            const x = checkIfAttach(shape.x, shape.w);

            shape.y += e.movementY;
            shape.erase();
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
    canvas.addEventListener(
      "mouseup",
      function () {
        var shape = tempGraphArr[tempGraphArr.length - 1];

        if (shape) {
          shape.y = Math.floor((shape.y + 10) / 28) * 28;
          checkIfInsideLoop(shape);
          shape.y = Math.floor((shape.y + 10) / 28) * 28;

          shape.erase();
          drawGraph();
        }

        tempGraphArr = [];
        getXArray(graphs);
        exportJson();
        window.action = "none";
      },
      false,
    );
    canvas.addEventListener(
      "mousewheel",
      function (e) {
        // console.log(e);
        window.myscrollX = Math.min(
          Math.max(window.myscrollX + e.deltaY, -2400),
          0,
        );
        graphs[0].erase();
        drawGraph();
        getXArray(graphs);
        // console.log(e.window.scrollX)
      },
      false,
    );

    const drawGraph = () => {
      // console.log(graphs)
      canvasCtx.save();
      canvasCtx.translate(window.myscrollX, 0);
      drawScale(canvasCtx);
      canvasCtx.restore();
      for (var i = 0; i < graphs.length; i++) {
        graphs[i].paint();
      }
    };
    // const checkIfInside = () => {
    //   // console.log(graphs)
    //   for (var i = 0; i < graphs.length; i++) {
    //     checkIfInside(graphs[i].x,graphs[i].w,graphs[i].y);
    //   }
    // };
    window.redraw_function = () => {
      graphs[0].erase();
      drawGraph();
    };

    window.initJsonForCanvas = (items) => {
      // graphs[0].erase();

      canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
      graphs = [];
      for (var item of items) {
        var graph = new dragGraph(
          item.x / 100,
          item.y * 28,
          item.w / 100,
          24,
          "dragGraph",
          `rgba(${randomInt(0, 255)}, ${randomInt(0, 255)}, ${randomInt(0, 255)} , 1) `,
          canvas,
          "rectangle",
        );
        graphs.push(graph);
      }

      drawGraph();
    };

    drawGraph();
  };

  return (
    <div>
      <canvas id="canvas" className="canvasBase" width="1500" height="300"></canvas>
    </div>
  );
}
// export default Timeline;

export const Timelinememo = memo(Timeline);
