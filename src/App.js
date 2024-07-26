import logo from './logo.svg';
import './App.css';
import {useState,memo} from 'react';
import {Timelinememo} from './components/timeline';

function App() {
  const [count,setCount]=useState(0)
  return (
    <div className="App">
      <button
        onClick={()=>{
          setCount(count + 1)
        }}
      >{count}+1</button>
      <Timelinememo/>
    </div>
  );
}

export default App;
