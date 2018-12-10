import React from "react";
import injectStyles from "react-jss";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { observer } from "mobx-react";
import { Modal, Button } from "react-bootstrap";

import Lists from "./Browse/Lists";
import Instances from "./Browse/Instances";
import browseStore from "../Stores/BrowseStore";
import FetchingLoader from "../Components/FetchingLoader";

const styles = {
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
};

@injectStyles(styles)
@observer
export default class Search extends React.Component{
  handleDismissBookmarkListCreationError = () => {
    browseStore.dismissBookmarkListCreationError();
  }

  handleRetryCreateNewBookmarkList= () => {
    browseStore.createBookmarkList(browseStore.newBookmarkListName);
  }

  render = () => {
    const {classes} = this.props;

    return(
      <div className={classes.container}>
        <Lists/>
        <Instances/>
        <Modal
          dialogClassName={classes.modal}
          show={!!browseStore.bookmarkListCreationError}
          keyboard={true}
          autoFocus={true}
          onHide={this.handleDismissBookmarkListCreationError.bind(this)}
          backdrop={false}
        >
          <Modal.Header
            closeButton={true}
          />
          <Modal.Body>{`Creation of bookmark list "${browseStore.newBookmarkListName}" failed (${browseStore.bookmarkListCreationError}).`} </Modal.Body>
          <Modal.Footer>
            <Button onClick={this.handleDismissBookmarkListCreationError.bind(this)}><FontAwesomeIcon icon="undo-alt"/>&nbsp;Cancel</Button>
            <Button bsStyle="primary" onClick={this.handleDismissBookmarkListCreationError.bind(this)}><FontAwesomeIcon icon="redo-alt"/>&nbsp;Retry</Button>
          </Modal.Footer>
        </Modal>
        {browseStore.isCreatingBookmarkList && (
          <div className={classes.loader}>
            <FetchingLoader>{`Creating a bookmark list "${browseStore.newBookmarkListName}"...`}</FetchingLoader>
          </div>
        )}
      </div>
    );
  }
}