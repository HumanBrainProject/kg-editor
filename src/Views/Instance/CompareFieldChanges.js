import React from "react";
import injectStyles from "react-jss";
import CompareFieldValueChanges from "./CompareFieldValueChanges";

const styles = {
  container:{
    marginBottom: "5px"
  },
  label: {
    marginBottom: 0,
    wordBreak: "keep-all",
    "&::after": {
      content: "':\\00a0'"
    }
  }
};

@injectStyles(styles)
export default class CompareFieldChanges extends React.Component{
  render(){
    const {classes, field, beforeValue, afterValue} = this.props;

    if (!field || !field.label || field.id === "id") {
      return null;
    }
    return (
      <div className={classes.container}>
        <label className={classes.label}>{field.label}</label>
        <CompareFieldValueChanges beforeValue={beforeValue} afterValue={afterValue}/>
      </div>
    );
  }
}