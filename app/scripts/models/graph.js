'use strict';

const _ = require('lodash');
const jointjs = require('jointjs');

const Graph = function(stories) {
  this.stories = stories;
};

Graph.prototype.loadAllStories = function() {
  // TODO
};

Graph.prototype.render = function(renderOptions) {
  // Inspired by http://jointjs.com/js/docs/directedGraphClusters.js
  const elements = {};
  const links = [];

  _.each(this.stories, (story) => {
    const storyElement = story.getGraphElement();
    elements[story.id] = storyElement;

    _.each(story.dependantIds, (id) => {
      const dependant = Story.find(id);

      if (dependant) {
        const dependantElement = dependant.getGraphElement();
        elements[id] = dependantElement;

        links.push(new jointjs.dia.Link({
          source: {
            id: storyElement.id
          },
          target: {
            id: dependantElement.id
          }
        }));
      }
    });
  });

  const graph = new jointjs.dia.Graph();
  graph.addCells(_.values(elements).concat(links));

  jointjs.layout.DirectedGraph.layout(graph, {
    setLinkVertices: false,
    rankDir: 'TB',
    marginX: 50,
    marginY: 50,
    clusterPadding: {
      top: 30,
      right: 10,
      bottom: 10,
      left: 10
    }
  });

  this.paper = new jointjs.dia.Paper(_.merge({
    width: 600,
    height: 400,
    gridSize: 1,
    model: graph
  }, renderOptions));
};

module.exports = Graph;
