'use strict';

const React = require('react');
const ProjectSelector = require('./project-selector');

const SearchInput = React.createClass({
  getDefaultProps() {
    return {
      onSearch() {}
    }
  },

  getInitialState() {
    return {
      query: null,
      project: null
    };
  },

  onQueryChange(event) {
    this.setState({ query: event.target.value });
  },

  onProjectChange(project) {
    this.setState({ project });
  },

  search() {
    if (this.state.project && this.state.query) {
      this.props.onSearch(this.state.project, this.state.query);
    }
  },

  render() {
    return (
      <div className="search-input">
        <span>Search</span>
        <input type="text" onChange={this.onQueryChange}/>
        <ProjectSelector onChange={this.onProjectChange}/>
        <button onClick={this.search}>Graph</button>
      </div>
    );
  }
});

module.exports = SearchInput;
