import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './mobile.css'
import './animations.css'
import './theme.css'
import { ThemeProvider } from './lib/theme.js'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </React.StrictMode>
)
