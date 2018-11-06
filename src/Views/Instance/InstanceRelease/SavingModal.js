import React from "react";
import {Modal, ProgressBar} from "react-bootstrap";
import { observer } from "mobx-react";
import injectStyles from "react-jss";

let styles = {

};

@injectStyles(styles)
@observer
export default class SavingModal extends React.Component{
  render(){
    const {store} = this.props;
    return(
      <Modal show={store.isSaving}>
        <Modal.Body>
          <ProgressBar
            active={store.savingProgress !== store.savingTotal}
            now={store.savingTotal <= 0? 100: Math.round(store.savingProgress/store.savingTotal*100)}
            label={`${store.savingTotal <= 0? 100: Math.round(store.savingProgress/store.savingTotal*100)}%`} />
        </Modal.Body>
      </Modal>
    );
  }
}