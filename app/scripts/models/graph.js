'use strict';

const Project = require('./project');

const Graph = function(stories) {
  this.stories = stories;
};

Graph.getFromBackgroundState = function() {
  const page = chrome.extension.getBackgroundPage();

  if (page.projectId && page.query) {
    const project = new Project({ id: page.projectId });
    return project.search(page.query).then((stories) => {
      return new Graph(stories);
    });
  } else {
    return Promise.reject();
  }
};

Graph.prototype.loadAllStories = function() {
  // TODO
};

module.exports = Graph;
