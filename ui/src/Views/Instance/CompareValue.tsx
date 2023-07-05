/*
 * Copyright 2018 - 2021 Swiss Federal Institute of Technology Lausanne (EPFL)
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0.
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * This open source software code was developed in part or in whole in the
 * Human Brain Project, funded from the European Union's Horizon 2020
 * Framework Programme for Research and Innovation under
 * Specific Grant Agreements No. 720270, No. 785907, and No. 945539
 * (Human Brain Project SGA1, SGA2 and SGA3).
 *
 */

import Color from 'color';
import uniqueId from 'lodash/uniqueId';
import React from 'react';
import { createUseStyles } from 'react-jss';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const jsdiff = require('diff');

const useStyles = createUseStyles({
  container:{
    margin: '0 0 5px 0',
    padding: 0,
    border: 0,
    background: 'transparent',
    overflowWrap: 'anywhere',
    fontFamily: 'unset',
    fontSize: 'unset'
  },
  label: {
    marginBottom: 0,
    wordBreak: 'keep-all',
    '&::after': {
      content: '\':\\00a0\''
    }
  },
  value:{
    wordBreak: 'keep-all',
    whiteSpace: 'pre-wrap'
  },
  removed:{
    background:new Color('#e74c3c').lighten(0.6).hex(),
    textDecoration: 'line-through',
    '& + $added': {
      marginLeft: '3px'
    }
  },
  added:{
    background:new Color('#2ecc71').lighten(0.6).hex(),
    '& + $removed': {
      marginLeft: '3px'
    }
  },
  unchanged: {

  }
});

interface CompareValueProps {
  label?: string;
  leftValue: string;
  rightValue: string
  separator: string;
}

const CompareValue = ({ label, leftValue, rightValue, separator }: CompareValueProps) => {

  const classes = useStyles();

  const diff = jsdiff.diffWordsWithSpace(leftValue, rightValue);

  const getClassname = part => {
    if(part.added) {
      return classes.added;
    }
    if(part.removed) {
      return classes.removed;
    }
    return classes.unchanged;
  };

  return (
    <pre className={classes.container}>
      <label className={classes.label}>{label}</label>
      <span className={classes.value}>
        {diff.map((part, index) => {
          if (!part.value) {
            return null;
          }
          const className = getClassname(part);
          let [, , first, value, , last] = [null, null, null, part.value, null, null];
          const match = part.value.match(new RegExp('^((' + separator + '){0,1})(.*[^' + separator[separator.length-1] + '])((' + separator + '){0,1})$'));
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