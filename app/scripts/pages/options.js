'use strict';

const ApiKeyInput = require('../components/api-key-input');
const Pivotal = require('../models/pivotal');
const ProjectSelector = require('../components/project-selector');
const React = require('react');

const Options = React.createClass({
  render() {
    return (
      <div>
        <h1>Tracker Grapher options</h1>
        <ApiKeyInput/>
        <ProjectSelector/>
      </div>
    );
  }
});

module.exports = Options;
