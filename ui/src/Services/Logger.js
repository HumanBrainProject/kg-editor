/*
*   Copyright (c) 2020, EPFL/Human Brain Project PCO
*
*   Licensed under the Apache License, Version 2.0 (the "License");
*   you may not use this file except in compliance with the License.
*   You may obtain a copy of the License at
*
*       http://www.apache.org/licenses/LICENSE-2.0
*
*   Unless required by applicable law or agreed to in writing, software
*   distributed under the License is distributed on an "AS IS" BASIS,
*   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
*   See the License for the specific language governing permissions and
*   limitations under the License.
*/

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