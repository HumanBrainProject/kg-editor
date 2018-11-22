import React from "react";
import injectStyles from "react-jss";
import {observer} from "mobx-react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import routerStore from "../../Stores/RouterStore";
import browseStore from "../../Stores/BrowseStore";
import instanceStore from "../../Stores/InstanceStore";
import ThemeSwitcher from "./ThemeSwitcher";

const styles = {
  container:{
  },
  action:{
    textAlign:"center",
    padding:"10px",
    borderBottom:"1px solid var(--border-color-ui-contrast1)",
    color:"var(--ft-color-normal)",
    cursor:"pointer",
    "&:hover":{
      color:"var(--ft-color-loud)"
    }
  },
  actionIcon:{
    fontSize:"3em"
  },
  actionText:{
    fontSize:"0.9em",
    textTransform:"uppercase",
    fontWeight:"bold"
  },
  overlay:{
    position:"absolute",
    top:0,
    left:0,
    width:"100%",
    height:"100%",
    background:"rgba(255,255,255,0.75)"
  }
};

@injectStyles(styles)
@observer
export default class Hub extends React.Component{
  constructor(props){
    super(props);
    this.state = {
      showCreateModal:false
    };
  }

  handleCreateInstance = () => {
    if(!browseStore.isFetched.lists && !browseStore.isFetching.list){
      browseStore.fetchLists();
    }
    instanceStore.toggleShowCreateModal();
  }

  render(){
    const { classes } = this.props;
    return(
      <div className={`${classes.container} widget`}>
        <div className={classes.action} onClick={()=>routerStore.history.push("/browse")}>
          <div className={classes.actionIcon}>
            <FontAwesomeIcon icon={"search"}/>
          </div>
          <div className={classes.actionText}>
            Browse instances
          </div>
        </div>


        <div className={classes.action} onClick={this.handleCreateInstance}>
          <div className={classes.actionIcon}>
            <FontAwesomeIcon icon={browseStore.isFetching.lists?"circle-notch":"file"} spin={browseStore.isFetching.lists}/>
          </div>
          <div className={classes.actionText}>
            New instance
          </div>
        </div>

        <div className={classes.action} onClick={()=>routerStore.history.push("/kg-stats")}>
          <div className={classes.actionIcon}>
            <FontAwesomeIcon icon={"chart-bar"}/>
          </div>
          <div className={classes.actionText}>
            KG Statistics
          </div>
        </div>

        <div className={classes.action} onClick={()=>routerStore.history.push("/help")}>
          <div className={classes.actionIcon}>
            <FontAwesomeIcon icon={"question-circle"}/>
          </div>
          <div className={classes.actionText}>
            Help
          </div>
        </div>

        <div className={classes.action}>
          <ThemeSwitcher/>
        </div>
      </div>
    );
  }
}