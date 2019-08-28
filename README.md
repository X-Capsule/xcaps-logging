# 日志文件模块

## 日志级别

目前,中定义了一下日志级别


0. `fatal` - 致命的错误☠️
1. `error` - 错误❌
2. `warn`  - 警告⚠️
3. `info`  - 信息类日志📰
4. `debug` - Bugs🐞
5. `trace` - 追踪定位信息🎯


## 如何使用
### 1. getLogger()
创建或者获取 `Logger`
### 2. logger.addHandler()
为 `Logger` 实例添加 handler
### 3. handler 类型
#### 3.1 FileHandler
配置项如下:

* `handlerName` - 日志 handler 名称
* `level` - 标识包含该等级以上级别的日志信息
* `config.fileName` - 输出的日志文件名称

#### 3.2 ConsoleHandler

* `handlerName	` - 日志 handler 名称
* `level` - 标识包含该等级以上级别的日志信息

### 4. setLogger()
该方法是通过配置项自动生成 `Logger` 实例和 `handlers`.
#### 4.1 配置 Logger

* `name` - logger name

#### 4.2 配置 Handlers

* `handlerName` - 日志 handler 名称
* `handlerType` - 日志 handler 类型
* `path` - 日志生成路径
* `logType` - 日志类型(推荐分类有stats(统计)/desc(描述)/monitor(监控)/visit(访问)等)
* `logName` - 日志描述
* `dataActivated` - 是否激活按 Date 来分类生成日志文件
* `level` - 标识包含该等级以上级别的日志信息



