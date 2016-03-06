'use strict';

const React = require('react');
const Graph = require('../models/graph');
const GraphElement = require('../components/graph');

module.exports = React.createClass({
  getInitialState() {
    return {
      graph: null
    };
  },

  componentDidMount() {
    Graph.getFromBackgroundState().then((graph) => {
      this.setState({ graph });
    });
  },

  render() {
    return (
      <GraphElement graph={this.state.graph}/>
    );
  }
});
