/*
 * Copyright 2018 - 2021 Swiss Federal Institute of Technology Lausanne (EPFL)
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0.
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * This open source software code was developed in part or in whole in the
 * Human Brain Project, funded from the European Union's Horizon 2020
 * Framework Programme for Research and Innovation under
 * Specific Grant Agreements No. 720270, No. 785907, and No. 945539
 * (Human Brain Project SGA1, SGA2 and SGA3).
 *
 */

const theme = {
  name: "bright",
  background: {
    gradient: {
      colorStart: "#ffffff",
      colorEnd: "a8caba",
      angle: "165deg"
    },
    image: `${window.rootPath}/assets/background-bright.png`,
    position: "50% 50%"
  },
  backgroundColor: "#f4fbf7",
  button: {
    primary: {
      backgroundColor: "#007bff",
      borderColor: "#007bff",
      active: {
        backgroundColor: "#0069d9",
        borderColor: "#0062cc"
      }
    },
    secondary: {
      backgroundColor: "#6c757d",
      borderColor: "#6c757d",
      active: {
        backgroundColor: "#545b62",
        borderColor: "#4e555b"
      }
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
  contrast6: {
    backgroundColor: "#ffffff",
    borderColor: "#ffffff"
  },
  blendContrast1: {
    backgroundColor: "rgba(0, 0, 0, 0.1)"
  },
  list: {
    hover: {
      backgroundColor: "#aee0c8",
      borderColor: "#368c62"
    },
    selected: {
      backgroundColor: "#68c498",
      borderColor: "#2f7955"
    }
  },
  quiet: {
    color: "rgba(0, 0, 0, 0.4)"
  },
  normal: {
    color: "#1a202c"
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
    color: "#e67e22",
    quiet: {
      backgroundColor: "#473600"
    },
    normal: {
      backgroundColor: "#8f6b00"
    },
    loud: {
      backgroundColor: "#b88a00"
    }
  },
  info: {
    color: "#24282a",
    normal: {
      color: "#ffc107"
    }
  },
  selected: {
    color: "#45b07c",
    hover: {
      color: "#2f7955"
    }
  },
  link: {
    hover: {
      color: "#143048",
      borderColor: "#368c62",
      backgroundColor: "#aee0c8"
    },
    quiet: {
      hover: {
        backgroundColor: "#effbf5"
      }
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