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
import { observer } from "mobx-react-lite";
import { createUseStyles } from "react-jss";
import { Scrollbars } from "react-custom-scrollbars-2";
import ReactJson from "react-json-view";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import ThemeRJV from "../../Themes/ThemeRJV";
import Instance from "../../Stores/Instance";

const useStyles = createUseStyles({
  container: {
    position: "relative",
    width: "100%",
    height: "100%",
    padding: "10px",
    color: "var(--ft-color-normal)"
  },
  panel: {
    display: "flex",
    flexDirection: "column",
    height: "100%",
    padding: "15px",
    background: "var(--bg-color-ui-contrast2)",
    border: "1px solid var(--border-color-ui-contrast1)",
    overflow: "hidden",
    position: "relative"
  },
  content: {
    flex: 1,
    margin: "15px 0",
    padding: "10px 0 10px 10px",
    border: "1px solid var(--border-color-ui-contrast1)"
  },
  types: {
    marginBottom: "10px"
  },
  type: {
    paddingRight: "10px"
  },
  label: {
    margin: "0"
  },
  id: {
    fontSize: "0.75em"
  }
});

interface InstanceRawProps {
  instance: Instance;
}


const InstanceRaw = observer(({instance}: InstanceRawProps) => {

  const classes = useStyles();

  return (
    <div className={classes.container}>
      <div className={classes.panel}>
        {instance.types && !!instance.types.length && (
          <h6 className={classes.types}>
            {instance.types && instance.types.map(({name, label, color}) => (
              <span key={name} className={classes.type} title={name}><FontAwesomeIcon icon={"circle"} color={color}/>&nbsp;&nbsp;<span>{label?label:name}</span></span>
            ))}
          </h6>
        )}
        {instance.name && (
          <h5 className={classes.label}>
            {instance.name}
          </h5>
        )}
        <div className={classes.content}>
          <Scrollbars autoHide>
                <ReactJson collapsed={1} name={false} theme={ThemeRJV} src={instance.rawData} />
          </Scrollbars>
        </div>
        <div className={classes.id}>
          <div>ID: {instance.id}</div>
          {instance.space && (
            <div>Space: {instance.space}</div>
          )}
        </div>
      </div>
    </div>
  );
});
InstanceRaw.displayName = "InstanceRaw";

export default InstanceRaw;