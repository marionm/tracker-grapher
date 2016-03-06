'use strict';

const Options = require('./pages/options');
const Graph = require('./pages/graph');
const Popup = require('./pages/popup');
const React = require('react');
const ReactDOM = require('react-dom');

const target = document.body.children[0];

if (target.id === 'graph') {
  ReactDOM.render(<Graph/>, target);
} else if (target.id === 'options') {
  ReactDOM.render(<Options/>, target);
} else if (target.id === 'popup') {
  ReactDOM.render(<Popup/>, target);
}
