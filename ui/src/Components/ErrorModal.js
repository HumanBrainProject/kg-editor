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
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const useStyles = createUseStyles({
  message: {
    margin: "20px 0",
    color: "var(--ft-color-error)"
  },
  footerBar: {
    marginBottom: "10px",
    width: "100%",
    textAlign: "center",
    wordBreak: "keep-all",
    whiteSpace: "nowrap",
    "& button + button": {
      marginLeft: "20px"
    }
  },
  modal: {
    position: "absolute",
    width: "100%",
    height: "100%",
    top: 0,
    left: 0,
    background: "rgba(0, 0, 0, 0.3)",
    "& .modal-dialog": {
      top: "35%",
      width: "max-content",
      maxWidth: "800px",
      "& .modal-body": {
        padding: "30px",
        border: "1px solid var(--ft-color-loud)",
        borderRadius: "4px",
        color: "var(--ft-color-loud)",
        background: "var(--list-bg-hover)"
      }
    }
  }
});

const ErrorModal = ({message, onCancel, onRetry}) => {

  const classes = useStyles();

  return (
    <div className={classes.modal}>
      <Modal.Dialog>
        <Modal.Body>
          <div className={classes.message}>{message}</div>
          <div className={classes.footerBar}>
            <Button onClick={onCancel}>Cancel</Button>
            <Button variant="primary" onClick={onRetry}><FontAwesomeIcon icon="redo-alt" />&nbsp;Retry</Button>
          </div>
        </Modal.Body>
      </Modal.Dialog>
    </div>
  );
};

export default ErrorModal;