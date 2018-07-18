const _ = require('lodash');
const Level = require('./Level');

/**
 * @class PlaceHolder
 * @description 该类是用于 logger name 以 'node1.node2.node3' 形式命名的 logger.
 * 当 getLogger('node1.node2.node3') 定义 logger, 则会用于生成有继承关系的两个 logger
 * 的 PlaceHolders. 例如, rootLogger.PlaceHolder.PlaceHolder.Logger
 */
class PlaceHolder {
  constructor(logger) {
    this.loggerMap = [logger];
  }
  append(logger) {
    this.loggerMap.push(logger);
  }
}

/**
 * @private fixUpParents
 * @description 给当前 logger 节点添加父节点.
 * @param {Logger | PlaceHolder} node
 */
function fixUpParents(node) {
  const { name } = node;
  const logger = null;
  let i = name.lastIndexOf('.');
  let parentLoggerName = null;
  let parentLogger = null;
  while (i > 0 && _.isNull(parentLogger)) {
    parentLoggerName = name.substring(0, i);
    if (!_.has(this.loggerList, parentLoggerName)) {
      this.loggerList[parentLoggerName] = new PlaceHolder(logger);
    } else {
      const nodeLogger = this.loggerList[parentLoggerName];
      if (nodeLogger instanceof this.LoggerClass) {
        parentLogger = nodeLogger;
      } else {
        const placeHolder = nodeLogger;
        placeHolder.append(nodeLogger);
      }
    }
    i = name.lastIndexOf('.', i - 1);
  }

  if (_.isNull(parentLogger)) {
    parentLogger = this.root;
  }

  return parentLogger;
}

/**
 * @private fixUpChildren
 * @description 给当前 logger 节点添加子节点.
 * @param placeHolder
 * @param {PlaceHolder} placeHolder
 * @param {Logger} logger
 */
function fixUpChildren(placeHolder, logger) {
  const { name } = logger;
  const nameLen = name.length;
  let parentLogger = null;
  _.map(placeHolder.loggerMap, (childLogger) => {
    const childLoggerCopy = childLogger;
    const parentLoggerName = childLogger.parent.name.substring(0, nameLen);
    if (parentLoggerName !== name) {
      const { parent } = childLogger;
      parentLogger = parent;
      childLoggerCopy.parent = logger;
    }
  });
  return parentLogger;
}

class Manager {
  constructor(rootNode, LoggerClass) {
    this.root = rootNode;
    this.disable = Level.levels.trace;
    this.loggerList = {};
    this.LoggerClass = LoggerClass;
  }
  /**
   * @method getLogger
   * @description 该方法是通过 logger name 来获取 logger instance. 如果存在则通过遍历
   * 查询来获取, 如果不存在则创建 logger 节点并返回 logger instance.
   * @param {string} name
   * @return {Logger}
   */
  getLogger(name) {
    let logger = null;
    try {
      if (_.has(this.loggerList, name)) {
        logger = this.loggerList[name];
        if (logger instanceof PlaceHolder) {
          const placeHolder = logger;
          logger = new this.LoggerClass(name);
          logger.manager = this;
          fixUpChildren.call(this, placeHolder, logger);
          logger.parent = fixUpParents.call(this, logger);
        }
      } else {
        logger = new this.LoggerClass(name);
        logger.manager = this;
        this.loggerList[name] = logger;
        fixUpParents.call(this, logger);
      }
    } catch (err) {
      throw err;
    }
    return logger;
  }
}

module.exports = Manager;
