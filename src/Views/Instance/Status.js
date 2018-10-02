import React from "react";
import { observer } from "mobx-react";
import injectStyles from "react-jss";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import statusStore from "../../Stores/StatusStore";
import ReleaseStatus from "../../Components/ReleaseStatus";

let styles = {
  container:{
    display:"inline-block",
    fontSize:"0.75em"
  },
  loader:{
    borderRadius:"0.14em",
    width:"2.5em",
    background:"var(--bg-color-ui-contrast2)",
    textAlign:"center",
    color:"var(--ft-color-loud)",
    border:"1px solid var(--ft-color-loud)",
    "& .svg-inline--fa":{
      fontSize:"0.8em",
      verticalAlign:"baseline"
    }
  }
};

@injectStyles(styles)
@observer
export default class Status extends React.Component{
  constructor(props){
    super(props);
    statusStore.fetchStatus(this.props.id);
  }

  UNSAFE_componentWillReceiveProps(newProps){
    statusStore.fetchStatus(newProps.id);
  }

  render(){
    let instanceStatus = statusStore.getInstance(this.props.id);
    const { classes } = this.props;
    return(
      <div className={`${classes.container} status`}>
        {!instanceStatus.isFetched?
          <div className={classes.loader}>
            <FontAwesomeIcon icon={"circle-notch"} spin/>
          </div>
          :
          <ReleaseStatus darkmode={this.props.darkmode} instanceStatus={instanceStatus.data.status} childrenStatus={instanceStatus.data.childrenStatus? instanceStatus.data.childrenStatus: null}/>
        }
      </div>
    );
  }
}