const Logger = require('./Logger');
const { ConsoleHandler, FileHandler } = require('./handlers');
const moment = require('moment');
const path = require('path');

/**
 * @description 文件类日志输出, 关于日志文件名的命名问题, 目前采用 "应用名称日志分类日志名称.log.
 * 日志名称采用日志level + 日期" 的格式.
 * @param {Object} [options]
 * @param {string} [options.appName]
 * @param {string} [options.logType]
 * @param {string} [options.logName]
 * @param {string} [options.level]
 * @param {boolean} [options.dataActivated]
 * @return {string}
 */
function formatFileName(options = {}) {
  /**
   * 日志文件输出说明, 主要参考了阿里 Java 开发手册的日志规约. 其中描述对日志文件的命名描述.
   * 应用中的扩展日志（如打点、临时监控、访问日志等）命名方式：appName_logType_logName.log。
   * logType:日志类型，推荐分类有stats(统计)/desc(描述)/monitor(监控)/visit(访问)等；
   * logName:日志描述。这种命名的好处：通过文件名就可知道日志文件属于什么应用，什么类型，什么目的，也有利于归类查找。
   * 正例：mppserver 应用中单独监控时区转换异常，如： mppserver_monitor_timeZoneConvert.log
   * 说明：推荐对日志进行分类，如将错误日志和业务日志分开存放，便于开发人员查看，也便于通过日志对系统进行及时监控。
   */
  const {
    appName, logType, logName, dataActivated,
  } = options;
  let logDate = '';
  const format = 'log';
  /**
   * 文件类日志输出, 关于日志文件名的命名问题, 目前采用 "应用名称日志分类日志名称.log. 日志名称采用日志level + 日期" 的格式.
   * 暂且不在配置文件中维护
   */
  if (dataActivated) {
    logDate = moment().format('YYYY-MM-DD');
  }

  return `${appName}-${logType}-${logName}-${logDate}.${format}`;
}

/**
 * @description 生成日志路径
 * @param {string} filePath
 * @param {string} fileName
 * @return {string}
 */
function getFile(filePath, fileName) {
  return path.join(filePath, fileName);
}

/**
 * @function getLogger
 * @description 获取 logger 实例.
 * @param name
 * @return {Logger}
 */
function getLogger(name = null) {
  if (name) {
    return Logger.manager.getLogger(name);
  }
  return Logger.root;
}

function createHandler(handlerConfig, appName) {
  const { handlerName, handlerType, level } = handlerConfig;
  switch (handlerType) {
    case 'FileHandler':
      return new FileHandler(handlerName, level, {
        config: {
          filename: getFile(handlerConfig.path, formatFileName({
            appName,
            logType: handlerConfig.logType,
            logName: handlerConfig.logName,
            dataActivated: handlerConfig.dataActivated,
          })),
        },
      });
    case 'ConsoleHandler':
      return new ConsoleHandler(handlerName, level);
    default:
      return null;
  }
}

/**
 * @description 通过配置 set logger
 * @param {Object} options
 * @param {string} options.name - logger name
 * @param {Array<Object>} [options.handlers] - handler 类型有: 1. FileHandler 2. ConsoleHandler
 */
function setLogger(options = {}) {
  const { name, handlers = [] } = options;
  const logger = getLogger(name);
  handlers.forEach((handlerConfig) => {
    const handler = createHandler(handlerConfig, name);
    if (handler) {
      logger.addHandler(handler);
    }
  });
}

module.exports = {
  getLogger,
  setLogger,
};
