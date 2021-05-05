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

import React from "react";
import injectStyles from "react-jss";
import {observer} from "mobx-react";

const styles = {
  container: {
    position: "relative",
    padding: "15px",
    background: "var(--bg-color-ui-contrast2)",
    border: "1px solid var(--border-color-ui-contrast1)",
    color: "var(--ft-color-normal)",
    "& h3": {
      marginTop: 0
    },
    "& ul": {
      listStyleType: "none",
      paddingLeft: 0,
      "& li": {
        "& + li": {
          marginTop: "15px"
        },
        "& .kbd": {
          display: "inline-block",
          margin: "0 0.1em",
          padding: "0.1em 0.6em",
          border: "1px solid #ccc",
          borderRadius: "3px",
          backgroundColor: "#f7f7f7",
          fontFamily: "Arial,Helvetica,sans-serif",
          fontSize: "11px",
          lineHeight: "1.4",
          color: "#333",
          boxShadow: "0 1px 0px rgba(0, 0, 0, 0.2),0 0 0 2px #ffffff inset",
          textShadow: "0 1px 0 #fff",
          whiteSpace: "nowrap"
        }
      }
    }
  }
};

@injectStyles(styles)
@observer
export default class KeyboardShortcuts extends React.Component {
  render(){
    const { classes } = this.props;
    return (
      <div className={classes.container}>
        <h3>Keyboard shortcuts</h3>
        <ul>
          <li><span className="kbd">Alt</span> + <span className="kbd">d</span> show dashboard.</li>
          <li><span className="kbd">Alt</span> + <span className="kbd">b</span> browse the instances.</li>
          <li><span className="kbd">Ctrl</span> + click to open an instance in a new background tab.</li>
          <li><span className="kbd">Alt</span> + <span className="kbd">n</span> create a new instance.</li>
          <li><span className="kbd">Alt</span> + <span className="kbd">w</span> to close current tab.</li>
          <li><span className="kbd">Alt</span> + <span className="kbd">Shift</span> + <span className="kbd">w</span> to close all tabs.</li>
          <li><span className="kbd">Alt</span> + <span className="kbd">&#8592;</span> to active previous tab.</li>
          <li><span className="kbd">Alt</span> + <span className="kbd">&#8594;</span> to active next tab.</li>
          <li><span className="kbd">Ctrl</span> + <span className="kbd">Alt</span> + <span className="kbd">t</span> to toggle theme.</li>
        </ul>
      </div>
    );
  }
}