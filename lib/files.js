const fs = require('fs');
const path = require('path');

const getCurrentDirectoryBase = () => {
  return path.basename(process.cwd());
};

const directoryExists = (filePath) => {
  return fs.existsSync(filePath);
};

module.exports = {
  getCurrentDirectoryBase,
  directoryExists,
};
