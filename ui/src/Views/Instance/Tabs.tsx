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

import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {observer} from 'mobx-react-lite';
import React from 'react';
import { createUseStyles } from 'react-jss';
import { useNavigate } from 'react-router-dom';

import useStores from '../../Hooks/useStores';
import Matomo from '../../Services/Matomo';
import type Instance from '../../Stores/Instance';
import type { Permissions, ViewMode } from '../../types';
import type { IconProp } from '@fortawesome/fontawesome-svg-core';

const useStyles = createUseStyles({
  tabs: {
    borderRight: '1px solid var(--border-color-ui-contrast1)',
    background: 'var(--bg-color-ui-contrast2)'
  },
  tab: {
    color: 'var(--ft-color-normal)',
    borderLeft: '2px solid transparent',
    opacity: '0.7',
    cursor: 'pointer',
    height: '50px',
    lineHeight: '50px',
    fontSize: '1.75em',
    textAlign: 'center',
    '&:hover': {
      background: 'var(--list-bg-hover)',
      borderColor: 'var(--list-border-hover)',
      color: 'var(--ft-color-loud)',
      opacity: '1'
    },
    '&.active': {
      background: 'var(--list-bg-selected)',
      borderColor: 'var(--list-border-selected)',
      color: 'var(--ft-color-loud)',
      opacity: '1'
    },
    '&.disabled, &.disabled:hover':{
      color: 'var(--ft-color-normal)',
      opacity: '0.2',
      cursor: 'not-allowed'
    }
  }
});

interface TabProps {
  className: string;
  show?: boolean;
  disabled: boolean;
  active: boolean;
  icon: IconProp;
  mode: ViewMode;
  label: string;
  onClick: (mode: ViewMode) => void;
}

const Tab = ({ className, show, disabled, active, icon, mode, label, onClick }: TabProps) => {

  if(!show) {
    return null;
  }

  const props = disabled || active ?
    {
      className: `${className} ${disabled?'disabled':''} ${active?'active':''}`
    }:
    {
      className: className,
      title: label,
      onClick: () => typeof onClick === 'function' && onClick(mode)
    };

  return(
    <div {...props} >
      <FontAwesomeIcon icon={icon}/>
    </div>
  );
};

interface TabsProps {
  instance: Instance;
  mode: ViewMode;
}

const Tabs = observer(({ instance, mode }:TabsProps) => {

  const classes = useStyles();

  const navigate = useNavigate();

  const { typeStore } = useStores();

  const isTypesSupported = typeStore.isTypesSupported(instance.typeNames);

  const handleClick = (instanceMode: ViewMode) => {
    Matomo.trackEvent('Instance', `Select${instanceMode[0].toUpperCase() + instanceMode.substr(1)}Mode`, instance.id);
    if(instanceMode === 'view') {
      navigate(`/instances/${instance.id}`);
    } else {
      navigate(`/instances/${instance.id}/${instanceMode}`);
    }
  };

  const permissions: Permissions|undefined = instance?instance.permissions:undefined;

  return (
    <div className={classes.tabs}>
      <Tab className={classes.tab} icon="eye"              mode="view"    label="View"     disabled={mode === 'create'} active={mode === 'view'}                      onClick={handleClick} show={permissions?.canRead && isTypesSupported} />
      <Tab className={classes.tab} icon="pencil-alt"       mode="edit"    label="Edit"     disabled={false}             active={mode === 'edit' || mode === 'create'} onClick={handleClick} show={(permissions?.canWrite || permissions?.canCreate) && isTypesSupported } />
      <Tab className={classes.tab} icon="project-diagram"  mode="graph"   label="Explore"  disabled={mode === 'create'} active={mode === 'graph'}                     onClick={handleClick} show={!instance.isNew && permissions?.canRead} />
      <Tab className={classes.tab} icon="cloud-upload-alt" mode="release" label="Release"  disabled={mode === 'create'} active={mode === 'release'}                   onClick={handleClick} show={!instance.isNew && permissions?.canRelease && isTypesSupported} />
      <Tab className={classes.tab} icon="cog"              mode="manage"  label="Manage"   disabled={mode === 'create'} active={mode === 'manage'}                    onClick={handleClick} show={!instance.isNew && permissions?.canRead} />
      <Tab className={classes.tab} icon="code"             mode="raw"     label="Raw view" disabled={mode === 'create'} active={mode === 'raw'}                       onClick={handleClick} show={!instance.isNew && permissions?.canRead} />
    </div>
  );
});
Tabs.displayName = 'Tabs';

export default Tabs;