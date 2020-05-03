const inquirer = require('inquirer'); // creates interactive command-line user interfaces
const files = require('./files'); // our 'files' module

const askGithubCredentials = async () => {
  const questions = [
    {
      name: 'username',
      type: 'input',
      message: 'Enter your GitHub username or email address:',
      validate: function (value) {
        if (value.length) {
          return true;
        } else {
          return 'Please enter your username or email address.';
        }
      },
    },
    {
      name: 'password',
      type: 'password',
      message: 'Enter your password',
      validate: (value) => {
        if (value.length) {
          return true;
        } else {
          return 'Please enter your password.';
        }
      },
    },
  ];
  return inquirer.prompt(questions);
};

const getTwoFactorAuthenticationCode = () => {
  return inquirer.prompt({
    name: 'twoFactorAuthenticationCode',
    type: 'input',
    message: 'Enter your two-factor authentication code',
    validate: (value) => {
      if (value.length) {
        return true;
      } else {
        return 'Please enter your two-factor authentication code';
      }
    },
  });
};

const askRepoDetails = () => {
  const argv = require('minimist')(process.argv.slice(2));

  const questions = [
    {
      type: 'input',
      name: 'name',
      message: 'Enter a name for the repository:',
      default: argv._[0] || files.getCurrentDirectoryBase(),
      validate: function (value) {
        if (value.length) {
          return true;
        } else {
          return 'Please enter a name for the repository.';
        }
      },
    },
    {
      type: 'input',
      name: 'description',
      default: argv._[1] || null,
      message: 'Optionally enter a description of the repository:',
    },
    {
      type: 'list',
      name: 'visibility',
      message: 'Public or private:',
      choices: ['public', 'private'],
      default: 'public',
    },
  ];
  return inquirer.prompt(questions);
};

const askIgnoreFiles = (filelist) => {
  const questions = [
    {
      type: 'checkbox',
      name: 'ignore',
      message: 'Select the files and/or folders you wish to ignore:',
      choices: filelist,
      default: ['node_modules', 'bower_components'],
    },
  ];
  return inquirer.prompt(questions);
};

// const askRegenerateToken = () => {
//   const questions = [
//     {
//       name: 'token',
//       type: 'input',
//       message: 'Enter your new regenerated token:',
//       validate: function (value) {
//         if (value.length) {
//           return true;
//         } else {
//           return 'Please enter your new regenerated token.';
//         }
//       },
//     },
//   ];
//   return inquirer.prompt(questions);
// };

// const askGithubTwoFactorAuthenticationCode = async () => {
//   const questions = [
//     {
//       name: 'X-GitHub-OTP',
//       type: 'input',
//       message: 'Enter your GitHub two-factor authentication code:',
//       validate: function (value) {
//         if (value.length) {
//           return true;
//         } else {
//           return 'Please enter your GitHub two-factor authentication code.';
//         }
//       },
//     },
//   ];
//   return inquirer.prompt(questions);
// };

// const askRepoDetails = () => {
//   const argv = require('minimist')(process.argv.slice(2));

//   const questions = [
//     {
//       type: 'input',
//       name: 'name',
//       message: 'Enter a name for the repository:',
//       default: argv._[0] || files.getCurrentDirectoryBase(),
//       validate: function (value) {
//         if (value.length) {
//           return true;
//         } else {
//           return 'Please enter a name for the repository.';
//         }
//       },
//     },
//     {
//       type: 'input',
//       name: 'description',
//       default: argv._[1] || null,
//       message: 'Optionally enter a description of the repository:',
//     },
//     {
//       type: 'list',
//       name: 'visibility',
//       message: 'Public or private:',
//       choices: ['public', 'private'],
//       default: 'public',
//     },
//   ];
//   return inquirer.prompt(questions);
// };

// const askIgnoreFiles = (filelist) => {
//   const questions = [
//     {
//       type: 'checkbox',
//       name: 'ignore',
//       message: 'Select the files and/or folders you wish to ignore:',
//       choices: filelist,
//       default: ['node_modules', 'bower_components'],
//     },
//   ];
//   return inquirer.prompt(questions);
// };

module.exports = {
  askGithubCredentials,
  getTwoFactorAuthenticationCode,
  askRepoDetails,
  askIgnoreFiles,
  // askRegenerateToken,
  // askGithubTwoFactorAuthenticationCode,
};
