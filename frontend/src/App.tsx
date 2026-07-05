import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './App.css'
import Home from './pages/Home';
import Vault from './pages/Vault';
import Evaluator from './pages/Evaluator';
import Generator from './pages/Generator';
import Login from './pages/Login';
import Register from './pages/Registration';
import AuthLayout from './components/AuthLayout';
import NavbarLayout from './components/NavBarLayout';
import About from './pages/About';
import Profile from './pages/Profile';
import Mfa from './pages/Mfa';
import Verification from './pages/Verification';

function App() {
  return (
    <Router>
      <Routes>
        <Route element={<AuthLayout />}>
          <Route path='/' element={<Login />} />
          <Route path='/register' element={<Register />} />
          <Route path='/verification' element={<Verification />} />
          <Route path='/mfa' element={<Mfa />} />
        </Route>
        <Route element={<NavbarLayout />}>
          <Route path="/home" element={<Home />} />
          <Route path="/vault" element={<Vault />} />
          <Route path="/evaluator" element={<Evaluator />} />
          <Route path="/generator" element={<Generator />} />
          <Route path="/about" element={<About />} />
          <Route path="/profile" element={<Profile />} />
        </Route>
      </Routes>
    </Router>
  )
}

export default App
