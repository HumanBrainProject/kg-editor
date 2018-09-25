import React from "react";
import { observer } from "mobx-react";
import injectStyles from "react-jss";
import { Form, Field } from "hbp-quickfire";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import searchStore from "../../Stores/SearchStore";
import instanceStore from "../../Stores/InstanceStore";
import routerStore from "../../Stores/RouterStore";

import FetchingLoader from "../../Components/FetchingLoader";
import ReleaseStatus from "../../Components/ReleaseStatus";

const styles = {
  container:{
    padding:"10px"
  },
  actions:{
    display:"grid",
    gridTemplateColumns:"repeat(4, 1fr)",
    gridGap:"10px",
    marginBottom:"20px"
  },
  action:{
    height:"34px",
    cursor:"pointer",
    overflow:"hidden",
    lineHeight:"34px",
    textAlign:"center",
    borderRadius:"2px",
    backgroundColor: "rgba(0, 0, 0, 0.2)",
    color:"rgba(255,255,255,0.5)",
    "&:hover":{
      color:"rgba(224,224,224,1)"
    }
  },
  status:{
    position:"absolute",
    top:"70px",
    right:"10px"
  },
  title:{
    fontSize:"1.5em",
    fontWeight:"300",
    width:"calc(100% - 70px)"
  },
  id:{
    fontSize:"0.75em",
    color:"rgba(255,255,255,0.5)",
    marginTop:"20px",
    marginBottom:"20px"
  },
  field:{
    marginBottom:"10px"
  }
};

@injectStyles(styles)
@observer
export default class Preview extends React.Component{
  constructor(props){
    super(props);
    instanceStore.setReadMode(true);
  }

  UNSAFE_componentWillReceiveProps(){
    instanceStore.setReadMode(true);
  }

  handleOpenInstance(mode, event){
    if(event.metaKey || event.ctrlKey){
      instanceStore.openInstance(searchStore.selectedInstance.id, mode);
    } else {
      routerStore.history.push(`/instance/${mode}/${searchStore.selectedInstance.id}`);
    }
  }

  render(){
    const { classes } = this.props;
    let selectedInstance = instanceStore.getInstance(searchStore.selectedInstance.id);
    return(
      <div className={classes.container}>
        {selectedInstance.isFetching?
          <FetchingLoader>
            <span>Fetching instance information...</span>
          </FetchingLoader>
          :
          <div className={classes.content}>
            <div className={classes.actions}>
              <div className={classes.action} onClick={this.handleOpenInstance.bind(this, "view")}>
                <FontAwesomeIcon icon="eye"/>&nbsp;&nbsp;Open
              </div>
              <div className={classes.action} onClick={this.handleOpenInstance.bind(this, "edit")}>
                <FontAwesomeIcon icon="pencil-alt"/>&nbsp;&nbsp;Edit
              </div>
              <div className={classes.action} onClick={this.handleOpenInstance.bind(this, "graph")}>
                <FontAwesomeIcon icon="project-diagram"/>&nbsp;&nbsp;Explore
              </div>
              <div className={classes.action} onClick={this.handleOpenInstance.bind(this, "release")}>
                <FontAwesomeIcon icon="cloud-upload-alt"/>&nbsp;&nbsp;Release
              </div>
            </div>
            <div className={classes.title}>
              {searchStore.selectedInstance.label}
            </div>
            <div className={classes.id}>
              Nexus ID: {searchStore.selectedInstance.id}
            </div>
            <Form store={selectedInstance.form} key={searchStore.selectedInstance.id}>
              {Object.keys(selectedInstance.form.structure.fields).map(fieldKey => {
                return(
                  <div key={searchStore.selectedInstanceId+fieldKey} className={classes.field}>
                    <Field name={fieldKey}/>
                  </div>
                );
              })}
              <div className={`${classes.status}`}>
                <div className={"release-status"}>
                  <ReleaseStatus instanceStatus={selectedInstance.data.status} childrenStatus={selectedInstance.data.childrenStatus}/>
                </div>
              </div>
            </Form>
          </div>
        }
      </div>
    );
  }
}