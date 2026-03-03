import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './App.css'
import Home from './pages/Home';
import Vault from './pages/Vault';
import { Navbar } from './components/NavBar';
import Evaluator from './pages/Evaluator';
import Generator from './pages/Generator';

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path= "/" element={<Home/>}/>
        <Route path= "/vault" element={<Vault/>}/>
        <Route path= "/evaluator" element={<Evaluator/>}/>
        <Route path= "/generator" element={<Generator/>}/>
      </Routes>
    </Router>
  )
}

export default App
