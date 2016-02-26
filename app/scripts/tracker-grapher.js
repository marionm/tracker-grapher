'use strict';

const Popup = require('./pages/popup');
const React = require('react');
const ReactDOM = require('react-dom');

const target = document.body.children[0];
ReactDOM.render(<Popup/>, target);
