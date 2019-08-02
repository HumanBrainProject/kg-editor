import React from "react";
import injectStyles from "react-jss";
import InstanceField from "./InstanceField";

const styles = {
  panel: {
    padding: "0"
  }
};

@injectStyles(styles)
export default class SummaryPanel extends React.Component{
  render(){
    const { classes, className, level, id, instance, fields, mainInstanceId, disableLinks } = this.props;
    return(
      <div className={`${classes.panel} ${className}`}>
        {fields.map(name => <InstanceField key={id+name} name={name} level={level} id={id} instance={instance} mainInstanceId={mainInstanceId} disableLinks={disableLinks} />)}
      </div>
    );
  }
}