import React from "react";
import injectStyles from "react-jss";
import { observer } from "mobx-react";
import { Scrollbars } from "react-custom-scrollbars";
import { Modal } from "react-bootstrap";

import authStore from "../Stores/AuthStore";

const rootPath = window.rootPath || "";

const styles = {
  container: {
    width: "100%",
    height: "100%",
    backgroundImage: `url('${window.location.protocol}//${window.location.host}${rootPath}/assets/graph.png')`,
    backgroundPosition: "50% 50%",
    color: "var(--ft-color-normal)"
  },
  workspacesSelection: {
    fontSize: "1.5em",
    padding: "0 0 30px 0",
    "& h1": {
      padding: "0 30px 20px 30px"
    },
    "& p": {
      padding: "0 30px",
      fontWeight: "300"
    }
  },
  workspaces: {
    display: "grid",
    padding: "0 30px",
    gridGap: "15px",
    gridTemplateColumns: "repeat(1fr)",
    "@media screen and (min-width:768px)": {
      gridTemplateColumns: "repeat(2, 1fr)"
    },
    "@media screen and (min-width:1024px)": {
      gridTemplateColumns: "repeat(3, 1fr)"
    },
  },
  workspace: {
    position: "relative",
    padding: "20px",
    fontWeight: "300",
    textAlign: "center",
    border: "1px solid #ccc",
    borderRadius: "3px",
    cursor: "pointer",
    fontSize: "1.2em",
    wordBreak: "break-word",
    "@media screen and (min-width:768px)": {
      whiteSpace: "nowrap"
    },
    "&:hover": {
      background: "#f3f3f3"
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
      "& .modal-body": {
        padding: "0",
        maxHeight: "calc(100vh - 30vh -80px)",
        overflowY: "hidden"
      }
    }
  }
};

@injectStyles(styles)
@observer
class WorkspaceModal extends React.Component{

  handleClick = workspace => authStore.setCurrentWorkspace(workspace);

  render(){
    const { classes } =  this.props;
    const firstNameReg = /^([^ ]+) .*$/;
    const name = authStore.hasUserProfile
      && authStore.user
      && authStore.user.givenName?
      authStore.user.givenName
      :
      authStore.user.displayName?
        (firstNameReg.test(authStore.user.displayName)?
          authStore.user.displayName.match(firstNameReg)[1]
          :
          authStore.user.displayName)
        :
        authStore.user.username?
          authStore.user.username
          :
          "";
    return (
      <div className={classes.container}>
        <Modal dialogClassName={classes.workspaceSelectionModal} show={true} centered>
          <Modal.Body>
            <div className={classes.workspacesSelection}>
              <h1>Welcome <span title={name}>{name}</span></h1>
              <p>Please select a workspace:</p>
              <div style={{height: `${Math.round(Math.min(window.innerHeight * 0.5 - 140, Math.ceil(authStore.workspaces.length / 3) * 80))}px`}}>
                <Scrollbars>
                  <div className={classes.workspaces}>
                    {authStore.workspaces.map(workspace =>
                      <div className={classes.workspace} key={workspace} onClick={() => this.handleClick(workspace)}>{workspace}</div>
                    )}
                  </div>
                </Scrollbars>
              </div>
            </div>
          </Modal.Body>
        </Modal>
      </div>
    );
  }
}

export default WorkspaceModal;