import React from "react";
import { observer } from "mobx-react";
import injectStyles from "react-jss";
import { Button, Modal } from "react-bootstrap";
import { Scrollbars } from "react-custom-scrollbars";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import appStore from "../../../Stores/AppStore";

import CompareWithReleasedVersionChanges from "../CompareWithReleasedVersionChanges";

const styles = {
  container: {
    width: "90%",
    "@media screen and (min-width:1024px)": {
      width: "900px"
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
};

@injectStyles(styles)
@observer
class CompareInstancesModal extends React.Component {
  handleShowCompare = node => e => {
    e && e.stopPropagation();
    appStore.setComparedWithReleasedVersionInstance(node);
  }

  render() {
    const {classes} = this.props;
    return(
      <Modal
        show={true}
        dialogClassName={classes.container}
        onHide={this.handleShowCompare(null)}
      >
        <Modal.Header closeButton>
            Compare with the released version of{" "}
          <strong>
            {
              appStore.comparedWithReleasedVersionInstance
                .type
            }
                        &nbsp;
            {
              appStore.comparedWithReleasedVersionInstance
                .label
            }
          </strong>
        </Modal.Header>
        <Modal.Body>
          <Scrollbars autoHide>
            <CompareWithReleasedVersionChanges
              instanceId={
                appStore.comparedWithReleasedVersionInstance
                  .relativeUrl
              }
              status={
                appStore.comparedWithReleasedVersionInstance
                  .status
              }
            />
          </Scrollbars>
        </Modal.Body>
        <Modal.Footer>
          <Button
            bsSize="small"
            onClick={this.handleShowCompare(null)}
          >
            <FontAwesomeIcon icon="times" />
                        &nbsp;Close
          </Button>
        </Modal.Footer>
      </Modal>
    );
  }
}

export default CompareInstancesModal;