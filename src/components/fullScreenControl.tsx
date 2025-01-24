import { FC, useState, useEffect, memo, createRef, RefObject } from "react";
import { secondTrans, msToHMS } from "./util";
import { EditorEvents, editorEventBus } from "./event-tool";

export const FullScreenControl: FC = () => {
  let controlTimesliderEl: HTMLInputElement;
  // let monitorCurrentTime:string = '00:00';
  // let fullscreenPlayBtn:boolean = false;
  const [fullscreenPlayBtn, setFullscreenPlayBtn] = useState("play");
  const [currentTime, setCurrentTime] = useState(0);
  const [currentFrame, setCurrentFrame] = useState(0);
  const [duration, setDuration] = useState(0);
  useEffect(() => {
    controlTimesliderEl = document.getElementById(
      "controlTimeslider",
    ) as HTMLInputElement;
    const tempSliderValue: number = parseInt(controlTimesliderEl.value);
    const progress: number =
      (tempSliderValue / parseInt(controlTimesliderEl.max)) * 100;
    controlTimesliderEl.style.background = `linear-gradient(to right, #7b30f5 ${progress}%, #ccc ${progress}%)`;
    editorEventBus.on(EditorEvents.fullScreen, (_prop: any) => {
      let screenDom = document.getElementById("fullScreenwrap");
      let controlDom = document.getElementById("controlsWrap");
      if (_prop) {
        screenDom!.style.position = "fixed";
        screenDom!.style.inset = "0px";
        screenDom!.style.background = "black";
        controlDom!.style.display = "block";
      } else {
        screenDom!.style.position = "inherit";
        controlDom!.style.display = "none";
      }
    });
    editorEventBus.on(EditorEvents.editorPause, () => {
      setFullscreenPlayBtn("play");
    });

    editorEventBus.on(EditorEvents.editorUpdateCurrentTime, (_t: number) => {
      setCurrentTime(_t);

      const tempSliderValue0: number = (_t / 100) * 6;
      setCurrentFrame((_t / 100) * 6);
      const progress: number =
        (tempSliderValue0 / parseInt(controlTimesliderEl.max)) * 100;
      controlTimesliderEl.style.background = `linear-gradient(to right, #7b30f5 ${progress}%, #ccc ${progress}%)`;
    });
    editorEventBus.on(
      EditorEvents.editorUpdateDuration,
      (_duration: number) => {
        setDuration(_duration);
      },
    );

    controlTimesliderEl.addEventListener("input", (event) => {
      const tempSliderValue: number = parseInt(
        (event.target as HTMLInputElement)!.value,
      );
      const progress: number =
        (tempSliderValue / parseInt(controlTimesliderEl.max)) * 100;
      controlTimesliderEl.style.background = `linear-gradient(to right, #7b30f5 ${progress}%, #ccc ${progress}%)`;
      setCurrentFrame(tempSliderValue);
    });
  }, []);

  return (
    <div id="controlsWrap">
      <button
        onClick={() => {
          if (window.akoolEditorState == "playing") {
            window.akoolEditorState = "paused";
            editorEventBus.emit(EditorEvents.editorPause);
            setFullscreenPlayBtn("play");
          } else {
            window.akoolEditorState = "playing";
            editorEventBus.emit(EditorEvents.editorPlay);
            setFullscreenPlayBtn("pause");
          }
        }}
      >
        {fullscreenPlayBtn}
      </button>
      <input
        id="controlTimeslider"
        type="range"
        min={0}
        max={(duration / 100) * 6}
        step={1}
        value={currentFrame}
        onInput={(e) => {
          const target = e.target as HTMLInputElement;
          console.log(target.value);
          window.currentTime = (parseInt(target.value) / 6) * 100;
          window.currentFrame = parseInt(target.value);
          editorEventBus.emit(
            EditorEvents.editorUpdateCurrentTime,
            window.currentTime,
          );
        }}
      />
      <span style={{ width: "210px", display: "inline-block" }}>
        {msToHMS(currentTime)} / {msToHMS(duration)}
      </span>
      <button
        onClick={() => {
          editorEventBus.emit(EditorEvents.fullScreen, false);
        }}
      >
        full screen
      </button>
    </div>
  );
};
