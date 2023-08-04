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
import { createUseStyles } from 'react-jss';

import Spinner from './Spinner';

const useStyles = createUseStyles({
  container: {
    height: '100%'
  },
  panel: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    zIndex: 10000,
    background: 'var(--bg-color-blend-contrast1)',
    '& .spinnerPanel': {
      width: 'auto',
      padding: '30px',
      border: '1px solid var(--border-color-ui-contrast6)',
      borderRadius: '4px',
      color: 'var(--ft-color-loud)',
      background: 'var(--bg-color-ui-contrast6)'
    }
  }
});

interface SpinnerPanelProps {
  text: string;
}

const SpinnerPanel = ({text}: SpinnerPanelProps) => {

  const classes = useStyles();

  return (
    <div className={classes.container}>
      <div className={classes.panel}>
        <Spinner text={text} />
      </div>
    </div>
  );
};

export default SpinnerPanel;
