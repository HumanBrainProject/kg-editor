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
      "--bg-gradient-start":"#1C2022",
      "--bg-gradient-end":"#4895a4",
      "--bg-gradient-angle":"165deg",

      "--bg-color-ui-contrast1":"#141618",
      "--bg-color-ui-contrast2":"#24282a",
      "--bg-color-ui-contrast3":"#2B3032",
      "--bg-color-ui-contrast4":"#4f5658",

      "--border-color-ui-contrast1":"#111314",
      "--border-color-ui-contrast2":"#141618",
      "--border-color-ui-contrast5":"rgba(255, 255, 255, 0.3)",

      "--bg-color-blend-contrast1":"rgba(0, 0, 0, 0.2)",

      "--list-bg-hover":"#2b353c",
      "--list-border-hover":"#266ea1",
      "--list-bg-selected":"#39464f",
      "--list-border-selected":"#6caddc",

      "--ft-color-quiet":"rgba(255, 255, 255, 0.4)",
      "--ft-color-normal":"rgba(255, 255, 255, 0.5)",
      "--ft-color-loud":"rgb(224, 224, 224)",
      "--ft-color-louder":"rgb(244, 244, 244)",

      "--ft-color-error":"#e74c3c",
      "--bg-color-error-quiet":"#5b130b",
      "--bg-color-error-normal":"#ac2415",
      "--bg-color-error-loud":"#ac2415",

      "--bg-color-warn-quiet":"#473600",
      "--bg-color-warn-normal":"#8f6b00",
      "--bg-color-warn-loud":"#b88a00",

      "--ft-color-info":"#24282a",
      "--bg-color-info-normal":"#ffc107",

      "--pane-box-shadow":"#333",
      "--release-status-box-shadow":"#00000080",
      "--release-color-released":"rgb(52, 152, 219)",
      "--release-bg-released":"rgba(52, 152, 219, 0.25)",
      "--release-color-not-released":"rgb(231, 76, 60)",
      "--release-bg-not-released":"rgba(231, 76, 60, 0.25)",
      "--release-color-has-changed":"rgb(241, 196, 15)",
      "--release-bg-has-changed":"rgba(241, 196, 15, 0.25)",

      "--release-color-highlight":"rgb(46, 204, 113)",
      "--release-bg-highlight":"rgb(46, 204, 113, 0.25)",

      "--bookmark-on-color":"#EFEC2D",
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