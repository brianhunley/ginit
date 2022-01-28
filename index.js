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

// Does a 'git' directory already exist in the curr dir?
//  yes, show msg and exit.
//  no, we can create a git repo in the current dir.
if (files.directoryExists('.git')) {
  console.log(chalk.red('This directory is already a git repository!'));
  process.exit();
}

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

const run = async () => {
  try {
    // // Retrieve & Set Authentication Token
    const token = await getGithubToken();
    github.githubAuth(token);

    // get organization list
    // github.getOrgList();

    // get repo list?
    github.getRepoList();

    // repos.forEach((repo) => console.log(repo.name));

    // // Create remote repository
    // const url = await repo.createRemoteRepo();

    // // Create .gitignore file
    // await repo.createGitignore();

    // // Set up local repository and push to remote
    // await repo.setupRepo(url);

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
