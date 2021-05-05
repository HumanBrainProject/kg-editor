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
import { Scrollbars } from "react-custom-scrollbars";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import SavedQuery from "./SavedQuery";

let styles = {
  container:{
    display:"grid",
    gridTemplateRows:"auto 1fr",
    height: "100%",
    border: "1px solid var(--border-color-ui-contrast5)",
    borderRadius: "10px 10px 0 0",
    padding: "10px",
    background: "var(--bg-color-ui-contrast3)",
    color: "var(--ft-color-loud)",
    transition: "border-radius 0.3s ease",
    "& > div > div:first-child": {
      overflowX: "hidden !important"
    },
    "& > div > div:nth-child(2)": {
      display: "none !important"
    },
    "&.collapsed": {
      borderRadius: 0,
      "& $title": {
        marginBottom: 0,
        paddingBottom: 0,
        borderBottom: 0
      },
      "& $toggleButton": {
        transform: "rotateX(180deg)"
      }
    }
  },
  title: {
    display: "flex",
    marginBottom: "10px",
    paddingBottom: "10px",
    borderBottom: "1px solid var(--border-color-ui-contrast5)",
    "& button": {
      display: "inline-block",
      margin: 0,
      padding: 0,
      border: 0,
      background: "transparent",
      outline: 0,
      "&:hover": {
        outline: 0
      }
    },
    "& h4": {
      flex: 1,
      display: "inline-block",
      margin: 0,
      padding: 0,
      "& small":{
        color:"var(--ft-color-quiet)",
        fontStyle:"italic"
      }
    },
    "& button.refresh-btn": {
      color: "var(--ft-color-normal)"
    }
  },
  toggleButton: {
    "& svg": {
      transition: "transform 0.3s ease"
    },
    "& + h4": {
      margin: "0 0 0 6px",
      cursor: "pointer"
    }
  }
};

@injectStyles(styles)
@observer
export default class SavedQueries extends React.Component{
  render(){
    const {classes, title, subTitle, list, expanded, onExpandToggle, onRefresh, showUser, enableDelete } = this.props;

    return (
      <div className={`${classes.container} ${expanded !== false?"":"collapsed"}`}>
        {title && (
          <div className={classes.title}>
            {typeof onExpandToggle === "function" && (
              <button className={`toggle-btn ${classes.toggleButton}`} onClick={onExpandToggle}><FontAwesomeIcon icon="angle-down"/></button>
            )}
            <h4 onClick={onExpandToggle}>{title}<small>{subTitle?(" - " + subTitle):""}</small></h4>
            {typeof onRefresh === "function" && (
              <button className="refresh-btn" onClick={onRefresh} title="Refresh"><FontAwesomeIcon icon="redo-alt"/></button>
            )}
          </div>
        )}
        {expanded !== false || !title?
          !list || !list.length?
            <div>no saved queries yet.</div>
            :
            <Scrollbars autoHide>
              {list.map(query => (
                <SavedQuery key={query.id} query={query} showUser={showUser} enableDelete={enableDelete} />
              ))}
            </Scrollbars>
          :
          null
        }
      </div>
    );
  }
}