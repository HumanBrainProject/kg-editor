/*
*   Copyright (c) 2020, EPFL/Human Brain Project PCO
*
*   Licensed under the Apache License, Version 2.0 (the "License");
*   you may not use this file except in compliance with the License.
*   You may obtain a copy of the License at
*
*       http://www.apache.org/licenses/LICENSE-2.0
*
*   Unless required by applicable law or agreed to in writing, software
*   distributed under the License is distributed on an "AS IS" BASIS,
*   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
*   See the License for the specific language governing permissions and
*   limitations under the License.
*/

import React from "react";
import { createUseStyles } from "react-jss";
import Color from "color";
import uniqueId from "lodash/uniqueId";
const jsdiff = require("diff");

const useStyles = createUseStyles({
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
  },
  value:{
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
});

const CompareValue = ({ label, leftValue, rightValue, separator }) => {

  const classes = useStyles();

  //window.console.log(label, leftValue, rightValue);

  const diff = jsdiff.diffWordsWithSpace(leftValue, rightValue);

  return (
    <pre className={classes.container}>
      <label className={classes.label}>{label}</label>
      <span className={classes.value}>
        {diff.map((part, index) => {
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
            <React.Fragment key={`${part.value}-${index}`}>
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
    </pre>
  );
};

export default CompareValue;