import { useState, useEffect, memo } from "react";
import { randomInt } from "./util";
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
      if (tablelist[i] == callback) {
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
  const checkIfInsideLoop = (_shape) =>{
    if (checkIfInside(_shape.x,_shape.w,_shape.y,_shape.id)){
      _shape.y += 20
      console.log(_shape.y)
      checkIfInsideLoop(_shape)
    }
  }
  const checkIfInside = (_x,_w,_y,_id) =>{
    for (var item of graphs) {
      if (_id === item.id) continue;
      if (_y >= item.y + 20 || _y <= item.y - 20) continue;
      if (_x >= item.x && _x <= item.x + item.w){
        return true
      }
      if (_x+_w >= item.x && _x+_w <= item.x + item.w){
        return true
      }
      if (_x > item.x && _x+_w < item.x + item.w){
        return true
      }
      if (_x < item.x && _x+_w > item.x + item.w){
        return true
      }
    }
    return false
  }

  const exportJson = () => {
    let result = [];
    for (var item of graphs) {
      var temp = {
        x: (item.x * 100).toFixed(),
        y: (item.y / 20) .toFixed(),
        w: (item.w * 100) .toFixed(),
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
  const checkIfAttach = (_x,_w) =>{
    for (var item of xArray) {
      if (Math.abs(_x - item)<0.1){
        return [item,0]
        break;
      }else if(Math.abs(_x + _w - item)<0.1){
        return [item - _w,1]
        break;
      }
    }
    return false;
  }

  const getXArray = (_graphs) =>{
    for (var item of _graphs) {
      xArray.push(item.x)
      xArray.push(item.x+item.w)
    }
  }
  const initCanvas = () => {
    if (window.initReady) return false;

    canvas = document.getElementById("canvas");

    window.initReady = true;
    window.myscrollX = 0;
    window.xScale = 10;

    for (var i = 0; i < 20; i++) {
      var graph = new dragGraph(
        randomInt(0, 120),
        randomInt(0, 10) * 20,
        randomInt(10, 40),
        20,
        `rgba(${randomInt(0, 255)}, ${randomInt(0, 255)}, ${randomInt(0, 255)} , 1) `,
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
          }else{
            xArray.push(shape.x)
            xArray.push(shape.x+shape.w)
          }
          shape.paint();
        });
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
          // console.log('mouse.x',mouse.x)
          // console.log('shape.w + shape.x',shape.w + shape.x)
          // console.log('mouse.x - (shape.w + shape.x)',mouse.x - (shape.w + shape.x))

          if (window.action === "edge0") {
            shape.w -= e.movementX / window.xScale;
            shape.x += e.movementX / window.xScale;
            shape.erase();
            drawGraph();
          }
          else if (window.action === "edge1") {
            shape.w += e.movementX / window.xScale;

            shape.erase();
            drawGraph();
          }
          else if (window.action === "move"){
            shape.x += e.movementX / window.xScale;
            const x = checkIfAttach(shape.x,shape.w)

            shape.y += e.movementY;
            shape.erase();
            if (x) {
              shape.x = x[0];
            }
            shape.drawTheLineonHover();
            drawGraph();
            if (x) {
              shape.drawTheXAttach(x[1]?shape.x + shape.w:shape.x);
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

        if(shape){
          shape.y = Math.floor((shape.y + 10) / 20) * 20
          checkIfInsideLoop(shape);
          shape.y = Math.floor((shape.y + 10) / 20) * 20

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
        console.log(e);
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
      var canvas = document.getElementById("canvas");
      canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
      graphs = [];
      for (var item of items) {
        var graph = new dragGraph(
          item.x / 100,
          item.y * 20,
          item.w / 100,
          20,
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
      <canvas id="canvas" className="canvas" width="1500" height="300"></canvas>
    </div>
  );
}
// export default Timeline;

export const Timelinememo = memo(Timeline);
