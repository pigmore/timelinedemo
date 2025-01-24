import React, { useEffect, useState, useRef } from "react";
import logo from "./logo.svg";
// import { ColorPickermemo } from "./components/colorPicker";
import { Timelinememo } from "./components/timeline";
import { Monitormemo } from "./components/monitor";
import { EditorEvents, editorEventBus } from "./components/event-tool";
import {
  newSample1,
  newSample,
  sample,
  SAMPLE_FONTS,
} from "./components/sample";
import {
  loadLocalImgProssse,
  uuid,
  loadLocalVideoProssse,
  loadVideoProssse,
  loadImgProssse,
  loadLocalAudioProssse,
  loadAudioProssse,
  loadTextProssse,
  loadGifProssse,
} from "./components/util";
import "./App.css";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { toBlobURL, fetchFile } from "@ffmpeg/util";
// import magick from '@longlost/wasm-imagemagick/wasm-imagemagick.js';
// import createModule from "@jspawn/imagemagick-wasm/magick.mjs";
// import { buildInputFile, execute, loadImageElement } from 'wasm-imagemagick'

// import { readFileSync } from 'node:fs';
// import {
//     initializeImageMagick,
//     ImageMagick,
//     Magick,
//     MagickFormat,
//     Quantum,
// } from '@imagemagick/magick-wasm';

// Remove '../' and use '@imagemagick/magick-wasm' when using this in your project.

const ffmpeg = new FFmpeg();

function App() {
  const [loaded, setLoaded] = useState(false);
  const [itemSelected, setItemSelected] = useState(false);
  const [undoable, setUndoable] = useState(false);
  const [redoable, setRedoable] = useState(false);
  const [cutable, setCutable] = useState(false);
  const ffmpegRef = useRef(new FFmpeg());
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const messageRef = useRef<HTMLParagraphElement | null>(null);

  const loadFFmpeg = async () => {
    const baseURL = "https://unpkg.com/@ffmpeg/core-mt@0.12.6/dist/esm";
    const ffmpeg = ffmpegRef.current;
    ffmpeg.on("log", ({ message }) => {
      if (messageRef.current) messageRef.current.innerHTML = message;
    });
    await ffmpeg.load({
      coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, "text/javascript"),
      wasmURL: await toBlobURL(
        `${baseURL}/ffmpeg-core.wasm`,
        "application/wasm",
      ),
      workerURL: await toBlobURL(
        `${baseURL}/ffmpeg-core.worker.js`,
        "text/javascript",
      ),
    });
    setLoaded(true);
  };

  const transcode = async () => {
    console.log(loaded, "loaded???");

    // const videoURL = "https://raw.githubusercontent.com/ffmpegwasm/testdata/master/video-15s.avi";
    // const videoURL = "https://mathiasbynens.be/demo/animated-webp-supported.webp";
    const videoURL =
      "https://drz0f01yeq1cx.cloudfront.net/1726290486212-xxx.gif";
    const ffmpeg = ffmpegRef.current;
    await ffmpeg.writeFile("input.gif", await fetchFile(videoURL));
    await ffmpeg.exec([
      "-f",
      "gif",
      "-i",
      "input.gif",
      "-movflags",
      "+faststart",
      "-pix_fmt",
      "yuv420p",
      "-vf",
      "scale=trunc(iw/2)*2:trunc(ih/2)*2",
      "-threads",
      "8",
      "output.mp4",
    ]);
    const fileData = await ffmpeg.readFile("output.mp4");
    const data = new Uint8Array(fileData as ArrayBuffer);
    const _blob = URL.createObjectURL(
      new Blob([data.buffer], { type: "video/mp4" }),
    );
  };

  const [selectFont, setSelectFont] = useState("");
  const [fontFamily, setFontFamily] = useState("");
  const [fontSize, setFontSize] = useState(24);
  const [gifUrl, setGifUrl] = useState(
    "https://drz0f01yeq1cx.cloudfront.net/1726290486212-xxx.gif",
  );
  const [imageUrl, setImageUrl] = useState(
    "https://d11fbe263bhqij.cloudfront.net/agicontent/avatar/elements/emoji/emoji_love.png",
  );
  const [videoUrl, setVideoUrl] = useState(
    "https://drz0f01yeq1cx.cloudfront.net/1723021455828-唐仲惠Jovi20240707144921.mp4",
  );
  const [musicUrl, setMusicUrl] = useState(
    "https://d11fbe263bhqij.cloudfront.net/agicontent/avatar/elements/music/lounging-by-moonlight-40.mp3",
  );
  const [scale, setScale] = useState(15);
  // const editorEventBus = new EventTool
  const addGifElement = async (_url: string) => {
    try {
      const _id = uuid();
      const loadedSrc = await loadGifProssse(_url, _id, ffmpegRef.current);
      const item = {
        id: _id,
        x: 0,
        y: 0,
        w: loadedSrc.duration * 1000,
        width: loadedSrc.width,
        height: loadedSrc.height,
        loadedSrc: loadedSrc.videoEl,
        type: "video",
        url: _url || "",
      };
      editorEventBus.emit(EditorEvents.addElement, item);
    } catch (error) {}
  };
  const addImageElement = async (_url: string) => {
    try {
      let loadedSrc;
      const _id = "img" + uuid();
      if (_url.length === 0) {
        loadedSrc = await loadLocalImgProssse();
      } else {
        loadedSrc = await loadImgProssse(_id, _url);
      }

      const item = {
        id: _id,
        x: 0,
        y: 0,
        w: 5000,
        width: loadedSrc.width,
        height: loadedSrc.height,
        loadedSrc: loadedSrc,
        type: "image",
        url: _url || "",
      };
      editorEventBus.emit(EditorEvents.addElement, item);
    } catch {
      return;
    }
  };
  const addTextElement = async () => {
    const item = {
      id: uuid(),
      x: 0,
      y: 0,
      w: 5 * 1000,
      width: 480,
      height: 120,
      // loadedSrc: loadedSrc.audioEl,
      type: "textbox",
      initconfig: {
        fontSize: 90,
        fontFamily: "Anton-regular",
        fill: "#FFC700",
        textAlign: "center",
        text: "Good Health!",
        stroke: "#FFFFFF",
        lineWidth: 2,
        data: {
          fontURL:
            "https://d11fbe263bhqij.cloudfront.net/public/Fonts/Anton/Anton-Regular.ttf",
          type: "text",
        },
      },
    };
    editorEventBus.emit(EditorEvents.addElement, item);
  };
  const addAuidoElement = async (_url: string = "") => {
    try {
      let loadedSrc: any;
      if (_url.length === 0) {
        loadedSrc = await loadLocalAudioProssse();
      } else {
        loadedSrc = await loadAudioProssse(_url);
      }
      const item = {
        id: uuid(),
        x: 0,
        y: -100,
        w: loadedSrc.duration * 1000,
        width: 1,
        height: 1,
        loadedSrc: loadedSrc.audioEl,
        type: "audio",
        url: _url || "",
      };
      editorEventBus.emit(EditorEvents.addElement, item);
    } catch (e) {
      return;
    }
  };
  const addVideoElement = async (_url: string) => {
    try {
      let loadedSrc;
      const _id = uuid();
      if (_url.length === 0) {
        loadedSrc = await loadLocalVideoProssse(_id);
      } else {
        loadedSrc = await loadVideoProssse(_url, _id);
      }
      const item = {
        id: _id,
        x: 0,
        y: 0,
        w: loadedSrc.duration * 1000,
        width: loadedSrc.width,
        height: loadedSrc.height,
        loadedSrc: loadedSrc.videoEl,
        type: "video",
        url: _url || "",
      };
      editorEventBus.emit(EditorEvents.addElement, item);

      // window.timelineAddElement_function(item);
      // window.monitorAddElement_function(item);
      //
      // window.timelineRedraw_function();
    } catch (e) {
      return;
    }
  };

  useEffect(() => {
    async function init(): Promise<void> {
      await loadFFmpeg();

      // const { outputFiles, exitCode} = await execute({
      //   // inputFiles: [await buildInputFile('https://www.google.com/images/branding/googlelogo/2x/googlelogo_light_color_272x92dp.png', 'image1.png')],
      //   inputFiles: [await buildInputFile('https://mathiasbynens.be/demo/animated-webp-supported.webp', 'sample.webp')],
      //   commands: [
      //     'convert -delay 10 sample.webp -loop 0 -layers optimize animation.gif'
      //     // heads up: the next command uses 'image2.gif' which was the output of previous command:
      //   ],
      // })
      // console.log(exitCode,'exitCode')
      // console.log(outputFiles,'outputFiles')
      // // if(exitCode !== 0){
      //   console.log(exitCode,'exitCode')
      //   console.log(outputFiles,'outputFiles')
      //   await loadImageElement(outputFiles[0], document.getElementById('outputImage') as HTMLImageElement)
      // }

      // const { outputFiles, exitCode} = await execute({
      //   inputFiles: [await buildInputFile('https://mathiasbynens.be/demo/animated-webp-supported.webp', 'image1.webp')],
      //   commands: [
      //     'convert -coalesce image1.webp out%05d.png',
      //      'convert -delay 10 sample.webp -loop 0 -layers optimize animation.gif'
      //     // convert -coalesce brocoli.gif out%05d.pgm
      //     // heads up: the next command uses 'image2.gif' which was the output of previous command:
      //     // 'convert image2.gif -scale 23% image3.jpg',
      //   ],
      // })
      //
      // await loadImageElement(outputFiles[0], document.getElementById('outputImage') as HTMLImageElement)

      // editorEventBus.on(
      //   'EditorExportJson',
      //   (item:any)=>{
      //     console.log('EditorExportJson! event.on',item)
      //   }
      // )

      editorEventBus.on(EditorEvents.delElementCallback, (_id: string) => {
        console.log("delElementCallback! event.on", _id);
      });
      editorEventBus.on(EditorEvents.itemSelected, (bool) => {
        console.log("itemSelected! event.on", bool);
        setItemSelected(bool);
      });
      editorEventBus.on(EditorEvents.editorUndoRedoable, (bool) => {
        console.log("itemSelected! event.on", bool);
        setUndoable(bool[0]);
        setRedoable(bool[1]);
      });
      editorEventBus.on(EditorEvents.cutable, (bool) => {
        console.log("cutable! event.on", bool);
        setCutable(bool);
      });
      editorEventBus.on(EditorEvents.exportElementAttribution, (item: any) => {
        console.log("exportElementAttribution! event.on", item);
        if (item.type == "textbox") setFontSize(item.initconfig!.fontSize!);
      });
    }
    init();
  }, []);
  return (
    <div className="App">
      {/*
        <img id="outputImage"></img>
        <video ref={videoRef} controls></video>
        <br />
        <button onClick={transcode}>Transcode avi to mp4</button>
        <p ref={messageRef}></p>

        <img id="outputImage"></img>
        <video ref={videoRef} controls></video>
        <br />
        <button onClick={transcode}>Transcode avi to mp4</button>
        <p ref={messageRef}></p>

        <ColorPickermemo/>

        */}
      <input
        type="text"
        id="gifInput"
        onChange={(e) => {
          setGifUrl(e.target.value);
        }}
      />
      <button
        onClick={() => {
          addGifElement(gifUrl);
        }}
      >
        {EditorEvents.addElement}url-gif
      </button>
      <input
        type="text"
        id="imageInput"
        onChange={(e) => {
          setImageUrl(e.target.value);
        }}
      />
      <button
        onClick={() => {
          addImageElement(imageUrl);
        }}
      >
        {EditorEvents.addElement}url-image
      </button>
      <br />
      <input
        type="text"
        onChange={(e) => {
          setVideoUrl(e.target.value);
        }}
      />{" "}
      <button
        onClick={() => {
          addVideoElement(videoUrl);
        }}
      >
        {EditorEvents.addElement}url-video
      </button>
      <br />
      <input
        type="text"
        onChange={(e) => {
          setMusicUrl(e.target.value);
        }}
      />
      <button
        onClick={() => {
          addAuidoElement(musicUrl);
        }}
      >
        {EditorEvents.addElement} url-Audio
      </button>
      <br />
      <div>
        <button
          onClick={() => {
            editorEventBus.emit(EditorEvents.editorZoominout, true);
          }}
        >
          {EditorEvents.editorZoominout} +
        </button>
        <button
          onClick={() => {
            editorEventBus.emit(EditorEvents.editorZoominout, false);
          }}
        >
          {EditorEvents.editorZoominout} -
        </button>
        <button
          onClick={() => {
            editorEventBus.emit(EditorEvents.editorLoading, true);
          }}
        >
          {EditorEvents.editorLoading}
        </button>
        <button
          onClick={() => {
            editorEventBus.emit(EditorEvents.editorLoading, false);
          }}
        >
          !{EditorEvents.editorLoading}
        </button>
        <button
          onClick={() => {
            editorEventBus.emit(EditorEvents.switchRatio, "9:16", true);
          }}
        >
          {EditorEvents.switchRatio}9:16
        </button>
        <button
          onClick={() => {
            editorEventBus.emit(EditorEvents.switchRatio, "16:9", true);
          }}
        >
          {EditorEvents.switchRatio}16:9
        </button>
        <button
          onClick={() => {
            editorEventBus.emit(EditorEvents.switchRatio, "1:1");
          }}
        >
          {EditorEvents.switchRatio}1:1
        </button>

        <button
          onClick={() => {
            editorEventBus.emit(EditorEvents.initElement, newSample1);
          }}
        >
          {EditorEvents.initElement}
        </button>
        <button
          onClick={() => {
            addImageElement("");
          }}
        >
          {EditorEvents.addElement}Local-image
        </button>
        <button
          onClick={() => {
            addVideoElement("");
          }}
        >
          {EditorEvents.addElement}local-video
        </button>
        <button
          onClick={() => {
            addAuidoElement("");
          }}
        >
          {EditorEvents.addElement}local-Audio
        </button>
        <button
          onClick={() => {
            addTextElement();
          }}
        >
          {EditorEvents.addElement}Text
        </button>

        <button
          disabled={!itemSelected}
          onClick={() => {
            editorEventBus.emit(EditorEvents.delElement, { id: "id????" });
          }}
        >
          {EditorEvents.delElement}
        </button>
        <button
          disabled={!undoable}
          onClick={() => {
            editorEventBus.emit(EditorEvents.editorUndo);
          }}
        >
          {EditorEvents.editorUndo}
        </button>
        <button
          disabled={!redoable}
          onClick={() => {
            editorEventBus.emit(EditorEvents.editorRedo);
          }}
        >
          {EditorEvents.editorRedo}
        </button>
        <button
          onClick={() => {
            editorEventBus.emit(EditorEvents.editorLoading, true);
          }}
        >
          {EditorEvents.editorLoading} true
        </button>
        <button
          onClick={() => {
            editorEventBus.emit(EditorEvents.setBgColor, "white");
          }}
        >
          {EditorEvents.setBgColor} white
        </button>
        <button
          onClick={() => {
            editorEventBus.emit(
              EditorEvents.setBgUrl,
              "https://d11fbe263bhqij.cloudfront.net/agicontent/avatar/elements/emoji/emoji_love.png",
            );
          }}
        >
          {EditorEvents.setBgColor} url
        </button>
        <button
          onClick={() => {
            editorEventBus.emit(EditorEvents.alignElement, "top");
          }}
        >
          {EditorEvents.alignElement} top
        </button>
        <button
          onClick={() => {
            editorEventBus.emit(EditorEvents.alignElement, "bottom");
          }}
        >
          {EditorEvents.alignElement} bottom
        </button>
        <button
          onClick={() => {
            editorEventBus.emit(EditorEvents.alignElement);
          }}
        >
          {EditorEvents.alignElement} hcenter
        </button>
      </div>
      <Monitormemo eventBus={editorEventBus} />
      <div>
        <button
          onClick={() => {
            editorEventBus.emit(EditorEvents.editorPlay);
          }}
        >
          {EditorEvents.editorPlay}
        </button>
        <button
          onClick={() => {
            editorEventBus.emit(EditorEvents.editorPause);
          }}
        >
          {EditorEvents.editorPause}
        </button>
        <button
          disabled={!cutable}
          onClick={() => {
            editorEventBus.emit(EditorEvents.editorCut);
          }}
        >
          {EditorEvents.editorCut}
        </button>
        <select
          value={selectFont}
          onChange={async (e) => {
            setSelectFont(e.target.value);
            console.log(e.target.value);
            const re = new RegExp("/([^/]+)$");
            let family = e.target.value.match(re)![1];
            family = family!.substring(0, family!.length - 4);
            const l = await loadTextProssse(family, e.target.value);

            setFontFamily(family);
          }}
        >
          {SAMPLE_FONTS.map((item) => {
            return (
              <option value={item.url.regular} key={item.family}>
                {item.family}
              </option>
            );
          })}
        </select>
        <button
          onClick={() => {
            editorEventBus.emit(EditorEvents.updateElement, {
              initconfig: {
                fontFamily: fontFamily,
              },
            });
          }}
        >
          {EditorEvents.updateElement} - FontFamily (you need to select a
          textBox)
        </button>

        <button
          onClick={() => {
            setFontSize((fontSize) => fontSize - 1);
            editorEventBus.emit(EditorEvents.updateElement, {
              initconfig: {
                fontSize: fontSize,
              },
            });
          }}
        >
          FontSize:{fontSize}-1
        </button>

        <button
          onClick={() => {
            setFontSize((fontSize) => fontSize + 1);
            editorEventBus.emit(EditorEvents.updateElement, {
              initconfig: {
                fontSize: fontSize,
              },
            });
          }}
        >
          FontSize:{fontSize}+1
        </button>
        <button
          onClick={() => {
            editorEventBus.emit(EditorEvents.updateElement, {
              initconfig: {
                bold: true,
              },
            });
          }}
        >
          加粗
        </button>
        <button
          onClick={() => {
            editorEventBus.emit(EditorEvents.updateElement, {
              initconfig: {
                italic: true,
              },
            });
          }}
        >
          斜体
        </button>
        <button
          onClick={() => {
            editorEventBus.emit(EditorEvents.updateElement, {
              initconfig: {
                underline: true,
              },
            });
          }}
        >
          下划线
        </button>
        <button
          onClick={() => {
            editorEventBus.emit(EditorEvents.updateElement, {
              initconfig: {
                bold: "",
              },
            });
          }}
        >
          !加粗
        </button>
        <button
          onClick={() => {
            editorEventBus.emit(EditorEvents.updateElement, {
              initconfig: {
                textAlign: "left",
              },
            });
          }}
        >
          左对齐
        </button>
        <button
          onClick={() => {
            editorEventBus.emit(EditorEvents.updateElement, {
              initconfig: {
                textAlign: "center",
              },
            });
          }}
        >
          居中对齐
        </button>
        <button
          onClick={() => {
            editorEventBus.emit(EditorEvents.updateElement, {
              initconfig: {
                textAlign: "right",
              },
            });
          }}
        >
          右对齐
        </button>

        <button
          onClick={() => {
            window.timelineXScale = Math.max(scale - 1, 1);
            setScale((scale) => Math.max(scale - 1, 1));
            // handleRedraw()
            // window.timelineRedraw_function();
            editorEventBus.emit(EditorEvents.redrawTimeline);
          }}
        >
          scale:{scale}-1
        </button>
        <button
          onClick={() => {
            window.timelineXScale = Math.min(scale + 1, 30);
            setScale((scale) => Math.min(scale + 1, 30));
            // handleRedraw()
            editorEventBus.emit(EditorEvents.redrawTimeline);
          }}
        >
          scale:{scale}+1
        </button>
        <button
          onClick={() => {
            editorEventBus.emit(EditorEvents.exportProjJson);
          }}
        >
          EditorEvents.exportProjJson && download jsonfile
        </button>
        <button
          onClick={() => {
            editorEventBus.emit(EditorEvents.fullScreen, true);
          }}
        >
          full screen
        </button>
      </div>
      <Timelinememo eventBus={editorEventBus} />
    </div>
  );
}

export default App;
