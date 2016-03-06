'use strict';

const _ = require('lodash');
const joint = require('jointjs');

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

  this.dependentIds = [];
  this.dependencyIds = [];

  const regex = /^(Dependencies|Dependents): ((#\d+ ?)+)/;
  _.each(response.tasks, (task) => {
    const matches = regex.exec(task.description)
    if (matches) {
      const ids = matches[2].split(' ').map((id) => {
        return parseInt(id.replace('#', ''), 10);
      });

      if (matches[1] === 'Dependencies') {
        this.dependencyIds = ids;
        this.dependenciesTaskId = task.id;
      } else {
        this.dependentIds = ids;
        this.dependentsTaskId = task.id;
      }
    }
  });
};

Story.prototype.addDependency = function(story) {
  if (!this.dependencyIds.includes(story.id)) {
    this.dependencyIds.push(story.id);
    this.modified = true;

    story.addDependent(this);
  }
};

Story.prototype.addDependent = function(story) {
  if (!this.dependentIds.includes(story.id)) {
    this.dependentIds.push(story.id);
    this.modified = true;

    story.addDependency(this);
  }
};

Story.prototype.removeDependency = function(story) {
  const index = this.dependencyIds.indexOf(story.id);
  if (index >= 0) {
    this.dependencyIds.splice(index, 1);
    this.modified = true;

    story.removeDependent(this);
  }
};

Story.prototype.removeDependent = function(story) {
  const index = this.dependentIds.indexOf(story.id);
  if (index >= 0) {
    this.dependentIds.splice(index, 1);
    this.modified = true;

    story.removeDependency(this);
  }
};



const getTasksPath = function(story, taskId) {
  let path = `projects/${story.project.id}/stories/${story.id}/tasks/`;

  if (taskId) {
    path += taskId;
  }

  return path;
};

const saveTask = function(story, taskIdKey, idsKey, taskPrefix) {
  const ids = story[idsKey];
  const taskId = story[taskIdKey];
  const path = getTasksPath(story, taskId);

  if (ids.length) {
    const method = taskId ? 'put' : 'post';
    const value = ids.map((id) => `#${id}`).join(' ');
    return Pivotal[method](path, {
      description: `${taskPrefix}: ${value}`
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
      saveTask(this, 'dependentsTaskId', 'dependentIds', 'Dependents'),
      saveTask(this, 'dependenciesTaskId', 'dependencyIds', 'Dependencies')
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



module.exports = Story;
