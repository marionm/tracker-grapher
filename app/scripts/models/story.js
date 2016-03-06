'use strict';

const _ = require('lodash');
const jointjs = require('jointjs');
const Backbone = require('jointjs/node_modules/backbone');

const Pivotal = require('./pivotal');

const Story = function(project, response) {
  this.project = project;
  this.parseResponse(response);
};

Story.FIELDS = [
  'id',
  'url',
  'name',
  'description',
  'labels',
  'tasks',
  'estimate',
  'current_state'
];

const stories = {};

Story.parseResponse = function(project, response) {
  _.each(response, (datum) => {
    if (stories[datum.id]) {
      stories[datum.id].parseResponse(response)
    } else {
      stories[datum.id] = new Story(project, datum);
    }
  });
  return stories;
};

Story.find = function(id) {
  return stories[id];
};



Story.prototype.parseResponse = function(response) {
  this.id = response.id;
  this.name = response.name;
  this.description = response.description;
  this.estimate = response.estimate
  this.state = response.current_state;
  this.url = response.url;

  this.labels = response.labels.map((label) => {
    return _.pick(label, 'id', 'name')
  });

  this.dependantIds = [];
  this.dependencyIds = [];

  const regex = /^(Dependencies|Dependants): ((#\d+ ?)+)/;
  _.each(response.tasks, (task) => {
    const matches = regex.exec(task.description)
    if (matches) {
      const ids = matches[2].split(' ').map((id) => {
        return id.replace('#', '');
      });

      if (matches[1] === 'Dependencies') {
        this.dependencyIds = ids;
        this.dependenciesTaskId = task.id;
      } else {
        this.dependantIds = ids;
        this.dependantsTaskId = task.id;
      }
    }
  });
};

Story.prototype.addDependency = function(story) {
  if (!this.dependencyIds.includes(story.id)) {
    this.dependencyIds.push(story.id);
    story.addDependant(this);
    this.modified = true;
  }
};

Story.prototype.addDependant = function(story) {
  if (!this.dependantIds.includes(story.id)) {
    this.dependantIds.push(story.id);
    story.addDependency(this);
    this.modified = true;
  }
};

Story.prototype.removeDependency = function(story) {
  const index = this.dependencyIds.indexOf(story.id);
  if (index >= 0) {
    this.dependencyIds.splice(index, 1);
    this.modified = true;
  }

  story.removeDependant(this);
};

Story.prototype.removeDependant = function(story) {
  const index = this.dependantIds.indexOf(story.id);
  if (index >= 0) {
    this.dependantIds.splice(index, 1);
    this.modified = true;
  }

  story.removeDependencies(this);
};



const getTaskPath = function(story, taskId) {
  let path = `projects/${story.project.id}/stories/${story.id}/tasks/`;

  if (taskId) {
    path += taskId;
  }

  return path;
};

const saveTask = function(story, taskIdKey, idsKey) {
  const ids = story[idsKey];
  const taskId = story[taskIdKey];
  const path = getTasksPath(story, taskId);

  if (ids.length) {
    const method = taskId ? 'put' : 'post';
    return Pivotal[method](path, {
      description: value
    }).then((response) => {
      story[taskId] = response.data.id;
      story.modified = false;
    });

  } else {
    if (taskId) {
      return Pivotal.delete(path).then(() => {
        delete story[taskId];
      });
    } else {
      return Promise.resolve();
    }
  }
};

Story.prototype.save = function() {
  if (this.modified) {
    return Promise.all([
      saveTask(this, 'dependantsTaskId', 'dependantIds'),
      saveTask(this, 'dependenciesTaskId', 'dependencyIds')
    ]);
  } else {
    return Promise.resolve(this);
  }
};

Story.prototype.reload = function() {
  return Pivotal.get(getTasksPath(story)).then((response) => {
    this.parseResponse(response);
  });
};



Story.prototype.getGraphElement = function() {
  this._graphNode = this._graphNode || new jointjs.shapes.basic.Rect({
    size: {
      width: 30,
      height: 30
    },

    attrs: {
      rect: {
        rx: 2,
        ry: 2,
        fill: '#31D0C6',
        stroke: '#4B4A67',
        'stroke-width': 2
      },

      text: {
        text: this.description,
        fill: 'white'
      }
    }
  });

  return this._graphNode;
};



module.exports = Story;
