import LOG_LEVEL from "LOG_LEVEL";

const logLevels = [
  "debug",
  "info",
  "warn",
  "error",
  "prod"
];

class Logger {
  isLevel(level){
    return logLevels.indexOf(level) >= logLevels.indexOf(LOG_LEVEL);
  }

  log(...args) {
    if(this.isLevel("debug")){
      window.console.log(...args);
    }
  }

  debug(...args) {
    if(this.isLevel("debug")){
      window.console.debug(...args);
    }
  }

  info(...args) {
    if(this.isLevel("info")){
      window.console.info(...args);
    }
  }

  warn(...args) {
    if(this.isLevel("warn")){
      window.console.warn(...args);
    }
  }

  error(...args) {
    if(this.isLevel("error")){
      window.console.error(...args);
    }
  }
}

export default new Logger();