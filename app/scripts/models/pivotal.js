'use strict';

const axios = require('axios');
const _ = require('lodash');

axios.defaults.baseURL = 'https://www.pivotaltracker.com/services/v5/';

let apiKey;
const Pivotal = {
  getApiKey() {
    if (apiKey) {
      return Promise.resolve(apiKey);
    }

    return new Promise((resolve, reject) => {
      chrome.storage.local.get('pivotalApiKey', (values) => {
        if (!values.pivotalApiKey) {
          reject("No Pivotal API key is set");
        }

        resolve(values.pivotalApiKey);
      });
    });
  },

  setApiKey(_apiKey) {
    return this.validateApiKey(_apiKey).then(() => {
      apiKey = _apiKey;
      chrome.storage.local.set({ pivotalApiKey: apiKey });
    });
  },

  validateApiKey(apiKey) {
    return this.get('accounts', { apiKey });
  },

  makeRequest(method, path, data, options) {
    const takesData = method === 'post' || method === 'put';

    if (takesData) {
      options = options || {};
      data = data || {};
    } else {
      options = data || {};
    }

    const makeRequest = function(apiKey) {
      options.headers = options.headers || {};
      options.headers['X-TrackerToken'] = apiKey;
      if (takesData) {
        return axios[method](path, data, options);
      } else {
        return axios[method](path, options);
      }
    };

    if (options.apiKey) {
      return makeRequest(options.apiKey);
    } else {
      return this.getApiKey().then(makeRequest);
    }
  }
};

['get', 'delete', 'post', 'put'].forEach((method) => {
  Pivotal[method] = _.partial(Pivotal.makeRequest, method);
});

module.exports = Pivotal;
