#!/usr/bin/env node

const chalk = require('chalk');
const clear = require('clear');
const figlet = require('figlet');

const github = require('./lib/github');
const repo = require('./lib/repo');
const files = require('./lib/files');

clear();
console.log(
  chalk.yellow(
    figlet.textSync('Ginit', { horizontalLayout: 'full' })
  )
);

if (files.directoryExists('.git')) {
  console.log(chalk.red('Already a git repository!'));
  process.exit();
}

const getGithubToken = async () => {
  // fetch token from config store
  let token = github.getStoredGithubToken();
  if (token) {
    return token;
  }

  // no token found, use credentials to access GitHub account
  await github.setGithubCredentials();

  // no access token found, register one now
  token = await github.registerNewToken();
  return token;

  // check if access token for ginit was registered
  // const accessToken = await github.hasAccessToken();
  // console.log(accessToken);
  // if (accessToken) {
  //   console.log(chalk.yellow('An existing access token has been found!'));

  //   // ask user to regenerate a new token
  //   token = await github.regenerateNewToken(accessToken.id);
  //   return token;
  // }
}

const run = async () => {
  try {
    // retrieve and set authentication token
    const token = await getGithubToken();
    github.githubAuth(token);

    // create remote repository
    const url = await repo.createRemoteRepo();

    // create .gitignore file
    await repo.createGitignore();

    // setup local repository and push to remote
    const done = await repo.setupRepo(url);
    if (done) {
      console.log(chalk.green('All done!'));
    }

  } catch (err) {
    if (err) {
      switch (err.code) {
        case 401:
          console.log(chalk.red('Couldn\'t log you in. Please provide correct credentials/token.'));
          break;

        case 422:
          console.log(chalk.red('A remote repository with the same name already exists.'));
          break;

        default:
          console.log(err);
      }
    }
  }
}

run();