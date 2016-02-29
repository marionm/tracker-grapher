'use strict';

const Pivotal = require('./pivotal');
const Story = require('./story');

const Project = function(options) {
  options = options || {};
  this.id = options.id;
  this.name = options.name;
};

Project.loadAll = function() {
  if (Project.all) {
    return Promise.resolve(Project.all);
  }

  return Pivotal.get('projects').then((response) => {
    Project.all = response.data.map((data) => new Project(data));
    return Project.all;
  });
};

Project.prototype.search = function(query) {
  return Pivotal.get(`projects/${this.id}/search`, {
    params: {
      fields: `stories(stories(${Story.FIELDS.join(',')}))`,
      query
    }
  }).then((response) => {
    return Story.parseResponse(this, response.data.stories.stories);
    // TODO: Keep loading dependencies/dependants of the results
  });
};

module.exports = Project;
