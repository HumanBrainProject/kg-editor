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

import {faCircle} from '@fortawesome/free-solid-svg-icons/faCircle';
import {faCloudUploadAlt} from '@fortawesome/free-solid-svg-icons/faCloudUploadAlt';
import {faCode} from '@fortawesome/free-solid-svg-icons/faCode';
import {faCog} from '@fortawesome/free-solid-svg-icons/faCog';
import {faEye} from '@fortawesome/free-solid-svg-icons/faEye';
import {faPencilAlt} from '@fortawesome/free-solid-svg-icons/faPencilAlt';
import {faProjectDiagram} from '@fortawesome/free-solid-svg-icons/faProjectDiagram';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { observer } from 'mobx-react-lite';
import React, { useRef } from 'react';
import Form from 'react-bootstrap/Form';
import { createUseStyles } from 'react-jss';
import Field from '../../Fields/Field';
import useStores from '../../Hooks/useStores';
import { ViewMode } from '../../types';
import Status from './Status';

import type Instance from '../../Stores/Instance';
import type { IconProp } from '@fortawesome/fontawesome-svg-core';
import type { MouseEvent } from 'react';

const useStyles = createUseStyles({
  container: {
    position: 'relative',
    minHeight: '47px',
    cursor: 'pointer',
    padding: '10px',
    background: 'var(--bg-color-ui-contrast2)',
    borderLeft: '4px solid transparent',
    color: 'var(--ft-color-normal)',
    outline: '1px solid var(--border-color-ui-contrast1)',
    marginBottom: '11px',
    '&:hover': {
      background: 'var(--list-bg-hover)',
      borderColor: 'var(--list-border-hover)',
      color: 'var(--ft-color-loud)',
      outline: '1px solid transparent',
      '& $actions': {
        opacity: 0.75
      },
      '& .status': {
        opacity: 1
      },
      '& $type': {
        opacity: '1'
      }
    },
    '& .status': {
      marginRight: '13px',
      opacity: 0.5,
      verticalAlign: 'text-top'
    },
    '&.selected': {
      background: 'var(--list-bg-selected)',
      borderColor: 'var(--list-border-selected)',
      color: 'var(--ft-color-loud)',
      outline: '1px solid transparent',
      '& .status': {
        opacity: '1'
      },
      '& $type': {
        opacity: '1'
      }
    }
  },
  type: {
    display: 'inline-block',
    opacity: '0.5',
    paddingRight: '8px',
    verticalAlign: 'text-bottom'
  },
  name: {
    display: 'inline',
    fontSize: '1.25em',
    fontWeight: '300',
    color: 'var(--ft-color-louder)'
  },
  description: {
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
    marginTop: '5px'
  },
  actions: {
    position: 'absolute',
    top: '10px',
    right: '10px',
    display: 'flex',
    alignItems: 'flex-end',
    opacity: 0,
    '&:hover': {
      opacity: '1 !important'
    }
  },
  action: {
    fontSize: '0.9em',
    lineHeight: '27px',
    textAlign: 'center',
    backgroundColor: 'var(--bg-color-ui-contrast2)',
    color: 'var(--ft-color-normal)',
    width: '25px',
    '&:hover': {
      color: 'var(--ft-color-loud)'
    },
    '&:first-child': {
      borderRadius: '4px 0 0 4px'
    },
    '&:last-child': {
      borderRadius: '0 4px 4px 0'
    }
  },
  separator: {
    position: 'absolute',
    top: '10px',
    left: '55px',
    height: 'calc(100% - 20px)',
    borderRight: '1px solid var(--border-color-ui-contrast1)'
  },
  statusAndNameRow: {
    display: 'flex',
    alignItems: 'center'
  },
  fields: {
    marginTop: '8px',
    wordBreak: 'break-word'
  }
});

interface ActionProps {
  className: string;
  show?: boolean;
  icon: IconProp;
  mode: ViewMode;
  label: string;
  onClick: (mode: ViewMode) => void;
  onCtrlClick: (mode: ViewMode) => void;
}

const Action = ({
  className,
  show,
  icon,
  mode,
  label,
  onClick,
  onCtrlClick
}: ActionProps) => {
  if (!show) {
    return null;
  }

  const handleClick = (e: MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    if (!e.currentTarget.contains(e.target as Node)) {
      return;
    }
    if (e.metaKey || e.ctrlKey) {
      onCtrlClick(mode);
    } else {
      onClick(mode);
    }
  };

  return (
    <div className={className} onClick={handleClick} title={label}>
      <FontAwesomeIcon icon={icon} />
    </div>
  );
};

interface InstanceRowProps {
  instance: Instance;
  selected: boolean;
  onClick: (instance: Instance) => void;
  onCtrlClick: (instance: Instance) => void;
  onActionClick: (instance: Instance, mode: ViewMode) => void;
}

const InstanceRow = observer(
  ({
    instance,
    selected,
    onClick,
    onCtrlClick,
    onActionClick
  }: InstanceRowProps) => {
    const classes = useStyles();

    const { typeStore } = useStores();

    const isTypesSupported = typeStore.isTypesSupported(instance.typeNames);

    const { permissions } = instance;

    const timeout = useRef<NodeJS.Timeout | undefined>(undefined);

    const handleClick = (e: MouseEvent<HTMLDivElement>) => {
      e.stopPropagation();
      if (!e.currentTarget.contains(e.target as Node)) {
        return;
      }
      if (timeout.current === undefined) {
        const action = (e.metaKey || e.ctrlKey)?onCtrlClick:onClick;
        timeout.current = setTimeout(
          (i, act) => {
            timeout.current = undefined;
            act(i);
          },
          300,
          instance,
          action
        );
      }
    };

    const handleDoubleClick = (e: MouseEvent<HTMLDivElement>) => {
      e.stopPropagation();
      clearTimeout(timeout.current);
      timeout.current = undefined;
      if (!e.currentTarget.contains(e.target as Node)) {
        return;
      }
      if (e.metaKey || e.ctrlKey) {
        onCtrlClick(instance);
      } else {
        const isTypesSupported = typeStore.isTypesSupported(instance.typeNames);
        const mode = isTypesSupported ? ViewMode.VIEW : ViewMode.RAW;
        onActionClick(instance, mode);
      }
    };

    const handleActionCtrlClick = () => {
      onCtrlClick(instance);
    };

    const handleActionClick = (mode: ViewMode) => {
      onActionClick(instance, mode);
    };

    return (
      <div
        className={`${classes.container} ${selected ? 'selected' : ''}`}
        onClick={handleClick}
        onDoubleClick={handleDoubleClick}
      >
        <div className={classes.statusAndNameRow}>
          <Status id={instance.id} darkmode={true} />
          <div
            className={classes.type}
            style={
              instance.primaryType.color
                ? { color: instance.primaryType.color }
                : {}
            }
            title={instance.primaryType.name}
          >
            <FontAwesomeIcon fixedWidth icon={faCircle} />
          </div>
          <div className={classes.name}>{instance.name}</div>
        </div>
        <Form>
          {Object.entries(instance.fields).map(([name, fieldStore]) => (
            <Field
              name={name}
              key={name}
              fieldStore={fieldStore}
              readMode={true}
              className={classes.fields}
            />
          ))}
        </Form>
        <div className={classes.actions}>
          <Action
            className={classes.action}
            show={permissions?.canRead && isTypesSupported}
            icon={faEye}
            mode={ViewMode.VIEW}
            label="Open"
            onClick={handleActionClick}
            onCtrlClick={handleActionCtrlClick}
          />
          <Action
            className={classes.action}
            show={permissions?.canWrite && isTypesSupported}
            icon={faPencilAlt}
            mode={ViewMode.EDIT}
            label="Edit"
            onClick={handleActionClick}
            onCtrlClick={handleActionCtrlClick}
          />
          <Action
            className={classes.action}
            show={permissions?.canRead}
            icon={faProjectDiagram}
            mode={ViewMode.GRAPH}
            label="Explore"
            onClick={handleActionClick}
            onCtrlClick={handleActionCtrlClick}
          />
          <Action
            className={classes.action}
            show={permissions?.canRelease && isTypesSupported}
            icon={faCloudUploadAlt}
            mode={ViewMode.RELEASE}
            label="Release"
            onClick={handleActionClick}
            onCtrlClick={handleActionCtrlClick}
          />
          <Action
            className={classes.action}
            show={permissions?.canRead}
            icon={faCog}
            mode={ViewMode.MANAGE}
            label="Manage"
            onClick={handleActionClick}
            onCtrlClick={handleActionCtrlClick}
          />
          <Action
            className={classes.action}
            show={permissions?.canRead}
            icon={faCode}
            mode={ViewMode.RAW}
            label="Raw view"
            onClick={handleActionClick}
            onCtrlClick={handleActionCtrlClick}
          />
        </div>
      </div>
    );
  }
);
InstanceRow.displayName = 'InstanceRow';

export default InstanceRow;
