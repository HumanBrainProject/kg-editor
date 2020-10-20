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
import { createUseStyles } from "react-jss";
import { Row, Col } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

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

class HeaderPanel extends React.Component{

  componentDidMount() {
    if (this.props.highlight) {
      this.scrollIntoView();
    }
  }

  componentDidUpdate(prevProps) {
    if (this.props.highlight && this.props.highlight !== prevProps.highlight) {
      this.scrollIntoView();
    }
  }

  scrollIntoView = ()=> {
    this.scrollIntoViewRef && this.scrollIntoViewRef.scrollIntoView({behavior:"smooth", block:"center"});
  }

  render(){
    const classes = useStyles();
    const { className, types, hasChanged } = this.props;
    return(
      <div className={`${classes.panel} ${className ? className : ""}`}>
        <Row>
          <Col xs={12}>
            <h6 ref={ref => this.scrollIntoViewRef = ref}>
              {types && types.map(({name, label, color}) => (
                <span key={name} className={classes.type} title={name}><FontAwesomeIcon icon={"circle"} color={color}/>&nbsp;&nbsp;<span>{label?label:name}</span></span>
              ))}
            </h6>
          </Col>
        </Row>
        {hasChanged &&
          <div className={classes.hasChanged}>
            <FontAwesomeIcon icon={"exclamation-triangle"}/>&nbsp;
            <FontAwesomeIcon icon={"caret-right"}/>&nbsp;
            <FontAwesomeIcon icon={"pencil-alt"}/>
          </div>
        }
      </div>
    );
  }
}

export default HeaderPanel;