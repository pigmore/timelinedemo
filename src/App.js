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
    const videoTag = document.getElementById("myStreamingVideo");

    // Need to be specific for Blink regarding codecs
    // ./mp4info frag_bunny.mp4 | grep Codec

      //https://customer-f33zs165nr7gyfy4.cloudflarestream.com/6b9e68b07dfee8cc2d116e4c51d6a957/manifest/video.m3u8

      // var baseUrl = 'https://bitdash-a.akamaihd.net/content/MI201109210084_1/video/720_2400000/dash/';
      // var initUrl = baseUrl + 'init.mp4';

      // const baseUrl = "https://customer-vxu9ydnf16h5vq7y.cloudflarestream.com/6d7bb109ad1247bcb6b6c6decdb63a49/manifest/video.m3u8";
      const baseUrl = "https://customer-f33zs165nr7gyfy4.cloudflarestream.com/6b9e68b07dfee8cc2d116e4c51d6a957/iframe";
      var initUrl = baseUrl + '';
      var templateUrl = baseUrl + 'segment_$Number$.m4s';
      var sourceBuffer;
      var index = 0;
      var numberOfChunks = 52;
      var video = document.getElementById("myStreamingVideo");

      if (!window.MediaSource) {
        console.error('No Media Source API available');
        return;
      }

      var ms = new MediaSource();
      video.src = window.URL.createObjectURL(ms);
      ms.addEventListener('sourceopen', onMediaSourceOpen);

      function onMediaSourceOpen() {
        sourceBuffer = ms.addSourceBuffer('video/mp4; codecs="avc1.4d401f"');
        sourceBuffer.addEventListener('updateend', nextSegment);

        GET(initUrl, appendToBuffer);

        // video.play();
      }

      function nextSegment() {
        var url = templateUrl.replace('$Number$', index);
        GET(url, appendToBuffer);
        index++;
        if (index > numberOfChunks) {
          sourceBuffer.removeEventListener('updateend', nextSegment);
        }
      }

      function appendToBuffer(videoChunk) {
        if (videoChunk) {
          sourceBuffer.appendBuffer(new Uint8Array(videoChunk));
        }
      }

      function GET(url, callback) {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', url);
        xhr.responseType = 'arraybuffer';

        xhr.onload = function(e) {
          if (xhr.status != 200) {
            console.warn('Unexpected status code ' + xhr.status + ' for ' + url);
            return false;
          }
          callback(xhr.response);
        };

        xhr.send();
      }


    // const myMediaSource = new MediaSource();
    // const url = URL.createObjectURL(myMediaSource);
    // videoTag.src = url;
    // //
    // const videoSourceBuffer = myMediaSource
    //   .addSourceBuffer('video/mp4; codecs="avc1.64001e"');
    //
    // fetch("https://customer-vxu9ydnf16h5vq7y.cloudflarestream.com/6d7bb109ad1247bcb6b6c6decdb63a49").then(function(response) {
    //   return response.arrayBuffer();
    // }).then(function(videoData) {
    //   videoSourceBuffer.appendBuffer(videoData);
    // });


    // const player = Stream(document.getElementById('stream-player'));
    // player.addEventListener('play', () => {
    //   console.log('playing!');
    // });
    // player.play().catch(() => {
    //   console.log('playback failed, muting to try again');
    //   player.muted = true;
    //   player.play();
    // });
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
      <video controls id = "myStreamingVideo"></video>
      {
        /*
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
