const CLI = require('clui');
const Configstore = require('configstore');
const { Octokit } = require('@octokit/rest');
const Spinner = CLI.Spinner;
const { createBasicAuth } = require('@octokit/auth-basic');

const inquirer = require('./inquirer');
const pkg = require('../package.json');

const conf = new Configstore(pkg.name);

let octokit;

const getInstance = () => {
  return octokit;
};

const getStoredGithubToken = () => {
  return conf.get('github.token');
};

const getPersonalAccessToken = async () => {
  const credentials = await inquirer.askGithubCredentials();
  const status = new Spinner('Authenticating you, please wait...');

  status.start();

  const auth = createBasicAuth({
    username: credentials.username,
    password: credentials.password,
    async on2Fa() {
      status.stop();
      const res = await inquirer.getTwoFactorAuthenticationCode();
      status.start();
      return res.twoFactorAuthenticationCode;
    },
    token: {
      scopes: ['user', 'public_repo', 'repo', 'repo:status'],
      note: 'ginit, the command-line tool for initializing Git repos',
    },
  });

  try {
    const res = await auth();

    if (res.token) {
      conf.set('github.token', res.token);
      return res.token;
    } else {
      throw new Error('Github token was not found in the reponse');
    }
  } finally {
    status.stop();
  }
};

const githubAuth = (token) => {
  octokit = new Octokit({
    auth: token,
  });
};

module.exports = {
  getInstance,
  getStoredGithubToken,
  getPersonalAccessToken,
  githubAuth,
};

// const _ = require('lodash');
// const CLI = require('clui');
// const chalk = require('chalk');

// let credentials = {};
// let code = null;

// module.exports = {

//   getInstance: () => {
//     return octokit;
//   },

//   setGithubCredentials: async () => {
//     credentials = await inquirer.askGithubCredentials();
//     octokit.authenticate(
//       _.extend(
//         {
//           type: 'basic',
//         },
//         credentials
//       )
//     );
//   },

//   getCredentials: () => {
//     return credentials;
//   },

//   clearCredentials: () => {
//     credentials = {};
//   },

//   getCode: () => {
//     return code;
//   },

//   clearCode: () => {
//     code = null;
//   },

//   githubAuth: (token) => {
//     octokit.authenticate({
//       type: 'oauth',
//       token: token
//     });
//   },

//   getStoredGithubToken: () => {
//     return conf.get('github.token');
//   },

//   setGithubTwoFactorAuthenticationCode: async () => {
//     code = await inquirer.askGithubTwoFactorAuthenticationCode();
//   },

//   registerNewToken: async () => {
//     const status = new Spinner('Authenticating you, please wait...');
//     status.start();

//     const params = {
//       scopes: ['user', 'public_repo', 'repo', 'repo:status'],
//       note: 'ginit, the command-line tool for initializing Git repos'
//     }

//     try {
//       const response = await octokit.authorization.create(params);
//       const token = response.data.token;
//       if (token) {
//         conf.set('github.token', token);
//         return token;
//       } else {
//         throw new Error('Missing Token', 'Github token was not found in the response');
//       }

//     } catch (err) {
//       if (err.code === 401) {
//         status.stop();

//         // check if a two-factor authorization VIA TEXT MESSAGE is setup for the github account
//         if (err.headers['x-github-otp'] === 'required; sms') {
//           code = await inquirer.askGithubTwoFactorAuthenticationCode();
//           const headers = 'headers: ' + JSON.stringify(code);
//           const paramsPlusAuthCode = _.extend(
//             params,
//             {
//               headers: code
//             }
//           );

//           const status = new Spinner('Authenticating you, please wait...');
//           status.start();

//           try {
//             const response = await octokit.authorization.create(paramsPlusAuthCode);
//             const token = response.data.token;
//             if (token) {
//               console.log('token', token);
//               conf.set('github.token', token);
//               return token;
//             } else {
//               throw new Error('Missing Token', 'Github token was not found in the response');
//             }

//           } catch (err) {
//             throw err;
//           } finally {
//             status.stop();
//           }
//         }
//       };
//       return;

//     } finally {
//       status.stop();
//     }
//   },

//   hasAccessToken: async () => {
//     const status = new Spinner('Authenticating you, please wait...');
//     status.start();

//     try {
//       const response = await octokit.authorization.getAll();
//       const accessToken = _.find(response.data, (row) => {
//         if (row.note) {
//           return row.note.indexOf('ginit') !== -1;
//         }
//       });
//       return accessToken;
//     } catch (err) {
//       throw err;
//     } finally {
//       status.stop();
//     }
//   },

//   regenerateNewToken: async (id) => {
//     const tokenUrl = 'https://github.com/settings/tokens/' + id;
//     console.log('Please visit ' + chalk.underline.blue.bold(tokenUrl) + ' and click the ' + chalk.red.bold('Regenerate Token Button.\n'));
//     const input = await inquirer(askRegenerateToken());
//     if (input) {
//       conf.set('github.token', input.token);
//       return input.token;
//     }
//   }

// }
