import logo from "./logo.svg";
import "./App.css";
import React, { useState, memo, useRef,useEffect } from "react";
import { Timelinememo } from "./components/timeline";
import { Monitormemo } from "./components/monitor";
import { CallChild, CallChildMemo } from "./components/callChild";
import { Test, Testmemo } from "./components/testmodule";

function App() {
  const [count, setCount] = useState(0);
  const [redraw, setRedraw] = useState(0);
  const [scale, setScale] = useState(10);
  const myRef = useRef();
  const handleRedraw = () => {
    setRedraw((redraw) => redraw + 1);
  };
  const handlemyRefCount = () => {
    myRef.current.callmycount();
  };
  useEffect(() => {

  }, []);

  return (
    <div className="App">
      <Monitormemo />

      <button
        onClick={() => {
          setCount((count) => count + 1);
        }}
      >
        {count}+1
      </button>
      <button
        onClick={() => {
          window.timelineXScale = Math.max(scale - 1, 1);
          setScale((scale) => Math.max(scale - 1, 1));
          // handleRedraw()
          window.redraw_function();
        }}
      >
        scale:{scale}-1
      </button>
      <button
        onClick={() => {
          window.timelineXScale = Math.min(scale + 1, 30);
          setScale((scale) => Math.min(scale + 1, 30));
          // handleRedraw()
          window.redraw_function();
        }}
      >
        scale:{scale}+1
      </button>




      {
        /*
        <Timelinememo redrawTrigger={redraw} />
        <video controls id = "myStreamingVideo"></video>

        <iframe
          src="https://customer-vxu9ydnf16h5vq7y.cloudflarestream.com/6d7bb109ad1247bcb6b6c6decdb63a49/iframe?poster=https%3A%2F%2Fcustomer-vxu9ydnf16h5vq7y.cloudflarestream.com%2F6d7bb109ad1247bcb6b6c6decdb63a49%2Fthumbnails%2Fthumbnail.jpg%3Ftime%3D%26height%3D600"
          height="720"
          width="1280"
          allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;"
          allowFullScreen={true}
          id="stream-player"
        ></iframe>
        */
      }






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
