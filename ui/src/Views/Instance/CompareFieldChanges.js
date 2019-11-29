import React from "react";
import injectStyles from "react-jss";
import CompareFieldValueChanges from "./CompareFieldValueChanges";

const styles = {
  container:{
    margin: "0 0 5px 0",
    padding: 0,
    border: 0,
    background: "transparent",
    overflowWrap: "anywhere",
    fontFamily: "unset",
    fontSize: "unset"
    //,
    //textAlign: "justify"
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
class CompareFieldChanges extends React.Component{
  render(){
    const {classes, field, beforeValue, afterValue} = this.props;

    if (!field || !field.label || field.id === "id") {
      return null;
    }
    return (
      <pre className={classes.container}>
        <label className={classes.label}>{field.label}</label>
        <CompareFieldValueChanges mappingLabel={field.mappingLabel} beforeValue={beforeValue} afterValue={afterValue}/>
      </pre>
    );
  }
}

export default CompareFieldChanges;