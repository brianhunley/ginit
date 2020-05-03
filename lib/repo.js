const CLI = require('clui');
const fs = require('fs');
const git = require('simple-git/promise')();
const Spinner = CLI.Spinner;
const touch = require('touch');
const _ = require('lodash');

const inquirer = require('./inquirer');
const gh = require('./github');

const createRemoteRepo = async () => {
  const github = gh.getInstance();
  const answers = await inquirer.askRepoDetails();

  const data = {
    name: answers.name,
    description: answers.description,
    private: answers.visibility === 'private',
  };

  const status = new Spinner('Creating remote repository...');
  status.start();

  try {
    const response = await github.repos.createForAuthenticatedUser(data);
    return response.data.ssh_url;
  } finally {
    status.stop();
  }
};

const createGitignore = async () => {
  console.log('createGitignore');

  const filelist = _.without(fs.readdirSync('.'), '.git', '.gitignore');

  if (filelist.length) {
    const answers = await inquirer.askIgnoreFiles(filelist);
    if (answers.ignore.length) {
      fs.writeFileSync('.gitignore', answers.ignore.join('\n'));
    } else {
      touch('.gitignore');
    }
  } else {
    touch('.gitignore');
  }
};

const setupRepo = async (url) => {
  const status = new Spinner(
    'Initializing local repository and pushing to remote...'
  );
  status.start();

  try {
    git
      .init()
      .then(git.add('.gitignore'))
      .then(git.add('./*'))
      .then(git.commit('Initial commit'))
      .then(git.addRemote('origin', url))
      .then(git.push('origin', 'master'));
  } finally {
    status.stop();
  }
};

module.exports = {
  createRemoteRepo,
  createGitignore,
  setupRepo,
};

// module.exports = {
//   createRemoteRepo: async () => {
//     const github = gh.getInstance();
//     const answers = await inquirer.askRepoDetails();

//     const data = {
//       name: answers.name,
//       description: answers.description,
//       private: answers.visibility === 'private',
//     };

//     const status = new Spinner('Creating remote repository...');
//     status.start();

//     try {
//       const response = await github.repos.create(data);
//       return response.data.ssh_url;
//     } catch (err) {
//       throw err;
//     } finally {
//       status.stop();
//     }
//   },

//   createGitignore: async () => {
//     console.log('createGitignore');

//     const filelist = _.without(fs.readdirSync('.'), '.git', '.gitignore');

//     if (filelist.length) {
//       const answers = await inquirer.askIgnoreFiles(filelist);
//       if (answers.ignore.length) {
//         fs.writeFileSync('.gitignore', answers.ignore.join('\n'));
//       } else {
//         touch('.gitignore');
//       }
//     } else {
//       touch('.gitignore');
//     }
//   },

//   setupRepo: async (url) => {
//     console.log('setupRepo');
//     console.log(url);

//     const status = new Spinner(
//       'Initializing local repository and pushing to remote...'
//     );
//     status.start();

//     require('simple-git')()
//       .init()
//       .add('./*')
//       .commit('first commit!')
//       .addRemote('origin', url)
//       .push('origin', 'master');

//     // try {
//     //   await git
//     //     .init()
//     //     .add('.gitignore')
//     //     .add('./*')
//     //     .commit('Initial commit')
//     //     .addRemote('origin', url)
//     //     .push('origin', 'master');
//     //   return true;
//     // } catch(err) {
//     //   throw err;
//     // } finally {
//     //   status.stop();
//     // }
//   },
// };
