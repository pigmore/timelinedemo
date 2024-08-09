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
    const player = Stream(document.getElementById('stream-player'));
    player.addEventListener('play', () => {
      console.log('playing!');
    });
    player.play().catch(() => {
      console.log('playback failed, muting to try again');
      player.muted = true;
      player.play();
    });
  }, []);

  return (
    <div className="App">
      <button
        onClick={() => {
          setCount((count) => count + 1);
        }}
      >
        {count}+1
      </button>
      <button
        onClick={() => {
          window.xScale = Math.max(scale - 1, 1);
          setScale((scale) => Math.max(scale - 1, 1));
          // handleRedraw()
          window.redraw_function();
        }}
      >
        scale:{scale}-1
      </button>
      <button
        onClick={() => {
          window.xScale = Math.min(scale + 1, 20);
          setScale((scale) => Math.min(scale + 1, 20));
          // handleRedraw()
          window.redraw_function();
        }}
      >
        scale:{scale}+1
      </button>

      <Monitormemo />
      <Timelinememo redrawTrigger={redraw} />
      <iframe
        src="https://customer-<CODE>.cloudflarestream.com/<VIDEO_UID>/iframe"
        style="border: none"
        height="720"
        width="1280"
        allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;"
        allowfullscreen="true"
        id="stream-player"
      ></iframe>

      <script src="https://embed.cloudflarestream.com/embed/sdk.latest.js"></script>




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
