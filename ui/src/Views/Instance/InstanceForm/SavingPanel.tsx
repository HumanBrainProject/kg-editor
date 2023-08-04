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
  container: {
    position: 'absolute',
    top: '0',
    left: '0',
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0,0,0,0.25)',
    borderRadius: '9px',
    zIndex: '1200',
    '&.block': {
      top: '-10px',
      left: '-10px',
      width: 'calc(100% + 20px)',
      height: 'calc(100% + 20px)',
      borderRadius: '0',
      '& $panel': {
        position: 'fixed'
      }
    }
  },
  panel: {
    display: 'inline-block',
    position: 'absolute',
    top: '50%',
    left: '50%',
    minWidth: '240px',
    transform: 'translate(-50%, -50%)',
    fontSize: '18px',
    fontWeight: 'lighter',
    background: 'white',
    padding: '20px',
    borderRadius: '5px',
    boxShadow: '2px 2px 4px #7f7a7a',
    '& small': {
      display: 'block',
      padding: '10px 0',
      color:'grey',
      fontWeight:'400',
      fontSize:'0.6em',
      fontStyle: 'italic',
      whiteSpace: 'nowrap',
      '@media screen and (max-width:576px)': {
        wordBreak: 'break-all',
        wordWrap: 'break-word',
        whiteSpace: 'normal'
      }
    }
  },
  icon: {
    color: 'red',
    animation: '$animationId 1.4s infinite linear'
  },
  '@keyframes animationId': {
    '0%': {
      transform: 'scale(1)'
    },
    '50%': {
      transform: 'scale(0.1)'
    },
    '100%': {
      transform: 'scale(1)'
    }
  },
  label: {
    paddingLeft: '6px'
  }
});

interface SavingPanelProps {
  id: string;
  show: boolean;
  inline: boolean;
}

const SavingPanel = ({ id, show, inline }: SavingPanelProps) => {

  const classes = useStyles();

  if (!show) {
    return null;
  }

  return (
    <div className={`${classes.container} ${inline?'':'block'}`}>
      <div className={classes.panel} >
        <FontAwesomeIcon className={classes.icon} icon="dot-circle"/>
        <span className={classes.label}>Saving instance...</span>
        <small>ID: {id}</small>
      </div>
    </div>
  );
};

export default SavingPanel;