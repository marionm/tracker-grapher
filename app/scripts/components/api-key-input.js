'use strict';

const React = require('react');
const Pivotal = require('../models/pivotal');

const ApiKeyInput = React.createClass({
  getDefaultProps() {
    return {
      onChange() {}
    }
  },

  getInitialState() {
    return {
      apiKey: null,
      error: null
    }
  },

  componentDidMount() {
    Pivotal.getApiKey().then((apiKey) => {
      this.setState({ apiKey });
    });
  },

  onChange(event) {
    this.setState({ apiKey: event.target.value });
  },

  save() {
    Pivotal.setApiKey(this.state.apiKey).then(() => {
      this.setState({ error: null });
      this.props.onChange(this.state.apiKey);
    }).catch(() => {
      this.setState({ error: 'Invalid API key' });
    });
  },

  render() {
    return (
      <div className="api-key-input">
        <span>Pivotal API key</span>
        <input
          type="text"
          value={this.state.apiKey}
          onChange={this.onChange}
        />

        <button onClick={this.save}>Save</button>

        {(() => {
          if (this.state.error) {
            return (<span>{this.state.error}</span>);
          }
        })()}

      </div>
    );
  }
});

module.exports = ApiKeyInput;
