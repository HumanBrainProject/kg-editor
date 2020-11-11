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

const theme = {
  name: "bright",
  background: {
    gradient: {
      colorStart: "#ffffff",
      colorEnd: "a8caba",
      angle: "165deg"
    }
  },
  contrast1: {
    backgroundColor: "#ffffff",
    borderColor: "#ffffff"
  },
  contrast2: {
    backgroundColor: "#eeeeee",
    borderColor: "#ffffff"
  },
  contrast3: {
    borderColor: "#dddddd"
  },
  contrast4: {
    backgroundColor: "#cccccc"
  },
  contrast5: {
    borderColor: "rgba(0, 0, 0, 0.3)"
  },
  blendContrast1: {
    backgroundColor: "rgba(0, 0, 0, 0.1)"
  },
  list: {
    hover: {
      backgroundColor: "#def0fd",
      borderColor: "#68b6f5"
    },
    selected: {
      backgroundColor: "#c6e2f5",
      borderColor: "#259dff"
    }
  },
  quiet: {
    color: "rgba(0, 0, 0, 0.4)"
  },
  normal: {
    color: "rgba(0, 0, 0, 0.5)"
  },
  loud: {
    color: "#444444"
  },
  louder: {
    color: "#222222"
  },
  error: {
    color: "#e74c3c",
    quiet: {
      color: "#5b130b"
    },
    normal: {
      color: "#ac2415"
    },
    loud: {
      color: "#ac2415"
    }
  },
  warn: {
    quiet: {
      color: "#473600"
    },
    normal: {
      color: "#8f6b00"
    },
    loud: {
      color: "#b88a00"
    }
  },
  info: {
    color: "#24282a",
    normal: {
      color: "#ffc107"
    }
  },
  pane: {
    boxShadow: {
      color: "rgba(0,0,0,0.3)"
    }
  },
  release: {
    status: {
      boxShadow: {
        color: "#00000080"
      },
      released: {
        backgroundColor: "rgba(52, 152, 219, 0.25)",
        color: "rgb(52, 152, 219)"
      },
      notReleased: {
        backgroundColor: "rgba(231, 76, 60, 0.25)",
        color: "rgb(231, 76, 60)"
      },
      hasChanged: {
        backgroundColor: "rgba(241, 196, 15, 0.25)",
        color: "rgb(241, 196, 15)"
      }
    },
    highlight: {
      backgroundColor: "rgb(46, 204, 113, 0.25)",
      color: "rgb(46, 204, 113)"
    }
  },
  bookmark: {
    on: {
      color: "#f2c85c",
      highlight: {
        color: "#ffe100"
      }
    }
  }
};

export default theme;