const octokit = require('@octokit/rest')();
const Configstore = require('configstore');
const pkg = require('../package.json');
const _ = require('lodash');
const CLI = require('clui');
const Spinner = CLI.Spinner;
const chalk = require('chalk');

const inquirer = require('./inquirer');

const conf = new Configstore(pkg.name);

let credentials = {};
let code = null;

module.exports = {

  getInstance: () => {
    return octokit;
  },

  setGithubCredentials: async () => {
    console.log('setGithubCredentials');
    credentials = await inquirer.askGithubCredentials();
    octokit.authenticate(
      _.extend(
        {
          type: 'basic',
        },
        credentials
      )
    );
  },

  getCredentials: () => {
    return credentials;
  },

  clearCredentials: () => {
    credentials = {};
  },

  getCode: () => {
    return code;
  },

  clearCode: () => {
    code = null;
  },

  githubAuth: (token) => {
    octokit.authenticate({
      type: 'oauth',
      token: token
    });
  },

  getStoredGithubToken: () => {
    console.log('getStoredGithubToken');
    return conf.get('github.token');
  },

  setGithubTwoFactorAuthenticationCode: async () => {
    code = await inquirer.askGithubTwoFactorAuthenticationCode();
  },

  registerNewToken: async () => {
    const status = new Spinner('Authenticating you, please wait...');
    status.start();

    const params = {
      scopes: ['user', 'public_repo', 'repo', 'repo:status'],
      note: 'ginit, the command-line tool for initializing Git repos'
    }

    try {
      const response = await octokit.authorization.create(params);
      const token = response.data.token;
      if (token) {
        conf.set('github.token', token);
        return token;
      } else {
        throw new Error('Missing Token', 'Github token was not found in the response');
      }

    } catch (err) {
      if (err.code === 401) {
        status.stop();

        // check if a two-factor authorization VIA TEXT MESSAGE is setup for the github account
        if (err.headers['x-github-otp'] === 'required; sms') {
          code = await inquirer.askGithubTwoFactorAuthenticationCode();
          const headers = 'headers: ' + JSON.stringify(code);
          const paramsPlusAuthCode = _.extend(
            params,
            {
              headers: code
            }
          );

          const status = new Spinner('Authenticating you, please wait...');
          status.start();

          try {
            const response = await octokit.authorization.create(paramsPlusAuthCode);
            const token = response.data.token;
            if (token) {
              conf.set('github.token', token);
              return token;
            } else {
              throw new Error('Missing Token', 'Github token was not found in the response');
            }

          } catch (err) {
            throw err;
          } finally {
            status.stop();
          }
        }
      };
      return;

    } finally {
      status.stop();
    }
  },

  hasAccessToken: async () => {
    const status = new Spinner('Authenticating you, please wait...');
    status.start();

    try {
      const response = await octokit.authorization.getAll();
      const accessToken = _.find(response.data, (row) => {
        if (row.note) {
          return row.note.indexOf('ginit') !== -1;
        }
      });
      return accessToken;
    } catch (err) {
      throw err;
    } finally {
      status.stop();
    }
  },

  regenerateNewToken: async (id) => {
    const tokenUrl = 'https://github.com/settings/tokens/' + id;
    console.log('Please visit ' + chalk.underline.blue.bold(tokenUrl) + ' and click the ' + chalk.red.bold('Regenerate Token Button.\n'));
    const input = await inquirer(askRegenerateToken());
    if (input) {
      conf.set('github.token', input.token);
      return input.token;
    }
  }

}