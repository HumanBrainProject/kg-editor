import React from "react";
import injectStyles from "react-jss";
import { observer } from "mobx-react";
import { Scrollbars } from "react-custom-scrollbars";
import Hub from "./Home/Hub";
import Dashboard from "./Home/Dashboard";

const styles = {
  container: {
    display:"grid",
    height:"100%",
    width:"100%",
    gridGap:"10px",
    gridTemplateColumns:"1fr 11fr",
    gridTemplateRows:"auto",
    padding:"10px",
    "& .widget":{
      background:"var(--bg-color-ui-contrast2)",
      border:"1px solid var(--border-color-ui-contrast1)",
      color:"var(--ft-color-loud)"
    }
  }
};

@injectStyles(styles)
@observer
export default class Home extends React.Component{
  constructor(props){
    super(props);
  }

  render(){
    const { classes } =  this.props;
    return (
      <Scrollbars autoHide>
        <div className={classes.container}>
          <Hub/>
          <Dashboard/>
        </div>
      </Scrollbars>
    );
  }
}
