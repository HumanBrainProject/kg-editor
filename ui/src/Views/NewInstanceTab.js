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

import React, { useState } from "react";
import { observer } from "mobx-react-lite";
import { useNavigate } from "react-router-dom";
import { createUseStyles } from "react-jss";
import Modal from "react-bootstrap/Modal";
import _  from "lodash-uuid";

import { useStores } from "../Hooks/useStores";

import Tab from "../Components/Tab";
import TypeSelection from "./Instance/TypeSelection";
import Matomo from "../Services/Matomo";

const useStyles = createUseStyles({
  typeSelectionModal: {
    overflow: "hidden",
    width: "90%",
    margin: "auto",
    "@media screen and (min-width:1024px)": {
      width: "900px"
    },
    "&.modal-dialog": {
      marginTop: "5vh",
      maxWidth: "unset",
      "& .modal-content": {
        background: "var(--bg-color-ui-contrast2)",
        color: "var(--ft-color-normal)",
        border: "1px solid var(--border-color-ui-contrast5)",
        "& .modal-header": {
          borderBottom: "1px solid var(--border-color-ui-contrast5)"
        },
        "& .modal-body": {
          padding: "0",  
          height: "80vh",
          overflowY: "hidden"
        }
      }
    }
  }
});


const NewInstanceTab = observer(() => {
  const [showTypeSelection, setShowTypeSelection] = useState(false);
  const classes = useStyles();

  const { appStore, typeStore, instanceStore } = useStores();
  const navigate = useNavigate();

  const handleCreateInstance = () => {
    Matomo.trackEvent("Tab", "CreateInstance");
    setShowTypeSelection(true);
  };

  const handleTypeSelection = type => {
    setShowTypeSelection(false);
    const uuid = uuidv4();
    instanceStore.setInstanceIdAvailability(type, uuid);
    navigate(`/instances/${uuid}/create`);
  }

  const handleClose = () => setShowTypeSelection(false);

  const canCreate = appStore.currentSpacePermissions.canCreate && !typeStore.isFetching && typeStore.isFetched && !!typeStore.filteredTypes.filter(t => t.canCreate !== false).length;

  if (!canCreate) {
    return null;
  }

  return (
    <>
      <Tab icon={"file"} onClick={handleCreateInstance} hideLabel label={"New instance"} />
      <Modal dialogClassName={classes.typeSelectionModal} show={showTypeSelection} onHide={handleClose}>
        <Modal.Header closeButton closeVariant="white">
          <Modal.Title>Create a new instance</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <TypeSelection onSelect={handleTypeSelection} />
        </Modal.Body>
      </Modal>
    </>
  );
});
NewInstanceTab.displayName = "NewInstanceTab";

export default NewInstanceTab;

