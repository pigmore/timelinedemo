import { useState, useEffect, memo,forwardRef,useImperativeHandle } from "react";
import { randomInt } from './util';
import { sample } from './sample';
import { dragGraph } from './dragGraph';

export const Test = forwardRef((props,ref)=> {
  let mycount = 1
  const [count,setCount] = useState(0)
  const [jsonInit,setJsonInit] = useState('输入新的json')
  const [jsonupdate,setJsonupdate] = useState('json位移结果')
  const [inputJson,setinputJson] = useState(sample)
  useEffect(() => {
    async function init() {
      if (typeof window !== "undefined" || window.initReady !== true) {
        // initCanvas();
        console.log('mycount',mycount)

        window.canvasEventDriver.register('update',(_prop)=>{
          setJsonupdate(_prop)
        })
        // window.canvasCallBack = (p)=>{
        //   setJsonupdate(p)
        // }
        // ...在 elem 上 dispatch！

        mycount = 100
      }
    }
    init();
    window.initReady = true;
  }, []);
  useImperativeHandle(ref, () => ({

    callmycount() {
        mycount += 1
        console.log(mycount)
    }

  }));

  const handleInitJson = ()=>{
    var json = []
    console.log(inputJson)
    // new dragGraph(
    //   randomInt(0, 1200), //x
    //   randomInt(0, 280), //y
    //   randomInt(10, 40), //w
    //   20,  //h
    //   `rgba(${randomInt(0, 255)}, ${randomInt(0, 255)}, ${randomInt(0, 255)} , 1) `,
    //   canvas,
    //   'rectangle'
    // );
    for (var item of inputJson.data) {
      for (var variable in item) {
        if (item.hasOwnProperty(variable)) {
          if (variable == 'bg_musics'){
            const bg_musics_item = item[variable][0]
            json.push({
              x:bg_musics_item.start_time,
              w:bg_musics_item.end_time - bg_musics_item.start_time,
              y:0
            })
          }
          if (variable == 'elements'){
            for (var elementsItem of item[variable]) {
              json.push({
                x:elementsItem.start_time,
                w:elementsItem.end_time - elementsItem.start_time,
                y:elementsItem.layer_number
              }

              )
            }

          }
          // if (variable == 'objects'){
          //   for (var objectsItem of item[variable]) {
          //     json.push(
          //       {
          //         x:objectsItem.start_time,
          //         w:objectsItem.end_time - objectsItem.start_time,
          //         y:objectsItem.layer_number
          //       }
          //     )
          //   }
          // }
        }
      }
    }
    setJsonInit(JSON.stringify(json))

    window.initJsonForCanvas(json)
  }


  return (
    <div>
      <input type="text" placeholder="input the json data here" value={inputJson}
        onChange={
          (e)=>{
            setinputJson(JSON.parse(e.target.value))
          }
        }
      />
      <button onClick={
        ()=>{
          handleInitJson()
        }
      }>initJson</button>
      <p>{jsonInit}</p>
      <p>{JSON.stringify(jsonupdate)}</p>
    </div>
  );
})
// export default Timeline;

export const Testmemo = memo(Test);
