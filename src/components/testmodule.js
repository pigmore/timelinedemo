import {
  useState,
  useEffect,
  memo,
  forwardRef,
  useImperativeHandle,
} from "react";
import { randomInt } from "./util";
import { sample } from "./sample";
import { timelineGraph } from "./timelineGraph";

export const Test = forwardRef((props, ref) => {
  let mycount = 1;
  const [count, setCount] = useState(0);
  const [jsonInit, setJsonInit] = useState("输入新的json");
  const [jsonupdate, setJsonupdate] = useState("json位移结果");
  const [inputJson, setinputJson] = useState(sample);
  useEffect(() => {
    async function init() {
      if (typeof window !== "undefined" || window.initReady !== true) {
        // initCanvas();
        console.log("mycount", mycount);

        window.canvasEventDriver.register("update", (_prop) => {
          setJsonupdate(_prop);
        });
        // window.canvasCallBack = (p)=>{
        //   setJsonupdate(p)
        // }
        // ...在 elem 上 dispatch！

        mycount = 100;
      }
    }
    init();
    window.initReady = true;
  }, []);
  useImperativeHandle(ref, () => ({
    callmycount() {
      mycount += 1;
      console.log(mycount);
    },
  }));

  const handleInitJson = async(_data = inputJson.data) => {

    // setJsonInit(JSON.stringify(json));

    await window.initJsonForCanvas(_data);
  };

  return (
    <div>
      <button
        onClick={async() => {
          await handleInitJson();
        }}
      >
        初始化一波试试看
      </button>
      {/*<input
        type="text"
        placeholder="input the json data here"
        value={inputJson}
        onChange={(e) => {
          setinputJson(JSON.parse(e.target.value));
        }}
      />

      <p>{jsonInit}</p>*/}
      <p>{JSON.stringify(jsonupdate)}</p>
    </div>
  );
});
// export default Timeline;

export const Testmemo = memo(Test);
