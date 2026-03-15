import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Import Google Fonts
const link = document.createElement('link');
link.href = 'https://fonts.googleapis.com/css2?family=Baloo+2:wght@400;500;600;700;800&family=Nunito:wght@400;500;600;700;800;900&display=swap';
link.rel = 'stylesheet';
document.head.appendChild(link);

// Global styles
const globalStyles = document.createElement('style');
globalStyles.textContent = `
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  html, body {
    font-family: 'Nunito', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    background: #0f172a;
    color: #fff;
    overflow-x: hidden;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  body {
    min-height: 100vh;
  }

  #root {
    min-height: 100vh;
  }

  /* Scrollbar styling */
  ::-webkit-scrollbar {
    width: 8px;
  }

  ::-webkit-scrollbar-track {
    background: #0f172a;
  }

  ::-webkit-scrollbar-thumb {
    background: rgba(102, 126, 234, 0.3);
    border-radius: 4px;
  }

  ::-webkit-scrollbar-thumb:hover {
    background: rgba(102, 126, 234, 0.5);
  }

  /* Selection color */
  ::selection {
    background: rgba(102, 126, 234, 0.4);
    color: #fff;
  }

  /* Remove blue highlight on mobile tap */
  * {
    -webkit-tap-highlight-color: transparent;
  }

  /* Smooth scrolling */
  html {
    scroll-behavior: smooth;
  }

  /* Input placeholder */
  input::placeholder {
    color: rgba(255, 255, 255, 0.3);
  }

  /* Button reset */
  button {
    font-family: 'Nunito', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  }

  /* Disable text selection on buttons */
  button {
    user-select: none;
    -webkit-user-select: none;
  }

  /* Animation classes used across components */
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  @keyframes fadeInUp {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }

  @keyframes fadeInDown {
    from { opacity: 0; transform: translateY(-20px); }
    to { opacity: 1; transform: translateY(0); }
  }

  @keyframes slideInLeft {
    from { opacity: 0; transform: translateX(-30px); }
    to { opacity: 1; transform: translateX(0); }
  }

  @keyframes slideInRight {
    from { opacity: 0; transform: translateX(30px); }
    to { opacity: 1; transform: translateX(0); }
  }

  @keyframes bounce {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-10px); }
  }

  @keyframes pulse {
    0%, 100% { transform: scale(1); opacity: 1; }
    50% { transform: scale(1.05); opacity: 0.8; }
  }

  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    15% { transform: translateX(-8px); }
    30% { transform: translateX(8px); }
    45% { transform: translateX(-6px); }
    60% { transform: translateX(6px); }
    75% { transform: translateX(-3px); }
    90% { transform: translateX(3px); }
  }

  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }

  @keyframes float {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-15px); }
  }

  @keyframes glow {
    0%, 100% { box-shadow: 0 0 5px rgba(102, 126, 234, 0.3); }
    50% { box-shadow: 0 0 20px rgba(102, 126, 234, 0.6); }
  }

  /* Responsive font sizes */
  @media (max-width: 480px) {
    html {
      font-size: 14px;
    }
  }

  @media (min-width: 481px) and (max-width: 768px) {
    html {
      font-size: 15px;
    }
  }

  @media (min-width: 769px) {
    html {
      font-size: 16px;
    }
  }
`;
document.head.appendChild(globalStyles);

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);