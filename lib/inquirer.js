const inquirer = require('inquirer');
const files = require('./files');

module.exports = {

  askGithubCredentials: async () => {
    const questions = [
      {
        name: 'username',
        type: 'input',
        message: 'Enter your GitHub username or email address:',
        validate: function(value) {
          if (value.length) {
            return true;
          } else {
            return 'Please enter your username or email address.';
          }
        }
      },
      {
        name: 'password',
        type: 'password',
        message: 'Enter your password',
        validate: function(value) {
          if (value.length) {
            return true;
          } else {
            return 'Please enter your password.';
          }
        }
      }
    ];
    return inquirer.prompt(questions);
  },

  askRegenerateToken: () => {
    const questions = [
      {
        name: 'token',
        type: 'input',
        message: 'Enter your new regenerated token:',
        validate: function(value) {
          if (value.length) {
            return true;
          } else {
            return 'Please enter your new regenerated token.';
          }
        }
      }
    ];
    return inquirer.prompt(questions);
  },

  askGithubTwoFactorAuthenticationCode: async () => {
    const questions = [
      {
        name: 'X-GitHub-OTP',
        type: 'input',
        message: 'Enter your GitHub two-factor authentication code:',
        validate: function(value) {
          if (value.length) {
            return true;
          } else {
            return 'Please enter your GitHub two-factor authentication code.';
          }
        }
      }
    ];
    return inquirer.prompt(questions);
  },

  askRepoDetails: () => {
    const argv = require('minimist')(process.argv.slice(2));

    const questions = [
      {
        type: 'input',
        name: 'name',
        message: 'Enter a name for the repository:',
        default: argv._[0] || files.getCurrentDirectoryBase(),
        validate: function(value) {
          if (value.length) {
            return true;
          } else {
            return 'Please enter a name for the repository.';
          }
        }
      },
      {
        type: 'input',
        name: 'description',
        default: argv._[1] || null,
        message: 'Optionally enter a description of the repository:'
      },
      {
        type: 'list',
        name: 'visibility',
        message: 'Public or private:',
        choices: ['public', 'private'],
        default: 'public'
      },
    ];
    return inquirer.prompt(questions);
  },

  askIgnoreFiles: (filelist) => {
    const questions = [
      {
        type: 'checkbox',
        name: 'ignore',
        message: 'Select the files and/or folders you wish to ignore:',
        choices: filelist,
        default: ['node_modules', 'bower_components']
      }
    ];
    return inquirer.prompt(questions);
  }

};