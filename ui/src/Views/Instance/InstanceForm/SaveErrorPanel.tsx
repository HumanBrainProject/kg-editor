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

import React from 'react';
import Button  from 'react-bootstrap/Button';
import { createUseStyles } from 'react-jss';
import type { MouseEvent } from 'react';

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
    position: 'absolute',
    top: '50%',
    left: '50%',
    minWidth: '220px',
    transform: 'translate(-50%, -50%)',
    padding: '10px',
    borderRadius: '5px',
    background: 'white',
    textAlign: 'center',
    boxShadow: '2px 2px 4px #7f7a7a',
    '& h4': {
      margin: '0',
      paddingBottom: '10px',
      color: 'red'
    },
    '& button + button, & a + button, & a + a': {
      marginLeft: '20px'
    }
  }
});

interface SaveErrorPanelProps {
  show: boolean;
  error: string;
  inline: boolean;
  onRetry: (e: MouseEvent<HTMLButtonElement>) => void;
  onCancel: (e: MouseEvent<HTMLButtonElement>) => void;
}

const SaveErrorPanel = ({ show, error, inline, onCancel, onRetry }: SaveErrorPanelProps) => {

  const classes = useStyles();

  const handleCancel = (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    onCancel(e);
  };

  const handleRetry = (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    onRetry(e);
  };

  if (!show) {
    return null;
  }

  return (
    <div className={`${classes.container} ${inline?'':'block'}`}>
      <div className={classes.panel}>
        <h4>{error}</h4>
        <div>
          <Button variant="secondary" onClick={handleCancel}>Cancel</Button>
          <Button variant="primary" onClick={handleRetry}>Retry</Button>
        </div>
      </div>
    </div>
  );
};

export default SaveErrorPanel;