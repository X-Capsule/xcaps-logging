function generateTimestamp() {
  const date = new Date();
  const year = date.getFullYear();
  const month = (`0${(date.getMonth() + 1)}`).slice(-2);
  const day = (`0${(date.getDate())}`).slice(-2);
  const hours = (`0${(date.getHours())}`).slice(-2);
  const minutes = (`0${(date.getMinutes())}`).slice(-2);
  const seconds = (`0${(date.getSeconds())}`).slice(-2);
  const milliseconds = (`000${(date.getMilliseconds())}`).slice(-3);
  const timestamp = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}.${milliseconds}`;

  return timestamp;
}

class LogRecord {
  constructor(name, level, message, metadata, options = {}) {
    const {
      path, moduleName, lineNo, action,
    } = options;
    this.name = name;
    this.level = level;
    this.message = message;
    this.metadata = metadata;
    this.timestamp = generateTimestamp();
    this.path = path;
    this.moduleName = moduleName || 'Unknown module';
    this.lineNo = lineNo;
    this.action = action;
    this.pid = process.pid;
  }
}

module.exports = LogRecord;
