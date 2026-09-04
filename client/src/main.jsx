import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import Login from './components/Login/Login.jsx';
import Signup from './components/Signup/Signup.jsx';
import {BrowserRouter, Routes, Route, Navigate} from "react-router-dom";

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
    <Routes>
      <Route path="/" element={<Navigate to="/expenses"/>}/>
      <Route path="/login" element={<Login/>}/>
      <Route path="/signup" element={<Signup/>}/>
      <Route path="/expenses" element={<App/>}/>
    </Routes>
    </BrowserRouter>
  </StrictMode>,
)
