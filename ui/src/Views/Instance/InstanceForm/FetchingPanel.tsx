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

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react';
import { createUseStyles } from 'react-jss';

const useStyles = createUseStyles({
  panel: {
    position: 'relative',
    padding: '10px 10px 0 10px',
    fontSize: '18px',
    fontWeight: 'lighter',
    '@media screen and (max-width:576px)': {
      width: '220px',
      '&[inline=\'false\']': {
        width: '180px'
      }
    },
    '&.block': {
      position: 'absolute !important',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)'
    },
    '& small': {
      display: 'block',
      padding: '10px 0',
      color:'grey',
      fontWeight:'400',
      fontSize:'0.6em',
      fontStyle: 'italic',
      '@media screen and (max-width:576px)': {
        wordBreak: 'break-all',
        wordWrap: 'break-word',
        whiteSpace: 'normal'
      }
    }
  },
  label: {
    paddingLeft: '6px'
  }
});

interface FetchingPanelProps {
  id: string;
  show: boolean;
  inline: boolean;
}

const FetchingPanel = ({ id, show, inline }: FetchingPanelProps) => {

  const classes = useStyles();

  if (!show) {
    return null;
  }

  return(
    <div className={`${classes.panel} ${inline?'':'block'} `}>
      <FontAwesomeIcon icon="circle-notch" spin/>
      <span className={classes.label}>Retrieving instance...</span>
      <small>ID: {id}</small>
    </div>
  );
};

export default FetchingPanel;