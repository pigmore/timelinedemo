import { useState, useEffect, memo } from "react";
import { randomInt } from './util';
import { dragGraph } from './dragGraph';

export function Timeline(props) {
  var canvas = null,
   graphs = [],
    graphAttr = [],
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


  const initCanvas = () => {
    if (window.initReady) return false;
    canvas = document.getElementById("canvas");
    window.initReady = true;
    window.myscrollX = 0
    window.xScale = 10


    for (var i = 0; i < 2000; i++) {
      var graph = new dragGraph(
        randomInt(0, 1200),
        randomInt(0, 280),
        randomInt(10, 40),
        20,
        `rgba(${randomInt(0, 255)}, ${randomInt(0, 255)}, ${randomInt(0, 255)} , 1) `,
        canvas,
        'rectangle'
      );
      graphs.push(graph);
    }

    canvas.addEventListener(
      "mousedown",
      function (e) {
        var mouse = {
          x: e.clientX - canvas.getBoundingClientRect().left,
          y: e.clientY - canvas.getBoundingClientRect().top,
        };
        console.log(mouse.x);
        graphs.forEach(function (shape) {
          var offset = {
            x: mouse.x - shape.x,
            y: mouse.y - shape.y,
          };
          var action = shape.isMouseInGraph(mouse)
          if (action) {
            tempGraphArr.push(shape);
            window.action = action
            // if (Math.abs(mouse.x - (shape.w + shape.x + window.myscrollX)) < 10) {
            //   window.action = "edge";
            // } else {
            //   window.action = "none";
            // }
          }
        });
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

          if (window.action === "edge") {
            shape.w += e.movementX / window.xScale;

            shape.erase();
            drawGraph();
          } else {
            shape.x += e.movementX / window.xScale;
            shape.y += e.movementY;

            shape.erase();
            drawGraph();
          }
        }
      },
      false,
    );
    canvas.addEventListener(
      "mouseup",
      function () {
        tempGraphArr = [];
        window.action = "none";
      },
      false,
    );
    canvas.addEventListener(
      "mousewheel",
      function (e) {
        console.log(e)
        window.myscrollX =Math.min(Math.max(window.myscrollX + e.deltaY,-2400),0)
        graphs[0].erase();
        drawGraph();
        // console.log(e.window.scrollX)
      },
      false,
    );
    const drawGraph = ()=>{
      // console.log(graphs)
      for (var i = 0; i < graphs.length; i++) {
        graphs[i].paint();
      }
    }

    window.redraw_function = ()=>{
      graphs[0].erase();
      drawGraph();
    }
    window.initJsonForCanvas = (items)=>{
      // graphs[0].erase();
      var canvas = document.getElementById("canvas")
      canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
      graphs = []
      for (var item of items) {
        var graph = new dragGraph(
          item.x / 100,
          item.y * 20,
          item.w / 100,
          20,
          `rgba(${randomInt(0, 255)}, ${randomInt(0, 255)}, ${randomInt(0, 255)} , 1) `,
          canvas,
          'rectangle'
        );
        graphs.push(graph);
      }


      drawGraph();
    }

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
