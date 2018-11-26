import React from "react";
import { observer } from "mobx-react";
import injectStyles from "react-jss";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import PopOverButton from "../../Components/PopOverButton";
import instanceStore from "../../Stores/InstanceStore";
import routerStore from "../../Stores/RouterStore";
import graphStore from "../../Stores/GraphStore";

const styles = {
  container:{
    position:"relative",
    minHeight:"47px",
    cursor:"pointer",
    padding:"10px",
    //background:"var(--bg-color-ui-contrast3)",
    background:"var(--bg-color-ui-contrast2)",
    borderLeft:"4px solid transparent",
    color:"var(--ft-color-normal)",
    outline:"1px solid var(--border-color-ui-contrast1)",
    marginBottom:"11px",
    "&:hover":{
      background:"var(--list-bg-hover)",
      borderColor:"var(--list-border-hover)",
      color:"var(--ft-color-loud)",
      outline:"1px solid transparent",
      "& $actions":{
        opacity:0.75
      }
    }
  },
  name:{
    display: "inline-block",
    paddingLeft: "8px",
    fontSize:"1.4em",
    fontWeight:"300",
    color:"var(--ft-color-louder)"
  },
  description:{
    overflow:"hidden",
    whiteSpace:"nowrap",
    textOverflow:"ellipsis",
    marginTop:"10px"
  },
  actions:{
    position:"absolute",
    top:"10px",
    right:"10px",
    width:"100px",
    display:"grid",
    gridTemplateColumns:"repeat(4, 1fr)",
    opacity:0,
    "&:hover":{
      opacity:"1 !important"
    }
  },
  action:{
    fontSize:"0.9em",
    lineHeight:"27px",
    textAlign:"center",
    backgroundColor: "var(--bg-color-ui-contrast2)",
    color:"var(--ft-color-normal)",
    "&:hover":{
      color:"var(--ft-color-loud)"
    },
    "&:first-child":{
      borderRadius:"4px 0 0 4px"
    },
    "&:last-child":{
      borderRadius:"0 4px 4px 0"
    }
  },
  icon: {
    display: "inline-block",
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

  handleOpenInstance(mode, instanceId, event) {
    event.stopPropagation();
    if(event.metaKey || event.ctrlKey){
      instanceStore.openInstance(instanceId, mode);
    } else {
      routerStore.history.push(`/instance/${mode}/${instanceId}`);
    }
  }

  handleRetry = () => {
    this.fetchInstance();
  }

  render(){
    const { classes, instanceId } = this.props;
    const instance = instanceStore.getInstance(instanceId);
    let color = undefined;
    let label = instanceId;
    let description = undefined;
    if(!instance.isFetching && !instance.hasFetchError){
      const nameField = instance.form.getField("http://schema.org/name");
      label = nameField? nameField.getValue(): instanceId;
      const descriptionField = instance.form.getField("http://schema.org/description");
      description = descriptionField && descriptionField.getValue();
      color = graphStore.colorScheme[instanceStore.nodeTypeMapping[instance.data.label]];
    }
    return(
      <div className={classes.container}
        onClick={this.handleOpenInstance.bind(this, "view", instanceId)}
        onDoubleClick={this.handleOpenInstance.bind(this, "view", instanceId)} >
        {instance.isFetching || (!instance.isFetched && !instance.hasFetchError)?
          <div className={classes.loader} title="retrieving instance">
            <FontAwesomeIcon icon="circle-notch" spin/>
          </div>
          :instance.hasFetchError?
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
            :
            <div className={classes.icon} style={color?{color: color}:{}} title={instance.data.label}>
              <FontAwesomeIcon fixedWidth icon="circle" />
            </div>
        }
        <div className={classes.name}>{label}</div>
        {description && (
          <div className={classes.description}>{description}</div>
        )}
        <div className={classes.actions}>
          <div className={classes.action} onClick={this.handleOpenInstance.bind(this, "view", instanceId)}>
            <FontAwesomeIcon icon="eye"/>
          </div>
          <div className={classes.action} onClick={this.handleOpenInstance.bind(this, "edit", instanceId)}>
            <FontAwesomeIcon icon="pencil-alt"/>
          </div>
          <div className={classes.action} onClick={this.handleOpenInstance.bind(this, "graph", instanceId)}>
            <FontAwesomeIcon icon="project-diagram"/>
          </div>
          <div className={classes.action} onClick={this.handleOpenInstance.bind(this, "release", instanceId)}>
            <FontAwesomeIcon icon="cloud-upload-alt"/>
          </div>
        </div>
      </div>
    );
  }
}