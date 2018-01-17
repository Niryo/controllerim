import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import {App} from './App/App';
import {DevTools} from './DevTools/DevTools';
import registerServiceWorker from './registerServiceWorker';

ReactDOM.render(<DevTools><App /></DevTools>, document.getElementById('root'));
registerServiceWorker();
