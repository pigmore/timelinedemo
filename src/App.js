import logo from './logo.svg';
import './App.css';
import React,{useState,memo,useRef} from 'react';
import {Timelinememo} from './components/timeline';
import {CallChild,CallChildMemo} from './components/callChild';

function App() {
  const [count,setCount]=useState(0)
  const [redraw,setRedraw]=useState(0)
  const [scale,setScale]=useState(10)
  const myRef = useRef()
  const handleRedraw = ()=>{
    setRedraw(redraw => redraw + 1)
  }
  const handlemyRefCount = () =>{
    myRef.current.callmycount()
  }
  return (
    <div className="App">
      <button
        onClick={()=>{
          setCount(count => count + 1)
        }}
      >{count}+1</button>
      <button
        onClick={()=>{
          window.xScale = Math.max(scale - 1,1)
          setScale(scale =>Math.max(scale - 1,1))
          // handleRedraw()
          window.redraw_function()
        }}
      >scale:{scale}-1</button>
      <button
        onClick={()=>{
          window.xScale = Math.min(scale + 1,20)
          setScale(scale =>Math.min(scale + 1,20))
          // handleRedraw()
          window.redraw_function()
        }}
      >scale:{scale}+1</button>
      <button
        onClick={()=>{
          handlemyRefCount()
        }}
      >handlemyRefCount</button>

      <Timelinememo
        redrawTrigger = {redraw}
      />
      <CallChildMemo ref={myRef} />
    </div>
  );
}

export default App;
