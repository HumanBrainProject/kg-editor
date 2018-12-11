import React from "react";
import { observer } from "mobx-react";
import injectStyles from "react-jss";
import { Scrollbars } from "react-custom-scrollbars";

const styles = {
  container: {
    position: "relative",
    width: "calc(100% - 20px)",
    height: "calc(100% - 20px)",
    backgroundColor: "var(--bg-color-ui-contrast2)",
    color: "var(--ft-color-normal)",
    border: "1px solid var(--bg-color-blend-contrast1)",
    margin:"10px"
  },
};

@injectStyles(styles)
@observer
export default class InstanceMange extends React.Component{

  render(){
    const { classes } = this.props;

    return (
      <div className={classes.container}>
        <Scrollbars autoHide>
        </Scrollbars>
      </div>
    );
  }
}