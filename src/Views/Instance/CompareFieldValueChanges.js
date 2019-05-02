import React from "react";
import injectStyles from "react-jss";
import Color from "color";
import uniqueId from "lodash/uniqueId";
const jsdiff = require("diff");

const styles = {
  container:{
    wordBreak: "keep-all",
    whiteSpace: "pre-wrap"
  },
  removed:{
    background:new Color("#e74c3c").lighten(0.6).hex(),
    textDecoration: "line-through",
    "& + $added": {
      marginLeft: "3px"
    }
  },
  added:{
    background:new Color("#2ecc71").lighten(0.6).hex(),
    "& + $removed": {
      marginLeft: "3px"
    }
  },
  unchanged: {

  }
};

@injectStyles(styles)
export default class CompareFieldValueChanges extends React.Component{
  render(){
    const {classes, beforeValue, afterValue, mappingLabel} = this.props;

    const separator = "; ";

    const getValue = (value, separator="; ") => {
      if (value === undefined || value === null) {
        return "";
      }
      if (Array.isArray(value)) {
        return value.reduce((result, obj) => {
          if (obj && obj[mappingLabel] !== undefined && obj[mappingLabel] !== null) {
            return result + (result === ""?"":separator) + obj[mappingLabel].toString();
          }
          return result;
        }, "");
      }
      return value.toString();
    };

    const diff = jsdiff.diffWordsWithSpace(getValue(beforeValue, separator), getValue(afterValue, separator));

    return (
      <span className={classes.container}>
        {diff.map(part => {
          if (!part.value) {
            return null;
          }
          const className = part.added?
            classes.added
            :
            part.removed?
              classes.removed
              :
              classes.unchanged;
          let [, , first, value, , last] = [null, null, null, part.value, null, null];
          const match = part.value.match(new RegExp("^((" + separator + "){0,1})(.*[^" + separator[separator.length-1] + "])((" + separator + "){0,1})$"));
          if (match && match.length >= 6) {
            [, , first, value, , last] = match;
          }
          const values = value.split(separator);
          return (
            <React.Fragment key={part.value}>
              {first && (
                <span>{separator}</span>
              )}
              {values.map((val, idx) => (
                <React.Fragment key={uniqueId(val)}>
                  {idx !== 0 && (
                    <span>{separator}</span>
                  )}
                  <span className={className}>{val}</span>
                </React.Fragment>
              ))}
              {last && (
                <span>{separator}</span>
              )}
            </React.Fragment>
          );
        })}
      </span>
    );
  }
}