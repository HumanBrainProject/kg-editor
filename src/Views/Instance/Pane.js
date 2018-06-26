import React from "react";
import injectStyles from "react-jss";
import { inject, observer } from "mobx-react";

const styles = {
  pane:{
    overflow:"auto",
    background:"#ebebeb",
    boxShadow:"0 2px 10px #333",
    margin:"0",
    transform:"scale(0.90)",
    padding:"20px",
    transition:"all 0.5s ease",
    "@media screen and (min-width:992px)": {
      marginRight:"20px",
      marginLeft:"20px",
    },
    "&.active":{
      background:"white",
      transform:"scale(1)"
    },
    /*"&.after, &.before":{
      zIndex:2
    },*/
    "&:hover":{
      zIndex:2
    },
    "&.after:hover":{
      background:"#ebebeb",
      transform:"scale(0.95) translateX(-50%)",
      marginRight:"40px"
    },
    "&.before:hover":{
      background:"#ebebeb",
      transform:"scale(0.95) translateX(50%)",
      marginLeft:"40px"
    },
    "& > div": {
      opacity:"0.75",
      transition:"all 0.5s ease"
    },
    "&.active > div":{
      opacity:"1"
    },
    "&.after:hover > div":{
      opacity:"1"
    },
    "&.before:hover > div":{
      opacity:"1"
    }
  }
};

@injectStyles(styles)
@inject("paneStore")
@observer
export default class Pane extends React.Component{
  constructor(props){
    super(props);
    this.paneId = this.props.paneStore.registerPane();
  }

  componentWillUnmount(){
    this.props.paneStore.unregisterPane(this.paneId);
  }

  handleFocus = () => {
    if(this.props.paneStore.selectedPane !== this.paneId){
      this.props.paneStore.selectPane(this.paneId);
    }
  }

  render(){
    const {classes, paneStore} =  this.props;
    let thisIndex = paneStore.panes.indexOf(this.paneId);

    let activeClass = paneStore.selectedIndex < thisIndex? "after": paneStore.selectedIndex > thisIndex? "before": "active";

    return (
      <div className={`${classes.pane} ${activeClass}`} onFocus={this.handleFocus} onClick={this.handleFocus}>
        <div>
          {this.props.children}
        </div>
      </div>
    );
  }
}
