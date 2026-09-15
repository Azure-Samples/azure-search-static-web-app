import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './App/App.css'
import App from './App/App.jsx'


console.log('client2');

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
