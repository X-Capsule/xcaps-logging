/**
 * 该模块目前是基于 winston transport 封装的日志输出模块.
 */
const winston = require('winston');
const _ = require('lodash');
const { consoleFormatter, fileFormatter } = require('./format');
const Level = require('./Level');

const FileTransport = winston.transports.File;
const ConsoleTransport = winston.transports.Console;

/**
 * @function getWinstonLoggerHandler
 * @param {Object} options
 */
function getWinstonLoggerHandler(options = {}) {
  const logger = new winston.Logger({
    levels: Level.levels,
    colors: Level.colors,
  });
  return logger;
}

/**
 * @private getLoggerHandler
 * @description initialize WinstonLogger-based third-party agent.
 * @param {Object} options
 * @param {function} callback - callback function to setup logger handler
 * @return {*}
 */
function getLoggerHandler(options = {}, callback) {
  let cb = callback;
  if (typeof options === 'function') {
    cb = options;
  }
  const loggerHandler = getWinstonLoggerHandler(options);
  if (cb) {
    cb(loggerHandler);
  }
  return loggerHandler;
}

class Handler {
  /**
   * @param {string} name - logger name
   * @param {string} [level] - log level
   * @param {Object} [options]
   * @param {function | Formatter} [options.formatter] - formatter function or
   * custom formatter object.
   * @param {Object} options.config - logger config
   */
  constructor(name, level, options = {}) {
    let levelName = null;
    let handlerOptions = options;
    if (_.isObject(level)) {
      handlerOptions = level;
      levelName = Level.getLevelName();
    } else {
      levelName = Level.getLevelName(level);
    }
    this.name = name;
    this.level = levelName;
    this.loggerHandler = null;
    this.initializeLoggerHandler(handlerOptions);
  }

  /**
   * @method initializeLoggerHandler
   * @description 该方法应该被 override.
   * @param {object} options
   */
  // initializeLoggerHandler(options = {}) {
  //   /**
  //    * this method should be override in your custom handler.
  //    */
  // }
  /**
   * @method setLevel
   * @param {string} level - log level instance.
   */
  setLevel(level) {
    this.level = Level.getLevelName(level);
  }
}

class ConsoleHandler extends Handler {
  /**
   * @constructor
   * @param {string} name - handler name
   * @param {string} level - log level instance.
   * @param {Object} options
   * @param {Object} options.config - handler config (etc. winston transport
   * config).
   */
  constructor(name, level, options = {}) {
    super(name, level, options);
  }

  /**
   * @method initializeLoggerHandler
   * @param {Object} options
   * @param {Object} options.config - handler config (etc. winston transport
   * config).
   */
  initializeLoggerHandler(options = {}) {
    const { config } = options;
    const loggerConfig = _.defaults(config, {
      level: this.level,
      timestamp: () => Date.now(),
      prettyPrint: true,
    });
    /**
     * 设定固定的 formatter 方法, 用于按指定的日志格式输出, 详细的日志输出格式请参考
     * consoleFormatter 方法的定义.
     */
    loggerConfig.formatter = consoleFormatter;
    this.loggerHandler = getLoggerHandler({}, (loggerHandler) => {
      /**
       * custom callback function to setup logger handler.
       */
      loggerHandler.add(ConsoleTransport, loggerConfig);
    });
  }

  /**
   * @method format
   * @description 格式化日志数据, 按照目前平台规则收集输出日志所需的字段.
   * @param {LogRecord} record - loggerRecord instance
   * @return {Object}
   */
  format(record) {
    this.record = record;
    return {
      message: record.message,
      metadata: {
        pid: record.pid,
        name: record.name,
        timestamp: record.timestamp,
        action: record.action,
        path: record.path,
        moduleName: record.moduleName,
        lineNo: record.lineNo,
        context: record.metadata,
      },
    };
  }
  /**
   * @method handle
   * @param {LogRecord} record - 该方法是将 logger framework 生成的 logger 请求交给
   * handler 来做日志输出工作.
   */
  handle(record) {
    const output = this.format(record);
    if (!Level.greaterThan(this.level, record.level)) {
      this.loggerHandler.log(record.level, output.message, output.metadata);
    }
  }
}

class FileHandler extends Handler {
  /**
   * @constructor
   * @param {string} name - handler name
   * @param {string} level - log level instance.
   * @param {Object} options
   * @param {Object} options.config - handler config (etc. winston transport
   * config).
   */
  constructor(name, level, options = {}) {
    super(name, level, options);
  }

  /**
   * @method initializeLoggerHandler
   * @param {Object} options
   * @param {Object} options.config - handler config (etc. winston transport
   * config).
   */
  initializeLoggerHandler(options = {}) {
    const { config } = options;
    const loggerConfig = _.defaults(config, {
      level: this.level,
      timestamp: () => Date.now(),
      prettyPrint: true,
    });
    /**
     * 设定固定的 formatter 方法, 用于按指定的日志格式输出, 详细的日志输出格式请参考
     * consoleFormatter 方法的定义.
     */
    loggerConfig.formatter = fileFormatter;
    this.loggerHandler = getLoggerHandler({}, (loggerHandler) => {
      /**
       * custom callback function to setup logger handler.
       */
      loggerHandler.add(FileTransport, config);
    });
  }

  /**
   * @method format
   * @description 格式化日志数据, 按照目前平台规则收集输出日志所需的字段.
   * @param {LogRecord} record - loggerRecord instance
   * @return {Object}
   */
  format(record) {
    this.record = record;
    return {
      message: record.message,
      metadata: {
        name: record.name,
        pid: record.pid,
        level: record.level,
        timestamp: record.timestamp,
        action: record.action,
        path: record.path,
        moduleName: record.moduleName,
        lineNo: record.lineNo,
        context: record.metadata,
      },
    };
  }

  /**
   * @method handle
   * @param {LogRecord} record - 该方法是将 logger framework 生成的 logger 请求交给
   * handler 来做日志输出工作.
   */
  handle(record) {
    const output = this.format(record);
    if (!Level.greaterThan(this.level, record.level)) {
      this.loggerHandler.log(record.level, output.message, output.metadata);
    }
  }
}

module.exports = {
  FileHandler,
  ConsoleHandler,
};
