/**
 * 日志等级参照log4j所定义的6个等级，等级优先级从高到低依次为fatal>error>warn>info>debug>trace.
 * 数字越大则等级越低.
 */
const priorities = {
  fatal: 0,
  error: 1,
  warn: 2,
  info: 3,
  debug: 4,
  trace: 5,
};

const colors = {
  fatal: 'red',
  error: 'magenta',
  warn: 'yellow',
  info: 'green',
  debug: 'cyan',
  trace: 'white',
};

const levelNames = {
  fatal: 'fatal',
  error: 'error',
  warn: 'warn',
  info: 'info',
  debug: 'debug',
  trace: 'trace',
};

const defaultLevel = levelNames.trace;

/**
 * 日志等级及先关方法
 * @class
 */
class Level {
  /**
   * 获取对应日志等级的优先级
   * @method getPriority
   * @param {string} levelName - 日志等级名称
   * @return {number}
   */
  static getPriority(levelName) {
    let priority;
    if (this.checkValidPriority(levelName)) {
      priority = priorities[levelName];
    } else {
      priority = 0;
    }
    return priority;
  }
  /**
   * 获取对应日志等级的名称
   * @method getLevelName
   * @param {string} level - 日志等级
   * @return {string}
   */
  static getLevelName(level) {
    let levelName;
    if (this.checkValidLevel(level)) {
      levelName = levelNames[level];
    } else {
      levelName = defaultLevel;
    }
    return levelName;
  }
  /**
   * 检查有效的日志优先级，若判断为无效日志等级则返回最低优先级
   * @method checkValidPriority
   * @param {string} levelName - 日志等级名称
   * @return {boolean}
   */
  static checkValidPriority(levelName) {
    return (typeof priorities[levelName] === 'number');
  }
  /**
   * 检查有效的日志等级名称，若判断为无效日志等级则返回默认等级
   * @method checkValidLevel
   * @param {string} level - 日志等级
   * @return {boolean}
   */
  static checkValidLevel(level) {
    return !!levelNames[level];
  }

  /**
   * @method greaterThan
   * @description 比较日志等级的优先级，若level1 > level2则返回true，否则返回false.
   * @param {string} level1 - 日志等级
   * @param {string} level2 - 日志等级
   * @return {boolean}
   */
  static greaterThan(level1, level2) {
    const priority1 = this.getPriority(level1);
    const priority2 = this.getPriority(level2);
    /**
     * 数字越大则权值越小.
     */
    return priority1 < priority2;
  }
}

Level.levels = priorities;
Level.colors = colors;

module.exports = Level;
