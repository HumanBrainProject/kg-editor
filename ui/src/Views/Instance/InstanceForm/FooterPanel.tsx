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
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import { createUseStyles } from 'react-jss';
import { useLocation, useNavigate } from 'react-router-dom';

import useStores from '../../../Hooks/useStores';
import { ViewMode } from '../../../types';
import type Instance from '../../../Stores/Instance';
import type { MouseEvent } from 'react';

const useStyles = createUseStyles({
  panel:{
    '& .btn':{
      display:'block',
      width:'100%'
    }
  },
  info:{
    color:'grey',
    fontWeight:'300',
    fontSize:'0.7em',
    wordBreak: 'break-all',
    '&:last-child': {
      paddingBottom: '10px'
    }
  },
  showActions:{
    '& $panel':{
      height:'36px'
    },
    '& $actions':{
      display:'grid'
    }
  },
  actions:{
    display:'none',
    position:'absolute',
    right:'15px',
    width:'25px',
    gridTemplateColumns:'repeat(1, 1fr)',
    opacity:0.25,
    '&:hover':{
      opacity:'1 !important'
    },
    cursor:'pointer'
  },
  action:{
    fontSize:'0.9em',
    lineHeight:'27px',
    textAlign:'center',
    backgroundColor: 'var(--bg-color-ui-contrast4)',
    color:'var(--ft-color-normal)',
    '&:hover':{
      color:'var(--ft-color-loud)'
    },
    '&:first-child':{
      borderRadius:'4px 0 0 4px'
    },
    '&:last-child':{
      borderRadius:'0 4px 4px 0'
    },
    '&:first-child:last-child':{
      borderRadius:'4px'
    }
  }
});

interface FooterPanelProps {
  className: string;
  instance: Instance;
  showOpenActions: boolean;
}

const FooterPanel = observer(({ className, instance, showOpenActions }: FooterPanelProps) => {

  const classes = useStyles();

  const { appStore } = useStores();

  const location = useLocation();
  const navigate = useNavigate();

  const handleOpenInstance = async (e: MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    if(appStore.currentSpace?.id !== instance.space) {
      await appStore.switchSpace(location, navigate, instance.space);
    }
    if(e.metaKey || e.ctrlKey){
      if(instance.id) {
        appStore.openInstance(instance.id, instance.name, instance.primaryType, ViewMode.VIEW);
      }
    } else {
      navigate(`/instances/${instance.id}`);
    }
  };

  return(
    <div className={`${classes.panel} ${className} ${showOpenActions?classes.showActions:''}`}>
      <Row>
        <Col xs={10}>
          <div className={classes.info}>ID: {instance.id?instance.id:'<New>'}</div>
          <div className={classes.info}>Space: {instance.space}</div>
        </Col>
        <Col xs={2}>
          <div className={classes.actions}>
            {instance.permissions?.canRead && (
              <div className={classes.action} onClick={handleOpenInstance}>
                <FontAwesomeIcon icon="folder-open"/>
              </div>
            )}
          </div>
        </Col>
      </Row>
    </div>
  );
});
FooterPanel.displayName = 'FooterPanel';

export default FooterPanel;