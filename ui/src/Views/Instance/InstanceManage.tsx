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
import GlobalFieldErrors from "../../Components/GlobalFieldErrors";

import DuplicateInstance from "./InstanceManage/DuplicateInstance";
import MoveInstance from "./InstanceManage/MoveInstance";
import DeleteInstance from "./InstanceManage/DeleteInstance";
import Instance from "../../Stores/Instance";

const useStyles = createUseStyles({
  container: {
    position: "relative",
    width: "100%",
    height: "100%",
    color: "var(--ft-color-loud)"
  },
  panel: {
    position: "relative",
    width: "60%",
    height: "calc(100% - 40px)",
    margin: "20px 20%"
  },
  content: {
    backgroundColor: "var(--bg-color-ui-contrast2)",
    color: "var(--ft-color-normal)",
    border: "1px solid var(--bg-color-blend-contrast1)",
    marginBottom: "15px",
    padding: "15px",
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
    }
  },
  id: {
    fontSize: "0.75em",
    color: "var(--ft-color-normal)",
    marginTop: "20px",
    marginBottom: "20px"
  },
  field: {
    marginBottom: "10px",
    wordBreak: "break-word"
  }
});

interface InstanceManageProps {
  instance: Instance;
}


const InstanceManage = observer(({instance}: InstanceManageProps) => {

  const classes = useStyles();

  return (
    <div className={classes.container}>
      <Scrollbars autoHide>
        <div className={classes.panel}>
          <div className={classes.content}>
            <h4>{instance.primaryType.label}</h4>
            <div className={classes.id}>
                ID: {instance.id}
            </div>
            {instance.hasFieldErrors ? <GlobalFieldErrors instance={instance} /> :
              < div className={classes.field}>
                {instance.name}
              </div>
            }
          </div>
          <DuplicateInstance instance={instance} className={classes.content} />
          <MoveInstance instance={instance} className={classes.content} />
          <DeleteInstance instance={instance} className={classes.content} />
        </div>
      </Scrollbars>
    </div>
  );
});
InstanceManage.displayName = "InstanceManage";

export default InstanceManage;