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
import { observer } from "mobx-react-lite";
import { createUseStyles } from "react-jss";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Form from "react-bootstrap/Form";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import { Scrollbars } from "react-custom-scrollbars";
import Field from "../../../Fields/Field";

const useStyles = createUseStyles({
  container: {
    position: "relative",
    width: "calc(100% - 2px)",
    height: "100%",
    "& h4": {
      marginBottom: "15px"
    },
    "& p": {
      marginBottom: "15px"
    },
    "& ul": {
      marginBottom: "15px"
    },
    "& strong": {
      color: "var(--ft-color-louder)"
    },
    "& > div:first-child > div:first-child": {
      overflowY: "auto !important"
    }
  },
  panel: {
    padding: "15px",
    border: "1px solid var(--bg-color-blend-contrast1)",
    backgroundColor: "var(--bg-color-ui-contrast2)",
    color: "var(--ft-color-normal)"
  },
  header: {
    padding: "0 0 10px 0",
    "& h6": {
      margin: "0 !important",
      color: "var(--ft-color-normal)",
      fontWeight: "bold"
    }
  },
  field:{
    marginBottom:"10px",
    wordBreak:"break-word"
  },
  info:{
    color:"grey",
    fontWeight:"300",
    fontSize:"0.7em",
    wordBreak: "break-all"
  }
});

const InstanceInvite = observer(({ instance }) => {

  const classes = useStyles();

  if (!instance || instance.isFetching || instance.hasFetchError) {
    return null;
  }

  const nodeType = instance.primaryType.label;
  const color = instance.primaryType.color;
  const fields = [...instance.nonPromotedFields, ...instance.promotedFields];

  return (
    <div className={classes.container}>
      <Scrollbars autoHide>
        <div>
          <div className={classes.panel}>
            <div className={classes.header}>
              <Row>
                <Col xs={12}>
                  <h6>
                    <FontAwesomeIcon icon={"circle"} color={color?color:undefined}/>&nbsp;&nbsp;<span>{nodeType}</span>
                  </h6>
                </Col>
              </Row>
            </div>
            <Form>
              {fields.map(name => {
                const fieldStore = instance.fields[name];
                return (
                  <Field key={name} name={name} className={classes.field} fieldStore={fieldStore} readMode={true} showIfNoValue={false} />
                );
              })}
            </Form>
            <div>
              <Row>
                <Col xs={12}>
                  <div className={classes.info}>
                    <div>ID: {instance.id}</div>
                    <div>Workspace: {instance.workspace}</div>
                  </div>
                </Col>
              </Row>
            </div>
          </div>
        </div>
      </Scrollbars>
    </div>
  );
});

export default InstanceInvite;