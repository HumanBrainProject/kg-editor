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
import { createUseStyles } from "react-jss";
import Button from "react-bootstrap/Button";

import { useStores } from "../Hooks/useStores";

import BGMessage from "../Components/BGMessage";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const useStyles = createUseStyles({
  container: {
    height: "100%",
    color: "var(--ft-color-loud)"
  }
});

const GlobalError = () => {

  const classes = useStyles();

  const { appStore } = useStores();

  const handleDismiss = () => {
    appStore.dismissGlobalError();
  };

  return (
    <div className={classes.container}>
      <BGMessage icon={"exclamation-circle"}>
          An unexpected error has occured.<br />
          We recommend you to save all your changes and reload the application in your browser.<br />
          If the problem persists, please contact the support.<br /><br />
        <Button variant={"primary"} onClick={handleDismiss}>
          <FontAwesomeIcon icon={"check"} /> &nbsp; Dismiss
        </Button>
      </BGMessage>
    </div >
  );
};

export default GlobalError;
