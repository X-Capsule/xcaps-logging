const logging = require('../index');

const { ConsoleHandler, FileHandler } = logging;

// const infoHandler = new ConsoleHandler('consoleHandler', 'info');
const traceHandler = new ConsoleHandler('consoleHandler', 'trace');
// const debugHandler = new ConsoleHandler('consoleHandler', 'debug', {
//   config: {},
// });
const fileHandler = new FileHandler('fileHandler', 'warn', {
  config: {
    filename: './logs/filelog-info.log',
  },
});

const logger = logging.getLogger();

// logger.addHandler(errorHandler);
// logger.addHandler(debugHandler);
// logger.addHandler(infoHandler);
logger.addHandler(traceHandler);
logger.addHandler(fileHandler);

logger.fatal('fatal logging info️', { info: 'hello world' });
logger.error('error logging info', { info: 'hello world' });
logger.warn('warn logging info️', { info: 'hello world' });
logger.info('info logging info️', { info: 'hello world' });
logger.debug('debug logging info️', { info: 'hello world' });
logger.trace('trace logging info', { info: 'hello world' });

