import React from "react";
import { Modal, Button } from "react-bootstrap";
import { observer } from "mobx-react";
import injectStyles from "react-jss";
import Iframe from "react-iframe";

let styles = {
  frameContainer: {
    height: "100%"
  },
  greatModal: {
    "& .modal-dialog": {
      width: "60%",
      height: "95%",
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
    minWidth: "100%",
  }
};

@injectStyles(styles)
@observer
export default class ClientPreviewModal extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.url = `https://kg.ebrains.eu/search/live/${props.store.topInstanceId}`;
  }

  render() {
    const { show, handleClose, classes } = this.props;
    return (
      <Modal show={show} className={classes.greatModal}>
        <Modal.Body>
          <div className={classes.frameContainer}>
            <Iframe url={this.url}
              width="100%"
              height="100%"
              id="myId"
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
  }
}
