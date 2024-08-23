import logo from "./logo.svg";
import "./App.css";
import React, { useState, memo, useRef, useEffect } from "react";
import { Timelinememo } from "./components/timeline";
import { Monitormemo } from "./components/monitor";
import { uuid,loadLocalVideoProssse,loadLocalImgProssse } from "./components/util";
import { ColorPickermemo } from "./components/colorPicker";
import { CallChild, CallChildMemo } from "./components/callChild";
import { Test, Testmemo } from "./components/testmodule";

function App() {
  const [count, setCount] = useState(12);
  const [redraw, setRedraw] = useState(0);
  const [scale, setScale] = useState(10);
  const myRef = useRef();
  const handleRedraw = () => {
    setRedraw((redraw) => redraw + 1);
  };
  const handlemyRefCount = () => {
    myRef.current.callmycount();
  };
  const addImageElement = async() => {
    let loadedSrc = await loadLocalImgProssse()
    const item = {
      id:uuid(),
      x:0,
      y:2,
      w:3000,
      width: loadedSrc.width,
      height: loadedSrc.height,
      loadedSrc:loadedSrc,
      type:'image'
    }
    console.log(loadedSrc,'loadedSrc')
    console.log(item)
    window.timelineAddElement_function(item)
    window.monitorAddElement_function(item)

    window.timelineRedraw_function()
    window.monitor_drawGraphs_function(true)
  }
  const addVideoElement = async() => {
    let loadedSrc = await loadLocalVideoProssse()
    const item = {
      id:uuid(),
      x:0,
      y:2,
      w:loadedSrc[1].duration * 1000,
      width: loadedSrc[1].width,
      height: loadedSrc[1].height,
      loadedSrc:loadedSrc[0],
      type:'video'
    }
    console.log(loadedSrc)
    console.log(item)
    window.timelineAddElement_function(item)
    window.monitorAddElement_function(item)

    window.timelineRedraw_function()
    window.monitor_drawGraphs_function(true)
  };
  useEffect(() => {}, []);



  return (
    <div className="App">
      <Monitormemo />
      <button
        onClick={() => {
          window.timelinePlay_function();
        }}
      >
        play!
      </button>
      <button
        onClick={() => {
          window.timelineStop_function();
        }}
      >
        stop!
      </button>
      <button
        onClick={() => {
          window.timelineCut_function();
        }}
      >
        cut!
      </button>

      <button
        onClick={() => {
          window.timelineXScale = Math.max(scale - 1, 1);
          setScale((scale) => Math.max(scale - 1, 1));
          // handleRedraw()
          window.timelineRedraw_function();
        }}
      >
        scale:{scale}-1
      </button>
      <button
        onClick={() => {
          window.timelineXScale = Math.min(scale + 1, 30);
          setScale((scale) => Math.min(scale + 1, 30));
          // handleRedraw()
          window.timelineRedraw_function();
        }}
      >
        scale:{scale}+1
      </button>

      <button
        onClick={async() => {
          addVideoElement()
        }}
      >
        input Video
      </button>
      <button
        onClick={async() => {
          addImageElement()
        }}
      >
        input img
      </button>

      <Timelinememo redrawTrigger={redraw} />

      {/*
        <button
          onClick={async () => {
            setCount((count) => count + 1);
            await window.addElement_function();
          }}
        >
          {count}+1
        </button>

        <video src="" id='videoTest' controls={true}></video>
        <ColorPickermemo />
        <video controls id = "myStreamingVideo"></video>

        <iframe
          src="https://customer-vxu9ydnf16h5vq7y.cloudflarestream.com/6d7bb109ad1247bcb6b6c6decdb63a49/iframe?poster=https%3A%2F%2Fcustomer-vxu9ydnf16h5vq7y.cloudflarestream.com%2F6d7bb109ad1247bcb6b6c6decdb63a49%2Fthumbnails%2Fthumbnail.jpg%3Ftime%3D%26height%3D600"
          height="720"
          width="1280"
          allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;"
          allowFullScreen={true}
          id="stream-player"
        ></iframe>
        */}

      {/*

        <button
          onClick={() => {
            handlemyRefCount();
          }}
        >
          handlemyRefCount
        </button>
        <CallChildMemo ref={myRef} />
        */}

      <Testmemo />
    </div>
  );
}

export default App;
