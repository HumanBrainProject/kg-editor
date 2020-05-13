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

import React from "react";
import injectStyles from "react-jss";

const styles = {
  "@global":{
    ":root":{
      "--bg-gradient-start":"#ffffff",
      "--bg-gradient-end":"#a8caba",
      "--bg-gradient-angle":"165deg",

      "--bg-color-ui-contrast1":"#ffffff",
      "--bg-color-ui-contrast2":"#eeeeee",
      "--bg-color-ui-contrast3":"#dddddd",
      "--bg-color-ui-contrast4":"#cccccc",

      "--border-color-ui-contrast1":"#ffffff",
      "--border-color-ui-contrast2":"#ffffff",
      "--border-color-ui-contrast5":"rgba(0, 0, 0, 0.3)",

      "--bg-color-blend-contrast1":"rgba(0, 0, 0, 0.1)",

      "--list-bg-hover":"#def0fd",
      "--list-border-hover":"#68b6f5",
      "--list-bg-selected":"#c6e2f5",
      "--list-border-selected":"#259dff",

      "--ft-color-quiet":"rgba(0, 0, 0, 0.4)",
      "--ft-color-normal":"rgba(0, 0, 0, 0.5)",
      "--ft-color-loud":"#444444",
      "--ft-color-louder":"#222222",

      "--ft-color-error":"#e74c3c",
      "--bg-color-error-quiet":"#5b130b",
      "--bg-color-error-normal":"#ac2415",
      "--bg-color-error-loud":"#ac2415",

      "--bg-color-warn-quiet":"#473600",
      "--bg-color-warn-normal":"#8f6b00",
      "--bg-color-warn-loud":"#b88a00",

      "--ft-color-info":"#24282a",
      "--bg-color-info-normal":"#ffc107",

      "--pane-box-shadow":"rgba(0,0,0,0.3)",
      "--release-status-box-shadow":"#00000080",
      "--release-color-released":"rgb(52, 152, 219)",
      "--release-bg-released":"rgba(52, 152, 219, 0.25)",
      "--release-color-not-released":"rgb(231, 76, 60)",
      "--release-bg-not-released":"rgba(231, 76, 60, 0.25)",
      "--release-color-has-changed":"rgb(241, 196, 15)",
      "--release-bg-has-changed":"rgba(241, 196, 15, 0.25)",

      "--release-color-highlight":"rgb(46, 204, 113)",
      "--release-bg-highlight":"rgb(46, 204, 113, 0.25)",

      "--bookmark-on-color":"#f2c85c",
      "--bookmark-on-color-highlight":"#ffe100",
      "--bookmark-off-color":"var(--ft-color-normal)",
      "--bookmark-off-color-highlight":"var(--bookmark-on-color-highlight)"
    }
  }
};

@injectStyles(styles)
export default class Theme extends React.Component{
  render(){
    return null;
  }
}