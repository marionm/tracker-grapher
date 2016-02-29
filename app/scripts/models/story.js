'use strict';

const _ = require('lodash');
const Pivotal = require('./pivotal');

const Story = function(project, response) {
  this.id = response.id;
  this.name = response.name;
  this.description = response.description;
  this.estimate = response.estimate
  this.state = response.current_state;
  this.url = response.url;

  this.project = project;

  this.labels = response.labels.map((label) => {
    return _.pick(label, 'id', 'name')
  });

  _.each(response.tasks, (task) => {
    if (/^{ ?"tg":/.test(task.description)) {
      this.taskId = task.id;

      const metadata = JSON.parse(task.description).tg;
      this.dependencyIds = metadata.dependencyIds;
      this.dependantIds = metadata.dependantIds;

      return false;
    }
  });

  this.dependencyIds = this.dependencyIds || [];
  this.dependantIds = this.dependantIds || [];
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
  return response.map((datum) => {
    let story = stories[datum.id];
    if (!story) {
      story = new Story(project, datum);
      stories[datum.id] = story;
    }
    return story;
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

Story.prototype.removeDependency = function(story) {
  const index = this.dependantIds.indexOf(story.id);
  if (index >= 0) {
    this.dependantIds.splice(index, 1);
    this.modified = true;
  }

  story.removeDependencies(this);
};

Story.prototype.save = function() {
  if (!this.modified) {
    return Promise.resolve(this);
  }

  const metadata = {
    tg: {
      dependencyIds: this.dependencyIds,
      dependantIds: this.dependantIds
    }
  };

  let method;
  let path = `projects/${this.project.id}/stories/${this.id}/tasks/`;
  if (this.taskId) {
    method = 'put';
    path += this.taskId;
  } else {
    method = 'post';
  }

  // TODO: Reload the task first so remote changes can be merged
  // TODO: Also save related stories? Or should there be a whole graph model?
  return Pivotal[method](path, {
    description: JSON.stringify(metadata)
  }).then((response) => {
    this.taskId = response.data.id;
    this.modified = false;
    return this;
  });
};

module.exports = Story;
