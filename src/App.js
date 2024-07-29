import logo from './logo.svg';
import './App.css';
import React,{useState,memo} from 'react';
import {Timelinememo} from './components/timeline';

function App() {
  const [count,setCount]=useState(0)
  const [redraw,setRedraw]=useState(0)
  const [scale,setScale]=useState(10)
  const handleRedraw = ()=>{
    setRedraw(redraw => redraw + 1)
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

      <Timelinememo
        redrawTrigger = {redraw}
      />
    </div>
  );
}

export default App;
