const { ConsoleHandler, FileHandler } = require('./lib/handlers');
const { getLogger, setLogger } = require('./lib/utils');


module.exports = {
  getLogger,
  setLogger,
  ConsoleHandler,
  FileHandler,
};
