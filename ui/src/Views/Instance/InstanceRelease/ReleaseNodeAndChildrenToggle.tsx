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
import { observer } from 'mobx-react-lite';
import React from 'react';
import { createUseStyles } from 'react-jss';

import useStores from '../../../Hooks/useStores';
import { ReleaseStatus } from '../../../types';

const useStyles = createUseStyles({
  container: {
    display: 'flex',
    flexDirection: 'row',
    height: '24px',
    background: 'var(--bg-color-ui-contrast4)',
    borderRadius: '20px'
  },
  btn: {
    textAlign:'center',
    width: '24px',
    height:'24px',
    lineHeight:'24px',
    cursor:'pointer',
    fontSize:'0.66em',
    transition:'all .2s ease',
    background:'none',
    '&:hover':{
      background:'var(--bg-color-ui-contrast1)',
      borderRadius:'50%',
      transform:'scale(1.12)',
      fontSize:'0.8em'
    }
  },
  releaseBtn: {
    extend: 'btn',
    color: '#3498db'
  },
  doNothingBtn: {
    extend: 'btn',
    color: '#999',
    '&:hover':{
      transform: 'scale(1)'
    }
  }
});

const ReleaseNodeAndChildrenToggle = observer(() => {

  const classes = useStyles();

  const { releaseStore } = useStores();

  const handleMarkAllNodeForRelease = () => {
    const node = releaseStore.instancesTree;
    if(node){
      releaseStore.markAllNodeForChange(node, ReleaseStatus.RELEASED);
    }
  };

  const handleMarkAllNodeToCurrentState = () => {
    const node = releaseStore.instancesTree;
    if(node) {
      releaseStore.markAllNodeForChange(node);
    }
  };

  return (
    <div className={classes.container}>
      <div onClick={handleMarkAllNodeForRelease} className={classes.releaseBtn} title="release all">
        <FontAwesomeIcon icon="check"/>
      </div>
      <div onClick={handleMarkAllNodeToCurrentState} className={classes.doNothingBtn} title="do nothing">
        <FontAwesomeIcon icon="dot-circle"/>
      </div>
    </div>
  );
});
ReleaseNodeAndChildrenToggle.displayName = 'ReleaseNodeAndChildrenToggle';

export default ReleaseNodeAndChildrenToggle;