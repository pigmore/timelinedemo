import logo from "./logo.svg";
import "./App.css";
import React, { useState, memo, useRef, useEffect } from "react";
import { Timelinememo } from "./components/timeline";
import { Monitormemo } from "./components/monitor";
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
  useEffect(() => {}, []);

  async function loadFile(accept) {
    const [fileHandle] = await window.showOpenFilePicker({
      types: [{ accept }],
    });
    return await fileHandle.getFile();
  }

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
        <button
          onClick={async() => {
            const file = await loadFile({ 'video/*': ['.mp4', '.mov'] });
            console.log(file)
            const stream = file.stream()
            console.log(stream)
            window.videoTest.src = stream
            const reader = stream.getReader()
            console.log(reader)
            let buffer = [];
            while (1) {
                const { value, done } = await reader.read();
                if (done) {
                    const blob = new Blob(buffer);
                    const blobUrl = URL.createObjectURL(blob);
                    window.videoTest.src = blobUrl;
                    break;
                }
                buffer.push(value);
                console.log('??')
            }
          }}
        >
          input Video
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
