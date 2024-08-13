import {
  useState,
  useEffect,
  memo,
  forwardRef,
  useImperativeHandle,
} from "react";
import { randomInt } from "./util";
import { timelineGraph } from "./timelineGraph";

export const CallChild = forwardRef((props, ref) => {
  let mycount = 1;
  const [count, setCount] = useState(0);
  useEffect(() => {
    async function init() {
      if (typeof window !== "undefined" || window.initReady !== true) {
        // initCanvas();
        console.log("mycount", mycount);
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

  return (
    <div>
      <button
        onClick={() => {
          console.log(mycount);
        }}
      >
        {count}
        {mycount}
      </button>
    </div>
  );
});
// export default Timeline;

export const CallChildMemo = memo(CallChild);
