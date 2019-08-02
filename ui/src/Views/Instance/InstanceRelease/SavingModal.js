import React from "react";
import {Modal, ProgressBar, Button} from "react-bootstrap";
import { observer } from "mobx-react";
import injectStyles from "react-jss";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import releaseStore from "../../../Stores/ReleaseStore";

let styles = {
  lastEndedOperation:{
    fontWeight:"bold",
    fontSize:"0.8em",
    whiteSpace:"nowrap",
    textOverflow:"ellipsis",
    overflow:"hidden"
  },
  reloadRelease:{
    extend:"lastEndedOperation"
  },
  error:{
    background:"rgba(255,0,0,0.1)",
    borderTop:"1px solid #f5f5f5",
    padding: "10px 5px",
    fontWeight:"bold",
    fontSize:"0.8em",
    "&:last-child":{
      borderBottom:"1px solid #f5f5f5"
    },
    "&:nth-child(odd)":{
      background:"rgba(255,0,0,0.15)"
    }
  },
  errors:{
    marginTop:"10px"
  },
  absoluteProgress: {
    fontSize: "12px",
    transform: "translateY(-10px)",
    marginTop: "-10px"
  }
};

@injectStyles(styles)
@observer
export default class SavingModal extends React.Component{
  handleDismissSavingReport = () => {
    releaseStore.dismissSaveError();
  }

  handleStop = () => {
    releaseStore.stopRelease();
  }

  render(){
    const {classes} = this.props;
    return(
      <Modal show={releaseStore.isSaving}>
        <Modal.Body>
          <ProgressBar
            active={releaseStore.savingProgress !== releaseStore.savingTotal}
            now={releaseStore.savingTotal <= 0? 100: Math.round(releaseStore.savingProgress/releaseStore.savingTotal*100)}
            label={`${releaseStore.savingTotal <= 0? 100: Math.round(releaseStore.savingProgress/releaseStore.savingTotal*100)}%`} />
          <div className={classes.absoluteProgress}>{releaseStore.savingProgress} / {releaseStore.savingTotal}</div>
          {releaseStore.savingProgress !== releaseStore.savingTotal?
            <React.Fragment>
              <div className={classes.lastEndedInstance}>
                {releaseStore.savingLastEndedNode && releaseStore.savingLastEndedNode.label}
              </div>
              <div className={classes.lastEndedOperation}>
                {releaseStore.savingLastEndedRequest}
              </div>
            </React.Fragment>
            :releaseStore.savingErrors.length === 0?
              <div className={classes.reloadRelease}>
                <FontAwesomeIcon icon={"circle-notch"} spin/>&nbsp;&nbsp;Reloading current instance release status
              </div>
              :null
          }
          {releaseStore.savingErrors.length > 0 &&
            <div className={classes.errors}>
              {releaseStore.savingErrors.map(error => {
                return(
                  <div key={error.id} className={classes.error}>
                    <FontAwesomeIcon icon={"times-circle"}/>&nbsp;
                    ({error.node.type}) {error.node.label}<br/><br/>
                    {error.message}
                  </div>
                );
              })}
            </div>
          }
        </Modal.Body>
        {releaseStore.savingErrors.length > 0 && releaseStore.savingProgress === releaseStore.savingTotal ?
          <Modal.Footer>
            <Button bsStyle="primary" onClick={this.handleDismissSavingReport}>Dismiss</Button>
          </Modal.Footer> : <Modal.Footer>
            <Button bsStyle="danger" onClick={this.handleStop}>Stop</Button>
          </Modal.Footer>
        }
      </Modal>
    );
  }
}