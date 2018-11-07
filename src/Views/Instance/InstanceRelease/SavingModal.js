import React from "react";
import {Modal, ProgressBar, Button} from "react-bootstrap";
import { observer } from "mobx-react";
import injectStyles from "react-jss";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

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
  }
};

@injectStyles(styles)
@observer
export default class SavingModal extends React.Component{
  handleDismissSavingReport = () => {
    this.props.store.dismissSaveError();
  }

  render(){
    const {store, classes} = this.props;
    return(
      <Modal show={store.isSaving}>
        <Modal.Body>
          <ProgressBar
            active={store.savingProgress !== store.savingTotal}
            now={store.savingTotal <= 0? 100: Math.round(store.savingProgress/store.savingTotal*100)}
            label={`${store.savingTotal <= 0? 100: Math.round(store.savingProgress/store.savingTotal*100)}%`} />
          {store.savingProgress !== store.savingTotal?
            <React.Fragment>
              <div className={classes.lastEndedInstance}>
                {store.savingLastEndedNode && store.savingLastEndedNode.label}
              </div>
              <div className={classes.lastEndedOperation}>
                {store.savingLastEndedRequest}
              </div>
            </React.Fragment>
            :store.savingErrors.length === 0?
              <div className={classes.reloadRelease}>
                <FontAwesomeIcon icon={"circle-notch"} spin/>&nbsp;&nbsp;Reloading current instance release status
              </div>
              :null
          }
          {store.savingErrors.length > 0 &&
            <div className={classes.errors}>
              {store.savingErrors.map(error => {
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
        {store.savingErrors.length > 0 && store.savingProgress === store.savingTotal &&
          <Modal.Footer>
            <Button bsStyle="primary" onClick={this.handleDismissSavingReport}>Dismiss</Button>
          </Modal.Footer>
        }
      </Modal>
    );
  }
}