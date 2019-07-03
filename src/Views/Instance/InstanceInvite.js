import React from "react";
import { observer } from "mobx-react";
import injectStyles from "react-jss";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Button } from "react-bootstrap";

import instanceStore from "../../Stores/InstanceStore";

import Instance from "./InstanceInvite/Instance";
import Reviewers from "./InstanceInvite/Reviewers";
import FetchingLoader from "../../Components/FetchingLoader";
import BGMessage from "../../Components/BGMessage";

const rootPath = window.rootPath || "";

const styles = {
  container: {
    position: "relative",
    width: "100%",
    height: "100%",
    backgroundImage: `url('${window.location.protocol}//${window.location.host}${rootPath}/assets/graph.png')`,
    backgroundPosition: "50% 50%",
    "& .errorPanel, & .fetchingPanel": {
      color: "var(--ft-color-loud)",
      "& svg path": {
        stroke: "var(--ft-color-loud)",
        fill: "var(--ft-color-quiet)"
      }
    }
  },
  panel: {
    position: "relative",
    width: "60%",
    height: "calc(100% - 40px)",
    margin:"20px 20%",
    display: "grid",
    overflow: "hidden",
    gridTemplateRows: "1fr",
    gridTemplateColumns: "1fr 33%",
    gridColumnGap: "20px"
  }
};

@injectStyles(styles)
@observer
export default class InstanceInvite extends React.Component{
  componentDidMount() {
    if (this.props.id) {
      this.fetchInstance();
      instanceStore.setReadMode(true);
    }
  }

  componentDidUpdate(prevProps) {
    if (this.props.id && this.props.id !== prevProps.id) {
      this.fetchInstance(true);
      instanceStore.setReadMode(true);
    }
  }

  fetchInstance = (forceFetch = false) => {
    const instance = instanceStore.createInstanceOrGet(this.props.id);
    instance.fetch(forceFetch);
  }

  render(){
    const { classes } = this.props;

    const instance = instanceStore.instances.get(this.props.id);
    return (
      instance  && instance.data ?
        <div className={classes.container}>
          <div className={classes.panel}>
            {instance.isFetching?
              <FetchingLoader>
                <span>Fetching instance information...</span>
              </FetchingLoader>
              :!instance.hasFetchError?
                <React.Fragment>
                  <Instance instance={instance} />
                  <Reviewers id={this.props.id} />
                </React.Fragment>
                :
                <BGMessage icon={"ban"} className={classes.error}>
                  There was a network problem fetching the instance.<br/>
                  If the problem persists, please contact the support.<br/>
                  <small>{instance.fetchError}</small><br/><br/>
                  <Button bsStyle={"primary"} onClick={this.fetchInstance.bind(this, true)}>
                    <FontAwesomeIcon icon={"redo-alt"}/>&nbsp;&nbsp; Retry
                  </Button>
                </BGMessage>
            }
          </div>
        </div>:null
    );
  }
}