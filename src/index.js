import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import './styles/_global.scss';
import App from './App';
import Modal from 'react-modal';
import './i18n';

import { HelperColorFunctions } from "./algorithm/HelperColorFunctions";

const helperColorFunctionsInstance = new HelperColorFunctions();

Modal.setAppElement('#root');



const root = ReactDOM.createRoot(document.getElementById('root'));
document.body.style.backgroundColor = helperColorFunctionsInstance.uiSkinProperty('Background');
root.render(
      <React.Suspense fallback="loading">
            <App />
      </React.Suspense>
);
