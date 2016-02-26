'use strict';

const _ = require('lodash');
const Project = require('../models/project');
const React = require('react');

const ProjectSelector = React.createClass({
  getDefaultProps() {
    return {
      onChange() {}
    };
  },

  getInitialState() {
    return {
      projects: [],
      selectedProject: null
    };
  },

  componentDidMount() {
    Project.loadAll().then((projects) => {
      chrome.storage.local.get(['projectId', 'projectName'], (values) => {
        const selectedProject = _.find(projects, {
          id: values.projectId
        }) || projects[0];

        this.setState({ projects, selectedProject });
        this.props.onChange(selectedProject);
      });
    });
  },

  onChange(event) {
    const projectId = event.target.value;
    chrome.storage.local.set({ projectId });
    this.props.onChange(_.find(this.state.projects, { id: projectId }));
  },

  render() {
    return (
      <div>
        <span>Pivotal project</span>
        <select
          className="project-selector"
          defaultValue={this.state.selectedProject}
          onChange={this.onChange}
        >
          {this.state.projects.map((project) => {
            return (
              <option
                key={project.id}
                value={project.id}
              >
                {project.name}
              </option>
            );
          })}
        </select>
      </div>
    );
  }
});

module.exports = ProjectSelector;
