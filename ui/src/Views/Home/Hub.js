import React from "react";
import injectStyles from "react-jss";
import {observer} from "mobx-react";

import instanceStore from "../../Stores/InstanceStore";
import ThemeSwitcher from "./ThemeSwitcher";
import TypesStore from "../../Stores/TypesStore";

const styles = {
  container:{
    display: "flex",
    position: "relative",
    height: "100%"
  },
  action:{
    alignSelf: "flex-end",
    textAlign:"center",
    padding:"10px",
    color:"var(--ft-color-normal)",
    cursor:"pointer",
    "&:hover":{
      color:"var(--ft-color-loud)"
    },
    "&:first-child": {
      flex: 1
    },
    "&.statistics": {
      paddingBottom: "13px",
      "& $actionIcon": {
        transform: "scale(1.35) translateY(-4px)"
      }
    }
  },
  actionIcon:{
    fontSize:"3em"
  },
  actionText:{
    fontSize:"0.9em",
    textTransform:"uppercase",
    fontWeight:"bold"
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
    if(!TypesStore.isFetched) {
      TypesStore.fetch();
    }
    instanceStore.toggleShowCreateModal();
  }

  render(){
    const { classes } = this.props;
    return(
      <div className={classes.container}>
        <div className={classes.action}></div>
        {/* <div className={`${classes.action} statistics`} onClick={()=>routerStore.history.push("/kg-stats")}>
          <div className={classes.actionIcon}>
            <FontAwesomeIcon icon={"chart-bar"}/>
          </div>
          <div className={classes.actionText}>
            KG Statistics
          </div>
        </div> */}
        <div className={classes.action}>
          <ThemeSwitcher/>
        </div>
      </div>
    );
  }
}