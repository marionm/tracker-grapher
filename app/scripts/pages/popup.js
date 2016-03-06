'use strict';

const ApiKeyInput = require('../components/api-key-input');
const Pivotal = require('../models/pivotal');
const React = require('react');
const SearchInput = require('../components/search-input');

const Popup = React.createClass({
  getInitialState() {
    return {
      apiKey: null,
      loading: true
    }
  },

  componentDidMount() {
    // FIXME: Ugh - why doesn't get().then(validate).then(ok).catch(fail) work?
    Pivotal.getApiKey().then((apiKey) => {
      if (apiKey) {
        Pivotal.validateApiKey(apiKey).then(() => {
          this.setState({ apiKey, loading: false });
        }).catch(() => {
          this.setState({ loading: false });
        });
      } else {
        this.setState({ loading: false });
      }
    }).catch(() => {
      this.setState({ loading: false });
    });
  },

  onApiKeySet(apiKey) {
    this.setState({ apiKey });
  },

  onSearch(project, query) {
    const page = chrome.extension.getBackgroundPage();
    page.projectId = project.id;
    page.query = query;

    chrome.tabs.create({
      url: chrome.extension.getURL('views/graph.html'),
      selected: true
    });
  },

  render() {
    if (this.state.loading) {
      return (<div>Loading...</div>);
    } else if (this.state.apiKey) {
      return (<SearchInput onSearch={this.onSearch}/>);
    } else {
      return (<ApiKeyInput onChange={this.onApiKeySet}/>);
    }
  }
});

module.exports = Popup;
