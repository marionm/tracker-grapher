'use strict';

const Graph = require('../models/graph');
const React = require('react');

const GraphElement = React.createClass({
  render() {
    return (
      <div id="graph-canvas"></div>
    );
  }
});

module.exports = GraphElement;
