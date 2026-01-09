
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// 生产环境兼容性垫片
// 确保在浏览器环境下引用 process.env 不会抛出 ReferenceError
if (typeof (window as any).process === 'undefined') {
  (window as any).process = {
    env: {
      API_KEY: '' 
    }
  };
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Critical Error: Could not find root element. Please check index.html.");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
