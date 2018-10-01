import React from "react";
import injectStyles from "react-jss";
import { observer } from "mobx-react";
import { Scrollbars } from "react-custom-scrollbars";
import Hub from "./Home/Hub";

const styles = {
  container: {
    display:"grid",
    height:"100%",
    width:"100%",
    gridGap:"10px",
    gridTemplateColumns:"repeat(12, 1fr)",
    gridTemplateRows:"auto",
    padding:"10px",
    "& .widget":{
      background:"#24282a",
      border:"1px solid #111314",
      color:"rgb(224, 224, 224)"
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
        </div>
      </Scrollbars>
    );
  }
}
