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
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import { observer } from "mobx-react-lite";
import { createUseStyles } from "react-jss";
import Iframe from "react-iframe";

const useStyles = createUseStyles({
  frameContainer: {
    height: "100%"
  },
  greatModal: {
    "& .modal-dialog": {
      maxWidth: "unset",
      width: "60%",
      height: "95%"
    },
    "& .modal-content": {
      height: "100%",
      minHeight: "100%",
      backgroundColor: "var(--bg-color-ui-contrast3)"
    },
    "& .modal-body": {
      height: "94%"
    }
  },
  frame: {
    border: "0",
    minHeight: "100%",
    minWidth: "100%"
  }
});

const getUrl = instanceId => {
  switch(window.location.hostname) {
    case "localhost":
    case "editor.kg-dev.ebrains.eu":
      return `https://search.kg-dev.ebrains.eu/live/${instanceId}`;
    case "editor.kg-int.ebrains.eu":
      return `https://search.kg-int.ebrains.eu/live/${instanceId}`;
    case "editor.kg-ppd.ebrains.eu":
      return `https://search.kg-ppd.ebrains.eu/live/${instanceId}`;
    case "editor.kg.ebrains.eu":
    default:
      return `https://kg.ebrains.eu/search/live/${instanceId}`;
  }
}

const ClientPreviewModal = observer(({ store, show, handleClose }) => {

  const classes = useStyles();

  const url = getUrl(store.topInstanceId); 

  return (
    <Modal show={show} className={classes.greatModal}>
      <Modal.Body>
        <div className={classes.frameContainer}>
          <Iframe url={url}
            width="100%"
            height="100%"
            id={store.topInstanceId}
            className={classes.frame}
            display="initial"
            position="relative" />
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button onClick={handleClose} variant="primary">Close</Button>
      </Modal.Footer>
    </Modal>
  );
});
ClientPreviewModal.displayName = "ClientPreviewModal";

export default ClientPreviewModal;