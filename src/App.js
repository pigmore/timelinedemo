import logo from './logo.svg';
import './App.css';
import {useState,memo} from 'react';
import {Timelinememo} from './components/timeline';

function App() {
  const [count,setCount]=useState(0)
  const [scale,setScale]=useState(10)
  return (
    <div className="App">
      <button
        onClick={()=>{
          setCount(count => count + 1)
        }}
      >{count}+1</button>
      <button
        onClick={()=>{
          setScale(scale =>Math.min(scale + 1,20))
        }}
      >scale:{scale}+1</button>
      <button
        onClick={()=>{
          setScale(scale =>Math.max(scale - 1,1) )
        }}
      >scale:{scale}-1</button>
      <Timelinememo/>
    </div>
  );
}

export default App;
