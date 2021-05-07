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
//import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { observer } from "mobx-react-lite";
//import Modal from "react-bootstrap/Modal";
//import Button from "react-bootstrap/Button";

//import { useStores } from "../Hooks/UseStores";

import Instances from "./Browse/Instances";
//import FetchingLoader from "../Components/FetchingLoader";
import NavigationPanel from "./Browse/NavigationPanel";

const useStyles = createUseStyles({
  container: {
    display:"grid",
    gridTemplateColumns:"318px 1fr",
    gridTemplateRows:"1fr",
    overflow:"hidden",
    height:"100%"
  },
  modal: {
    "&.modal-dialog": {
      marginTop: "25%",
      "& .modal-content": {
        background: "var(--list-bg-hover)",
        border: "1px solid var(--list-border-hover)",
        boxShadow: "none",
        "& .modal-body": {
          color: "var(--ft-color-loud)",
          padding: "0 20px 5px 20px",
          textAlign: "center",
        },
        "& .modal-header": {
          padding: "10px 10px 0 0",
          border: 0,
          "& button.close": {
            color: "var(--ft-color-loud)",
            opacity: 0.5,
            "&:hover": {
              opacity: 1
            }
          }
        },
        "& .modal-footer": {
          border: 0,
          textAlign: "center",
          "& .btn": {
            padding: "6px 18px"
          },
          "& .btn + .btn": {
            marginLeft: "30px"
          }
        }
      }
    }
  },
  loader:{
    position:"absolute",
    top:0,
    left:0,
    width: "100%",
    height: "100%",
    zIndex: 10000,
    "& [class*=fetchingPanel]": {
      width: "auto",
      padding: "30px",
      border: "1px solid var(--list-border-hover)",
      borderRadius: "4px",
      color: "var(--ft-color-loud)",
      background: "var(--list-bg-hover)"
    }
  }
});

const Browse = observer(() => {

  const classes = useStyles();

  // const { browseStore, bookmarkStore } = useStores();

  // const handleDismissBookmarkCreationError = () => {
  //   bookmarkStore.dismissBookmarkCreationError();
  // };

  // const handleRetryCreateNewBookmark = () => {
  //   bookmarkStore.createBookmark(bookmarkStore.newBookmarkName);
  // };

  // return (
  //   <div className={classes.container}>
  //     <NavigationPanel />
  //     <Instances/>
  //     <Modal
  //       dialogClassName={classes.modal}
  //       show={!!browseStore.bookmarkListCreationError}
  //       keyboard={true}
  //       autoFocus={true}
  //       onHide={handleDismissBookmarkCreationError}
  //       backdrop={false}
  //     >
  //       <Modal.Header
  //         closeButton={true}
  //       />
  //       <Modal.Body>{`Creation of bookmark list "${bookmarkStore.newBookmarkName}" failed (${bookmarkStore.bookmarkCreationError}).`} </Modal.Body>
  //       <Modal.Footer>
  //         <Button onClick={handleDismissBookmarkCreationError}><FontAwesomeIcon icon="undo-alt"/>&nbsp;Cancel</Button>
  //         <Button variant="primary" onClick={handleRetryCreateNewBookmark}><FontAwesomeIcon icon="redo-alt"/>&nbsp;Retry</Button>
  //       </Modal.Footer>
  //     </Modal>
  //     {bookmarkStore.isCreatingBookmark && (
  //       <div className={classes.loader}>
  //         <FetchingLoader>{`Creating a bookmark list "${bookmarkStore.newBookmarkName}"...`}</FetchingLoader>
  //       </div>
  //     )}
  //   </div>
  // );

  return(
    <div className={classes.container}>
      <NavigationPanel />
      <Instances/>
    </div>
  );
});
Browse.displayName = "Browse";

export default Browse;