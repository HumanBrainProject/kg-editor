import React from "react";
import { observer } from "mobx-react";
import injectStyles from "react-jss";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import PopOverButton from "../../Components/PopOverButton";
import instanceStore from "../../Stores/InstanceStore";
import routerStore from "../../Stores/RouterStore";
import InstanceRow from "../Instance/InstanceRow";

const styles = {
  container: {
    position:"relative",
    minHeight:"47px",
    cursor:"pointer",
    padding:"10px",
    //background:"var(--bg-color-ui-contrast3)",
    background:"var(--bg-color-ui-contrast2)",
    borderLeft:"4px solid transparent",
    color:"var(--ft-color-normal)",
    outline:"1px solid var(--border-color-ui-contrast1)",
    marginBottom:"11px"
  },
  name: {
    display: "inline-block",
    paddingLeft: "8px",
    fontSize:"1.4em",
    fontWeight:"300",
    color:"var(--ft-color-louder)"
  },
  loader: {
    display: "inline-block",
    borderRadius:"0.14em",
    width: "20px",
    //background:"var(--bg-color-ui-contrast2)",
    textAlign:"center",
    color:"var(--ft-color-loud)",
    //border:"1px solid var(--ft-color-loud)",
    "& .svg-inline--fa":{
      fontSize:"0.8em",
      verticalAlign:"baseline"
    }
  },
  fetchErrorButton: {
    display: "inline-block",
    color: "var(--ft-color-loud)",  // #e67e22 #e74c3c
  },
  textError: {
    margin: 0,
    wordBreak: "keep-all"
  }
};

@injectStyles(styles)
@observer
export default class Instance extends React.Component{
  constructor(props){
    super(props);
    this.fetchInstance();
  }

  fetchInstance(forceFetch = false){
    instanceStore.getInstance(this.props.instanceId, forceFetch);
  }

  handleInstanceClick(instance){
    if (instance && instance.id) {
      routerStore.history.push(`/instance/view/${instance.id}`);
    }
  }

  handleInstanceCtrlClick(instance){
    if (instance && instance.id) {
      instanceStore.openInstance(instance.id);
    }
  }

  handleInstanceActionClick(instance, mode){
    if (instance && instance.id) {
      routerStore.history.push(`/instance/${mode}/${instance.id}`);
    }
  }

  handleRetry = () => {
    this.fetchInstance();
  }

  render(){
    const { classes, instanceId } = this.props;
    const instance = instanceStore.getInstance(instanceId);

    if (instance.isFetched && !instance.isFetching && !instance.hasFetchError) {

      const name = instance.form.getField("http://schema.org/name");
      const description = instance.form.getField("http://schema.org/description");
      const instanceData = {
        id: instanceId,
        dataType: instanceStore.nodeTypeMapping[instance.data.label],
        name: name?name.value:"",
        description: description?description.value:""
      };

      return (
        <InstanceRow instance={instanceData} selected={false} onClick={this.handleInstanceClick}  onCtrlClick={this.handleInstanceCtrlClick}  onActionClick={this.handleInstanceActionClick} />
      );
    } else if (instance.hasFetchError) {
      return (
        <div className={classes.container}>
          <PopOverButton
            buttonClassName={classes.fetchErrorButton}
            buttonTitle="fetching instance failed, click for more information"
            iconComponent={FontAwesomeIcon}
            iconProps={{icon: "exclamation-triangle"}}
            okComponent={() => (
              <React.Fragment>
                <FontAwesomeIcon icon="redo-alt"/>&nbsp;Retry
              </React.Fragment>
            )}
            onOk={this.handleFetchRetry}
          >
            <h5 className={classes.textError}>{instance.fetchError}</h5>
          </PopOverButton>
          <div className={classes.name}>{instanceId}</div>
        </div>
      );
    } else {
      return (
        <div className={classes.container}>
          <div className={classes.loader} title="retrieving instance">
            <FontAwesomeIcon icon="circle-notch" spin/>
          </div>
          <div className={classes.name}>{instanceId}</div>
        </div>
      );
    }
  }
}