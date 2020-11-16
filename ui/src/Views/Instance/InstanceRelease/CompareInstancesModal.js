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
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import { Scrollbars } from "react-custom-scrollbars";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { useStores } from "../../../Hooks/UseStores";

import CompareWithReleasedVersionChanges from "../CompareWithReleasedVersionChanges";

const useStyles = createUseStyles({
  container: {
    width: "90%",
    "@media screen and (min-width:1024px)": {
      width: "900px",
      maxWidth: "unset"
    },
    "& .modal-header": {
      overflow: "hidden",
      whiteSpace: "nowrap",
      textOverflow: "ellipsis"
    },
    "& .modal-body": {
      height: "calc(95vh - 112px)",
      padding: "3px 0"
    }
  },
});

const CompareInstancesModal = observer(() => {

  const classes = useStyles();

  const { releaseStore } = useStores();

  const handleHideCompare = e => {
    e && e.stopPropagation();
    releaseStore.setComparedInstance(null);
  };

  return(
    <Modal
      show={true}
      dialogClassName={classes.container}
      onHide={handleHideCompare}
    >
      <Modal.Header closeButton>
        Compare with the released version of &nbsp;
        <strong>
          {releaseStore.comparedInstance.type}&nbsp;
          {releaseStore.comparedInstance.label}
        </strong>
      </Modal.Header>
      <Modal.Body>
        <Scrollbars autoHide>
          <CompareWithReleasedVersionChanges
            instanceId={releaseStore.comparedInstance.id}
            status={releaseStore.comparedInstance.status}
          />
        </Scrollbars>
      </Modal.Body>
      <Modal.Footer>
        <Button size="sm" onClick={handleHideCompare} >
          <FontAwesomeIcon icon="times" />&nbsp;Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
});
CompareInstancesModal.displayName = "CompareInstancesModal";

export default CompareInstancesModal;