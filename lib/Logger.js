const _ = require('lodash');
const stackTrace = require('stack-trace');
const Manager = require('./Manager');
const LogRecord = require('./LogRecord');
const Level = require('./Level');
const { ConsoleHandler } = require('./handlers');

// const root = null;

// /**
//  * @private getRootLogger
//  * @description
//  * @return {Logger}
//  */
// function getRootLogger() {
//   if (!_.isNull(root)) {
//     return root;
//   }
//   return new Logger('root', Level.getLevelName(''));
// }

/**
 * 查找调用logger的调用者并返回对应的调用信息
 * @return {{path: string, moduleName: string, lineNo: number, funcName: string}}
 */
function findCaller() {
  const stack = stackTrace.get();
  const caller = stack[4];
  return {
    path: process.cwd(),
    moduleName: caller.getFileName(),
    lineNo: caller.getLineNumber(),
    funcName: caller.getFunctionName(),
  };
}

/**
 * 创建logRecord的工厂方法
 * @param {string} name - logger name
 * @param {string} level - 日志等级
 * @param {string} message - 日志消息
 * @param {Object} [metadata] - 日志元数据
 */
function makeRecord(name, level, message, metadata) {
  const {
    path, moduleName, lineNo, action,
  } = findCaller();
  const logRecord = new LogRecord(
    name,
    level,
    message,
    metadata,
    {
      path,
      moduleName,
      lineNo,
      action,
    },
  );
  return logRecord;
}

/**
 * 如果用户自定义了ConsoleHandler,则移除Logger.root的defaultHandler
 * @method removeDefaultConsoleHandlerIfNeeded
 * @param {Array<Handler>} effectiveHandlers - 日志输出方法
 */
function removeDefaultConsoleHandlerIfNeeded(effectiveHandlers) {
  let needDefaultHandler = true;
  let defaultHandlerIndex = -1;
  effectiveHandlers.forEach((handler, index) => {
    if (handler instanceof ConsoleHandler) {
      if (handler.name === 'defaultHandler') {
        defaultHandlerIndex = index;
      } else {
        needDefaultHandler = false;
      }
    }
  });
  if (!needDefaultHandler && defaultHandlerIndex !== -1) {
    effectiveHandlers.splice(defaultHandlerIndex, 1);
  }
}

/**
 * 基于winston所封装的Logger Class，提供了自定义的日志等级，以及对应的输出方法
 * @class
 */
class Logger {
  /**
   * @constructor
   * @param {string} name - logger name
   * @param {string || null} [level] - logger level
   * @param {Object} [options]
   * @param {boolean} [options.propagate] - 是否决定将当前层级的日志传播到父级日志.
   */
  constructor(name, level = null, options = {}) {
    let loggerOptions = {};
    let loggerLevel = null;
    if (_.isObject(level)) {
      loggerOptions = level;
    } else {
      loggerLevel = level;
      loggerOptions = options;
    }
    this.name = name;
    this.level = loggerLevel;
    this.parent = null;
    this.handlers = [];
    /**
     * disabled 为启用的 level 过滤等级, 小于该 level 的日志将被过滤. 默认为 TRACE 等级.
     */
    this.disabled = Level.levels.trace;
    this.root = Logger.root;
    this.manager = Logger.manager;
    this.propagate = _.isBoolean(loggerOptions.propagate) ? loggerOptions.propagate : true;
  }

  /**
   * @method getEffectiveLevel
   * @description 获取有效日志等级，若当前logger已定义日志等级则输出当前日志等级，否则将在
   * parent上查找直到找到一个有效的日志等级，若没有，则返回默认日志等级.
   * @returns {string}
   */
  getEffectiveLevel() {
    let self = this;
    let effectiveLevel = self.level;
    while (!effectiveLevel) {
      if (self.parent) {
        self = self.parent;
        effectiveLevel = self.level;
      } else {
        break;
      }
    }
    return effectiveLevel || Level.getLevelName('');
  }

  /**
   * 设置当前日志等级
   * @method setLevel
   * @param {string} level - 日志等级
   */
  setLevel(level) {
    this.level = level;
    this.agent.level = level;
  }

  /**
   * 获取当前logger的parent
   * @method getParent
   * @returns {Logger}
   */
  getParent() {
    return this.parent;
  }
  /**
   * 获取当前logger的children
   * @method getChild
   * @param {string} name - child name
   * @return {Logger}
   */
  getChild(name) {
    const childName = [this.name, name].join('.');
    return this.manager.getLogger(childName);
  }
  /**
   * 检查logger是否启用所传入level等级的日志级别
   * @method isEnabledFor
   * @param level - 日志等级
   * @returns {boolean}
   */
  isEnabledFor(level) {
    const priority = Level.getPriority(level);
    if (this.manager.disable < priority) {
      return false;
    }
    return priority <= Level.getPriority(this.getEffectiveLevel());
  }

  /**
   * 输出fatal等级的日志
   * @method fatal
   * @param {string} message - 日志消息
   * @param {Object} [metadata] - 日志元数据
   */
  fatal(message, metadata) {
    const level = Level.getLevelName('fatal');
    if (this.isEnabledFor(level)) {
      this.logHelper(level, message, metadata);
    }
  }
  /**
   * 输出error等级的日志
   * @method error
   * @param {string} message - 日志消息
   * @param {Object} [metadata] - 日志元数据
   */
  error(message, metadata) {
    const level = Level.getLevelName('error');
    if (this.isEnabledFor(level)) {
      this.logHelper(level, message, metadata);
    }
  }
  /**
   * 输出warn等级的日志
   * @method warn
   * @param {string} message - 日志消息
   * @param {Object} [metadata] - 日志元数据
   */
  warn(message, metadata) {
    const level = Level.getLevelName('warn');
    if (this.isEnabledFor(level)) {
      this.logHelper(level, message, metadata);
    }
  }
  /**
   * 输出info等级的日志
   * @method info
   * @param {string} message - 日志消息
   * @param {Object} [metadata] - 日志元数据
   */
  info(message, metadata) {
    const level = Level.getLevelName('info');
    if (this.isEnabledFor(level)) {
      this.logHelper(level, message, metadata);
    }
  }
  /**
   * 输出debug等级的日志
   * @method debug
   * @param {string} message - 日志消息
   * @param {Object} [metadata] - 日志元数据
   */
  debug(message, metadata) {
    const level = Level.getLevelName('debug');
    if (this.isEnabledFor(level)) {
      this.logHelper(level, message, metadata);
    }
  }
  /**
   * 输出trace等级的日志
   * @method trace
   * @param {string} message - 日志消息
   * @param {Object} [metadata] - 日志元数据
   */
  trace(message, metadata) {
    const level = Level.getLevelName('trace');
    if (this.isEnabledFor(level)) {
      this.logHelper(level, message, metadata);
    }
  }
  /**
   * 输出指定等级的日志
   * @method log
   * @param {string} level - 日志等级
   * @param {string} message - 日志消息
   * @param {Object} [metadata] - 日志元数据
   */
  log(level, message, metadata) {
    const validLevel = Level.getLevelName(level);
    if (this.isEnabledFor(validLevel)) {
      this.logHelper(validLevel, message, metadata);
    }
  }

  /**
   * 生成日志具体内容并输出到对应的handler
   * @method logHelper
   * @param {string} level - 日志等级
   * @param {string} message - 日志消息
   * @param {Object} [metadata] - 日志元数据
   */
  logHelper(level, message, metadata) {
    const logRecord = makeRecord(this.name, level, message, metadata);
    this.handle(logRecord);
  }

  /**
   * 检查并过滤不需要的日志，将需要的日志输出到对应的handler中
   * @method handle
   * @param {LogRecord} record - 日志记录
   */
  handle(record) {
    // TODO: filter
    // if (!this.disabled && filter(record)) {
    if (!_.isNull(this.disabled)) {
      this.callHandlers(record);
    }
  }

  /**
   * 查找当前logger的handlers以及对应的parent的handlers，并将日志输出到所有handlers里
   * @method callHandlers
   * @param {LogRecord} record - 日志记录
   */
  callHandlers(record) {
    const that = this;
    let logger = that;
    let effectiveHandlers = [];
    do {
      effectiveHandlers = effectiveHandlers.concat(logger.handlers);
      if (that.propagate) {
        logger = logger.parent;
      } else {
        logger = null;
      }
    } while (logger);
    if (effectiveHandlers.length === 0) {
      const stack = stackTrace.get();
      const caller = stack[4];
      const moduleName = caller.getFileName();
      const lineNo = caller.getLineNumber();
      console.log(
        '\x1b[33m%s\x1b[0m',
        `\nWarning: No handler is bound to the rms-logger named as [${this.name}], you may not see any output messages.\nPlease add at least one handler to this logger.\nModuleName: [${moduleName}].\nLineNo: [${lineNo}].\n`,
      );
    }
    removeDefaultConsoleHandlerIfNeeded(effectiveHandlers);
    effectiveHandlers.forEach((handler) => {
      handler.handle(record);
    });
  }

  /**
   * 添加一个handler
   * @method addHandler
   * @param {Handler} handler - 日志输出方法
   */
  addHandler(handler) {
    const foundHandler =
      this.handlers.find(handlerItem => handlerItem.name === handler.name);
    if (!foundHandler) {
      this.handlers.push(handler);
    }
  }
  /**
   * 移除一个handler
   * @method removeHandler
   * @param {Handler} handler - 日志输出方法
   */
  removeHandler(handler) {
    const foundHandlerIndex =
      this.handlers.findIndex(handlerItem => handlerItem.name === handler.name);
    if (foundHandlerIndex > -1) {
      this.handlers.splice(foundHandlerIndex, 1);
    }
  }
}
Logger.root = new Logger('root');
Logger.root.addHandler(new ConsoleHandler('defaultHandler', 'trace'));

Logger.manager = new Manager(Logger.root, Logger);
Logger.root.manager = Logger.manager;


module.exports = Logger;
