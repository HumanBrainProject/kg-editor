import React from "react";
import { observer } from "mobx-react";
import injectStyles from "react-jss";

import instanceStore from "../Stores/InstanceStore";
import routerStore from "../Stores/RouterStore";

import InstanceForm from "./Instance/InstanceForm";
import InstanceGraph from "./Instance/InstanceGraph";
import InstanceRelease from "./Instance/InstanceRelease";
import Pane from "./Instance/Pane";
import Links from "./Instance/Links";
import PaneContainer from "./Instance/PaneContainer";
import SaveBar from "./Instance/SaveBar";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const styles = {
  container:{
    display:"grid",
    height:"100%",
    gridTemplateRows:"100%",
    gridTemplateColumns:"50px 1fr 400px",
  },
  tabs:{
    borderRight:"1px solid var(--border-color-ui-contrast1)",
    background:"var(--bg-color-ui-contrast2)"
  },
  tab:{
    color:"var(--ft-color-normal)",
    borderLeft:"2px solid transparent",
    opacity:"0.5",
    cursor:"pointer",
    height:"50px",
    lineHeight:"50px",
    fontSize:"1.75em",
    textAlign:"center",
    "&:hover":{
      background:"var(--list-bg-hover)",
      borderColor:"var(--list-border-hover)",
      color:"var(--ft-color-loud)",
      opacity:"1",
    },
    "&.active":{
      background:"var(--list-bg-selected)",
      borderColor:"var(--list-border-selected)",
      color:"var(--ft-color-loud)",
      opacity:"1",
    }
  },
  body:{
    position:"relative",
    overflow:"hidden"
  },
  sidebar:{
    background:"var(--bg-color-ui-contrast2)",
    borderLeft:"1px solid var(--border-color-ui-contrast1)",
    overflow:"auto",
    color:"var(--ft-color-loud)"
  }
};

@injectStyles(styles)
@observer
export default class Edit extends React.Component {
  constructor(props) {
    super(props);
    this.UNSAFE_componentWillReceiveProps(this.props);
  }

  UNSAFE_componentWillReceiveProps(newProps){
    instanceStore.openInstance(newProps.match.params.id, newProps.mode, newProps.mode !== "edit");
  }

  handleSelectMode(mode){
    routerStore.history.push(`/instance/${mode}/${this.props.match.params.id}`);
  }

  render() {
    const {classes} = this.props;
    const openedInstance = instanceStore.openedInstances.get(this.props.match.params.id);

    return (
      <div className={classes.container}>
        <div className={classes.tabs}>
          <div className={`${classes.tab} ${openedInstance.viewMode === "view"?"active":""}`} onClick={this.handleSelectMode.bind(this, "view")}>
            <FontAwesomeIcon icon="eye"/>
          </div>
          <div className={`${classes.tab} ${openedInstance.viewMode === "edit"?"active":""}`} onClick={this.handleSelectMode.bind(this, "edit")}>
            <FontAwesomeIcon icon="pencil-alt"/>
          </div>
          <div className={`${classes.tab} ${openedInstance.viewMode === "graph"?"active":""}`} onClick={this.handleSelectMode.bind(this, "graph")}>
            <FontAwesomeIcon icon="project-diagram"/>
          </div>
          <div className={`${classes.tab} ${openedInstance.viewMode === "release"?"active":""}`} onClick={this.handleSelectMode.bind(this, "release")}>
            <FontAwesomeIcon icon="cloud-upload-alt"/>
          </div>
        </div>
        <div className={classes.body}>
          {openedInstance.viewMode === "edit" || openedInstance.viewMode === "view"?
            <PaneContainer key={this.props.match.params.id} paneStore={openedInstance.paneStore}>
              <React.Fragment>
                <Pane paneId={this.props.match.params.id}>
                  <InstanceForm level={0} id={this.props.match.params.id} mainInstanceId={this.props.match.params.id} />
                </Pane>
                {!instanceStore.getInstance(this.props.match.params.id).hasFetchError?
                  <Links level={1} id={this.props.match.params.id} mainInstanceId={this.props.match.params.id} />
                  :null}
              </React.Fragment>
            </PaneContainer>
            :openedInstance.viewMode === "graph"?
              <InstanceGraph id={this.props.match.params.id}/>
              :openedInstance.viewMode === "release"?
                <InstanceRelease id={this.props.match.params.id}/>
                :null}
        </div>
        <div className={classes.sidebar}>
          <SaveBar/>
        </div>
      </div>
    );
  }
}