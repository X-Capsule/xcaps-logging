const winston = require('winston');
const moment = require('moment');
/**
 * 文章地址 https://dzone.com/articles/application-logging-what-when
 * 在日志的输出格式上, 主要参考了文章当中的相关定义说明:
 * When logging exceptions we used following format. Some articles recommends
 * that we’d better to include problem failover suggestion but I think this
 * information should be given to the user not included in the logs. Logs are
 * rarely read but exceptions are in front of users.
 *
 * Log entry should answer following questions: Who(UserName), When (Timestamp),
 * Where(Context, ServletOrPage,Database), What (Command), Result (Exception)
 * [ErrorHandlerName]
 *   UserName: userABC
 *   DatabaseName: ABC
 *   Timestamp: 15.07.2009 13:02:08
 *   Context:
 *     Servlet Page: /prod/sales/SalesOrders.jsp
 *     Window: windowName
 *   Command: saveSalesOrder
 *   Exception: ShortDescriptionOfException ExceptionStackTraceHere
 */

/**
 * @function consoleFormatter
 * @param {Object} options
 * @param {Object} options.timestamp
 * @param {number} options.level
 * @param {number} options.message
 * @param {Object} options.meta
 * @return {string}
 */
function consoleFormatter(options) {
  const {
    timestamp, level, message, meta,
  } = options;
  const logDatetimeStr = `[${winston.config.colorize(level, moment(new Date(timestamp())).format('YYYY-MM-DD HH:mm:ss.SSS'))}]`;
  const messageStr = `${winston.config.colorize(level, message)}`;
  const levelStr = `[${winston.config.colorize(level, level.toUpperCase())}]`;
  const metaData = meta && Object.keys(meta).length ? ` - ${winston.config.colorize(level, JSON.stringify(meta))}` : '';
  return `${logDatetimeStr} ${levelStr} ${messageStr} ${metaData}`;
}

/**
 * @function fileFormatter
 * @param {Object} options
 * @param {Object} options.timestamp
 * @param {number} options.level
 * @param {number} options.message
 * @param {Object} options.meta
 * @return {Object}
 */
function fileFormatter(options) {
  return {
    level: options.level,
    timestamp: options.timestamp,
    message: options.message,
    metadata: options.meta,
  };
}

module.exports = {
  consoleFormatter,
  fileFormatter,
};
