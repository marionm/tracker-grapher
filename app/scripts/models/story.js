'use strict';

const _ = require('lodash');
const Pivotal = require('./pivotal');

const Story = function(response) {
  this.id = response.id;
  this.name = response.name;
  this.description = response.description;
  this.estimate = response.estimate
  this.state = response.current_state;
  this.url = response.url;

  this.labels = response.labels.map((label) => {
    return _.pick(label, 'id', 'name')
  });
};

module.exports = Story;
