import React, {
  FC,
  useState,
  useEffect,
  memo,
  forwardRef,
  useImperativeHandle,
} from "react";
import { randomInt } from "./util";
import { sample } from "./sample";
import { TimelineGraph } from "./timelineGraph";

interface TestProps {
  // Define any props if needed
}

export const Test = forwardRef((props: TestProps, ref: React.Ref<any>) => {
  let mycount: number = 1;
  const [count, setCount] = useState<number>(0);
  const [jsonInit, setJsonInit] = useState<string>("输入新的json");
  const [jsonupdate, setJsonupdate] = useState<string>("json位移结果");
  const [inputJson, setinputJson] = useState<any>(sample);

  useEffect(() => {
    async function init() {
      window.canvasEventDriver.register("update", (_prop: any) => {
        setJsonupdate(_prop);
      });
      mycount = 100;
    }
    init();
  }, []);

  useImperativeHandle(ref, () => ({
    callmycount() {
      mycount += 1;
    },
  }));

  const handleInitJson = async (_data: any = inputJson.data) => {
    await window.initJsonForCanvas(_data);
  };

  return (
    <div>
      <button
        onClick={async () => {
          await handleInitJson();
        }}
      >
        初始化一波试试看
      </button>
      <p>{JSON.stringify(jsonupdate)}</p>
    </div>
  );
});

export const Testmemo = memo(Test);
