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

import {faCloudUploadAlt} from '@fortawesome/free-solid-svg-icons/faCloudUploadAlt';
import {faCode} from '@fortawesome/free-solid-svg-icons/faCode';
import {faCog} from '@fortawesome/free-solid-svg-icons/faCog';
import {faEye} from '@fortawesome/free-solid-svg-icons/faEye';
import {faPencilAlt} from '@fortawesome/free-solid-svg-icons/faPencilAlt';
import {faProjectDiagram} from '@fortawesome/free-solid-svg-icons/faProjectDiagram';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { observer } from 'mobx-react-lite';
import React from 'react';
import { createUseStyles } from 'react-jss';

import { useNavigate } from 'react-router-dom';
import useStores from '../../Hooks/useStores';
import { ViewMode } from '../../types';
import type Instance from '../../Stores/Instance';
import type { IconProp } from '@fortawesome/fontawesome-svg-core';
import type { MouseEvent } from 'react';

interface ActionProps {
  className: string;
  show?: boolean;
  label: string;
  icon: IconProp;
  mode: ViewMode;
  onClick: (v: ViewMode) => void;
  onCtrlClick: (v: ViewMode) => void;
}

const Action = ({
  className,
  show,
  label,
  icon,
  mode,
  onClick,
  onCtrlClick
}: ActionProps) => {
  const handleClick = (event: MouseEvent<HTMLDivElement>) => {
    if (event.metaKey || event.ctrlKey) {
      onCtrlClick(mode);
    } else {
      onClick(mode);
    }
  };

  if (!show) {
    return null;
  }

  return (
    <div className={className} onClick={handleClick}>
      <FontAwesomeIcon icon={icon} />
      &nbsp;&nbsp;{label}
    </div>
  );
};

const useStyles = createUseStyles({
  actions: {
    display: 'grid',
    gridTemplateColumns: 'repeat(6, 1fr)',
    gridGap: '10px',
    marginBottom: '20px'
  },
  action: {
    height: '34px',
    cursor: 'pointer',
    overflow: 'hidden',
    lineHeight: '34px',
    textAlign: 'center',
    borderRadius: '2px',
    backgroundColor: 'var(--bg-color-blend-contrast1)',
    color: 'var(--ft-color-normal)',
    '&:hover': {
      color: 'var(--ft-color-loud)'
    }
  }
});

interface ActionsProps {
  instance: Instance;
}

const Actions = observer(({ instance }: ActionsProps) => {
  const { id, name, primaryType, permissions } = instance;
  const classes = useStyles();

  const { appStore } = useStores();
  const navigate = useNavigate();

  const handleCtrlClick = (mode: ViewMode) => {
    if (id) {
      appStore.openInstance(id, name, primaryType, mode);
    }
  };

  const handleClick = (mode: ViewMode) => {
    if (mode === ViewMode.VIEW) {
      navigate(`/instances/${id}`);
    } else {
      navigate(`/instances/${id}/${mode}`);
    }
  };

  return (
    <div className={classes.actions}>
      <Action
        className={classes.action}
        show={permissions?.canRead}
        icon={faEye}
        label="Open"
        mode={ViewMode.VIEW}
        onClick={handleClick}
        onCtrlClick={handleCtrlClick}
      />
      <Action
        className={classes.action}
        show={permissions?.canWrite}
        icon={faPencilAlt}
        label="Edit"
        mode={ViewMode.EDIT}
        onClick={handleClick}
        onCtrlClick={handleCtrlClick}
      />
      <Action
        className={classes.action}
        show={permissions?.canRead}
        icon={faProjectDiagram}
        label="Explore"
        mode={ViewMode.GRAPH}
        onClick={handleClick}
        onCtrlClick={handleCtrlClick}
      />
      <Action
        className={classes.action}
        show={permissions?.canRelease}
        icon={faCloudUploadAlt}
        label="Release"
        mode={ViewMode.RELEASE}
        onClick={handleClick}
        onCtrlClick={handleCtrlClick}
      />
      <Action
        className={classes.action}
        show={permissions?.canDelete || permissions?.canCreate}
        icon={faCog}
        label="Manage"
        mode={ViewMode.MANAGE}
        onClick={handleClick}
        onCtrlClick={handleCtrlClick}
      />
      <Action
        className={classes.action}
        show={permissions?.canRead}
        icon={faCode}
        label="Raw view"
        mode={ViewMode.RAW}
        onClick={handleClick}
        onCtrlClick={handleCtrlClick}
      />
    </div>
  );
});
Actions.displayName = 'Actions';

export default Actions;
