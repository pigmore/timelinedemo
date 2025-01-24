import React, {
  useState,
  useEffect,
  memo,
  forwardRef,
  useImperativeHandle,
  Ref,
} from "react";
import { randomInt } from "./util";
// import { TimelineGraph } from './timelineGraph';

interface CallChildProps {
  // Define any props if needed
}

interface CallChildRef {
  callmycount: () => void;
}

export const CallChild = forwardRef<CallChildRef, CallChildProps>(
  (props, ref) => {
    let mycount: number = 1;
    const [count, setCount] = useState<number>(0);

    useEffect(() => {
      async function init() {
        console.log("mycount", mycount);
        mycount = 100;
      }
      init();
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
  },
);

export const CallChildMemo = memo(CallChild);
