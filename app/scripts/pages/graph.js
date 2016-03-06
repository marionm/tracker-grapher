'use strict';

const React = require('react');

const Graph = require('../models/graph');

const GraphElement = React.createClass({
  getInitialState() {
    return {
    }
  },

  componentDidMount() {
    const stories = chrome.extension.getBackgroundPage().stories;
    const graph = new Graph(stories);

    graph.render({
      // TODO: Use react-jointjs
      el: document.getElementById('graph-paper')
    });
  },

  render() {
    return (
      <div id="graph-paper"></div>
    );
  }
});

module.exports = GraphElement;
