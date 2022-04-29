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
import { observer } from "mobx-react-lite";
import { Scrollbars } from "react-custom-scrollbars-2";
import Modal from "react-bootstrap/Modal";
import { useLocation, useNavigate } from "react-router-dom";

import { useStores } from "../Hooks/UseStores";

const useStyles = createUseStyles({
  container: {
    width: "100%",
    height: "100%",
    color: "var(--ft-color-normal)"
  },
  workspacesSelection: {
    fontSize: "1.5em",
    padding: "30px 0",
    "& h1": {
      padding: "0 30px 20px 30px"
    },
    "& p": {
      padding: "0 30px",
      fontWeight: "300"
    }
  },
  spaces: {
    display: "grid",
    padding: "0 30px",
    gridGap: "15px",
    gridTemplateColumns: "repeat(1fr)",
    "@media screen and (min-width:768px)": {
      gridTemplateColumns: "repeat(2, 1fr)"
    },
    "@media screen and (min-width:1024px)": {
      gridTemplateColumns: "repeat(3, 1fr)"
    }
  },
  space: {
    position: "relative",
    padding: "20px",
    background: "var(--bg-color-ui-contrast3)",
    border: "1px solid var(--border-color-ui-contrast2)",
    borderRadius: "10px",
    cursor: "pointer",
    fontWeight: "300",
    textAlign: "center",
    fontSize: "1.2em",
    wordBreak: "break-word",
    alignSelf: "center",
    transition: "background .3s ease-in-out, color .3s ease-in-out",
    "&:hover": {
      background: "var(--bg-color-blend-contrast1)",
      color: "var(--ft-color-loud)",
    }
  },
  workspaceSelectionModal: {
    overflow: "hidden",
    width: "90%",
    margin: "auto",
    "@media screen and (min-width:1024px)": {
      width: "900px"
    },
    "&.modal-dialog": {
      marginTop: "25vh",
      maxWidth: "unset",
      "& .modal-content": {
        background: "var(--bg-color-ui-contrast2)",
        color: "var(--ft-color-normal)",
        border: "1px solid var(--border-color-ui-contrast1)",
        "& .modal-body": {
          padding: "0",
          maxHeight: "calc(100vh - 30vh -80px)",
          overflowY: "hidden"
        }
      }
    }
  }
});

const SpaceModal = observer(() => {

  const classes = useStyles();

  const location = useLocation();
  const navigate = useNavigate();

  const { appStore, authStore } = useStores();

  const handleClick = space => appStore.setCurrentSpace(location, navigate, space);

  return (
    <div className={classes.container}>
      <Modal dialogClassName={classes.workspaceSelectionModal} show={true} >
        <Modal.Body>
          <div className={classes.workspacesSelection}>
            <h1>Welcome <span title={authStore.firstName}>{authStore.firstName}</span></h1>
            <p>Please select a space:</p>
            <div style={{height: `${Math.round(Math.min(window.innerHeight * 0.5 - 140, Math.ceil(authStore.spaces.length / 3) * 90))}px`}}>
              <Scrollbars>
                <div className={classes.spaces}>
                  {authStore.spaces.map(space =>
                    <div className={classes.space} key={space.id} onClick={() => handleClick(space.id)}>{space.name||space.id}</div>
                  )}
                </div>
              </Scrollbars>
            </div>
          </div>
        </Modal.Body>
      </Modal>
    </div>
  );
});
SpaceModal.displayName = "SpaceModal";

export default SpaceModal;