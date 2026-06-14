import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import GlobalErrorBoundary from './components/GlobalErrorBoundary';
import GlobalUI from './components/GlobalUI';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <GlobalErrorBoundary>
    <GlobalUI>
      <App />
    </GlobalUI>
  </GlobalErrorBoundary>
);
