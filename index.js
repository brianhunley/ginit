#!/usr/bin/env node

const chalk = require('chalk'); // colorizes the output
const clear = require('clear'); // clears the terminal screen
const figlet = require('figlet'); // creates ASCII art from text

const files = require('./lib/files');
const repo = require('./lib/repo');
const github = require('./lib/github');

clear(); // clear the terminal screen

// create an ASCII art title and colorized it
console.log(
  chalk.yellow(figlet.textSync('Ginit', { horizontalLayout: 'full' }))
);

const getGithubToken = async () => {
  // Fetch token from config store
  let token = github.getStoredGithubToken();
  if (token) {
    return token;
  }

  // No token found, use credentials to access GitHub account
  token = await github.getPersonalAccessToken();

  return token;
};

// Does a 'git' directory already exist in the curr dir?
//  yes, show msg and exit.
//  no, we can create a git repo in the current dir.
if (files.directoryExists('.git')) {
  console.log(chalk.red('This directory is already a git repository!'));
  process.exit();
}

const run = async () => {
  try {
    // Retrieve & Set Authentication Token
    const token = await getGithubToken();
    github.githubAuth(token);

    // Create remote repository
    const url = await repo.createRemoteRepo();

    // Create .gitignore file
    await repo.createGitignore();

    // Set up local repository and push to remote
    await repo.setupRepo(url);

    console.log(chalk.green('All done!'));
  } catch (err) {
    if (err) {
      switch (err.status) {
        case 401:
          console.log(
            chalk.red(
              "Couldn't log you in. Please provide correct credentials/token."
            )
          );
          break;
        case 422:
          console.log(
            chalk.red(
              'There is already a remote repository or token with the same name'
            )
          );
          break;
        default:
          console.log(chalk.red(err));
      }
    }
  }
};

run();

/*

const getGithubToken = async () => {
  // fetch token from config store
  let token = github.getStoredGithubToken();

  if (token) {
    return token;
  }

  console.log('no token found, use credentials to access github acct');

  // no token found, use credentials to access GitHub account
  await github.setGithubCredentials();

  // no access token found, register one now
  token = await github.registerNewToken();
  console.log('new token', token);
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
};

const run = async () => {
  try {
    // retrieve and set authentication token
    const token = await getGithubToken();
    console.log('token', token);
    github.githubAuth(token);

    // create remote repository
    //const url = await repo.createRemoteRepo();
    //console.log(url);

    // create .gitignore file
    //await repo.createGitignore();

    // setup local repository and push to remote
    //const done = await repo.setupRepo(url);
    //if (done) {
    //  console.log(chalk.green('All done!'));
    // }
  } catch (err) {
    if (err) {
      console.log(err);
      // switch (err.code) {
      //   case 401:
      //     console.log(chalk.red('Couldn\'t log you in. Please provide correct credentials/token.'));
      //     break;

      //   case 422:
      //     console.log(chalk.red('A remote repository with the same name already exists.'));
      //     break;

      //   default:
      //     console.log(err);
      // }
    }
  }
};
*/

// run();
