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

import React, { useEffect, useRef } from "react";
import { createUseStyles } from "react-jss";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { observer } from "mobx-react-lite";

const useStyles = createUseStyles({
  panel: {
    position:"relative",
    "& h6": {
      margin: "0 !important",
      color: "#333",
      fontWeight: "bold"
    }
  },
  hasChanged: {
    position:"absolute",
    top:5,
    right:10,
    color:"#e67e22"
  },
  type: {
    paddingRight: "10px"
  }
});


const getElementToScroll = elem => {
  while(elem !== null && !elem.className.startsWith("scrolledView")) {
    elem = elem.parentElement;
  }
  if(elem !== null) {
    elem  = elem.parentElement;
  }
  return elem;
};

const getScrollTop = elem => {
  let distance = 0;
  while(elem !== null && !elem.attributes["data-id"]) {
    elem = elem.parentElement;
    if(elem !== null) {
      distance += elem.offsetTop;
    }
  }
  return distance;
};


const HeaderPanel = observer(({ className, types, hasChanged, highlight }) => {

  const classes = useStyles();

  const scrollIntoViewRef = useRef();

  useEffect(() => {
    if (highlight) {
      const distance = getScrollTop(scrollIntoViewRef.current);
      const elem = getElementToScroll(scrollIntoViewRef.current);
      if(elem) {
        elem.scrollTo({
          top: distance - 20, // -20 because scrolledView contains padding-top:20px;
          behavior: "smooth"
        });
      }
    }
  }, [highlight]);

  return (
    <div className={`${classes.panel} ${className ? className : ""}`}>
      <Row>
        <Col xs={12}>
          <h6 ref={scrollIntoViewRef}>
            {types && types.map(({name, label, color}) => (
              <span key={name} className={classes.type} title={name}><FontAwesomeIcon icon={"circle"} color={color}/>&nbsp;&nbsp;<span>{label?label:name}</span></span>
            ))}
          </h6>
        </Col>
      </Row>
      {hasChanged && (
        <div className={classes.hasChanged}>
          <FontAwesomeIcon icon={"exclamation-triangle"}/>&nbsp;
          <FontAwesomeIcon icon={"caret-right"}/>&nbsp;
          <FontAwesomeIcon icon={"pencil-alt"}/>
        </div>
      )}
    </div>
  );
});
HeaderPanel.displayName = "HeaderPanel";

export default HeaderPanel;