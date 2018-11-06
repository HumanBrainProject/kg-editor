import React from "react";
import injectStyles from "react-jss";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { observer } from "mobx-react";

import Lists from "./Search/Lists";
import Instances from "./Search/Instances";
import searchStore from "../Stores/SearchStore";
import { Modal, Button } from "react-bootstrap";

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
  }
};

@injectStyles(styles)
@observer
export default class Search extends React.Component{
  handleDismissBookmarkListCreationError = () => {
    searchStore.dismissBookmarkListCreationError();
  }

  handleRetryCreateNewBookmarkList= () => {
    searchStore.createBookmarkList(searchStore.newBookmarkListName);
  }

  render = () => {
    const {classes} = this.props;

    return(
      <div className={classes.container}>
        <Lists/>
        <Instances/>
        <Modal
          dialogClassName={classes.modal}
          show={!!searchStore.bookmarkListCreationError}
          keyboard={true}
          autoFocus={true}
          onHide={this.handleDismissBookmarkListCreationError.bind(this)}
          backdrop={false}
        >
          <Modal.Header
            closeButton={true}
          />
          <Modal.Body>{`Creation of bookmark list "${searchStore.newBookmarkListName}" failed (${searchStore.bookmarkListCreationError}).`} </Modal.Body>
          <Modal.Footer>
            <Button onClick={this.handleDismissBookmarkListCreationError.bind(this)}><FontAwesomeIcon icon="undo-alt"/>&nbsp;Cancel</Button>
            <Button bsStyle="primary" onClick={this.handleDismissBookmarkListCreationError.bind(this)}><FontAwesomeIcon icon="redo-alt"/>&nbsp;Retry</Button>
          </Modal.Footer>
        </Modal>
      </div>
    );
  }
}