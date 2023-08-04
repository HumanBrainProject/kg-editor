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

import ReleaseStatus from '../../../Components/ReleaseStatus';
import useStores from '../../../Hooks/useStores';

import ReleaseNodeToggle from './ReleaseNodeToggle';
import type { ReleaseScope } from '../../../types';
import type { MouseEvent } from 'react';

const useStyles = createUseStyles({
  container: {
    backgroundColor: '#4b4d4c',
    paddingLeft: '32px',
    position: 'relative',
    transition: 'outline-color 0.25s ease, background 0.25s ease',
    outlineColor: 'transparent',
    '&.status-UNRELEASED > .node-content': {
      backgroundColor: 'var(--release-bg-not-released)'
    },
    '&.status-HAS_CHANGED > .node-content': {
      backgroundColor: 'var(--release-bg-has-changed)'
    },
    '&.status-RELEASED > .node-content': {
      backgroundColor: 'var(--release-bg-released)'
    },
    '& .glyphicon + $label': {
      marginLeft: '10px'
    },
    '&:hover': {
      outline: '1'
    },
    '&.status-undefined': {
      '& .node-type,& $label': {
        color: 'gray'
      }
    },
    '& .node-actions': {
      position: 'absolute',
      top: '7px',
      right: '110px',
      width: '50px',
      display: 'grid',
      gridTemplateColumns: 'repeat(2, 1fr)',
      opacity: 0,
      '&:hover': {
        opacity: '1 !important'
      },
      '& .node-action': {
        fontSize: '0.9em',
        lineHeight: '27px',
        textAlign: 'center',
        backgroundColor: 'var(--bg-color-ui-contrast2)',
        color: 'var(--ft-color-normal)',
        cursor: 'pointer',
        '&.disabled': {
          color: 'var(--ft-color-quiet)',
          cursor: 'not-allowed'
        },
        '&:hover:not(.disabled)': {
          color: 'var(--ft-color-loud)'
        },
        '&:first-child': {
          borderRadius: '4px 0 0 4px'
        },
        '&:last-child': {
          borderRadius: '0 4px 4px 0'
        }
      }
    },
    '& .node-content': {
      display: 'grid',
      gridTemplateColumns: 'auto auto 1fr auto',
      padding: '8px',
      position: 'relative',
      border: '2px solid var(--bg-color-ui-contrast2)',
      transition: 'background 0.25s ease',
      marginLeft: '-32px',
      '&:hover': {
        '& + .node-actions': {
          opacity: 0.75
        }
      }
    },
    '& .status-indicator': {
      display: 'inline-block',
      verticalAlign: 'middle',
      '& > div:first-child': {
        display: 'block',
        position: 'relative',
        zIndex: '5'
      }
    },
    '& .child-icon': {
      color: 'black',
      fontSize: '1.2em',
      verticalAlign: 'middle',
      transform: 'rotateX(180deg)',
      transformOrigin: '50% 41%',
      marginRight: '5px'
    },
    '& .node-type': {
      fontSize: '0.75em',
      display: 'inline-block',
      verticalAlign: 'middle',
      fontWeight: 'bold',
      color: 'var(--ft-color-loud)',
      margin: '3px 5px 0 8px'
    }
  },
  label: {
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis'
  }
});

interface ReleaseNodeProps {
  node: ReleaseScope;
  level: number;
}

const ReleaseNode = observer(({ node, level = 0 }: ReleaseNodeProps) => {

  const classes = useStyles();

  const { instanceStore, releaseStore } = useStores();

  const handleOptionPreview = (e: MouseEvent<HTMLDivElement>) => {
    e && e.stopPropagation();
    if(!node.isAssociation) {
      const options = { showEmptyFields:false, showAction:true, showType:true, showStatus:false };
      instanceStore.togglePreviewInstance(node.id, node.label, options );
    }
  };

  const handleShowCompare = (e: MouseEvent<HTMLDivElement>) => {
    e && e.stopPropagation();
    if(!node.isAssociation) {
      releaseStore.setComparedInstance(node);
    }
  };

  if (!node || !releaseStore) {
    return null;
  }

  return (
    <div className={`${classes.container} status-${node['pending_status']}`} style={{marginLeft: 32*level}}>
      <div
        className="node-content">
        <div className={'status-indicator'}>
          <ReleaseStatus
            key={`${node['status']}`}
            instanceStatus={node['status']}
          />
        </div>
        <span className={'node-type'}>({node.typesName})</span>
        <span className={classes.label}>{node.label}</span>
        <ReleaseNodeToggle key={`${node.pending_status}-${node.pending_childrenStatus}-${node.pending_globalStatus}`} node={node} />
      </div>
      {node.status !== null && (
        <div className="node-actions">
          <div className={`node-action ${node.isAssociation ? 'disabled' : ''}`}
            onClick={handleOptionPreview}
            title={node.isAssociation ? 'linking instances are not available for preview' : `view ${node.typesName} ${node.label}`}>
            <FontAwesomeIcon icon="eye" />
          </div>
          <div className={`node-action ${node.isAssociation ? 'disabled' : ''}`}
            onClick={handleShowCompare}
            title={node.isAssociation? 'linking instances are not available for comparison': 'compare the changes with released vesion'}>
            <FontAwesomeIcon icon="glasses" />
          </div>
        </div>)}
    </div>
  );
});
ReleaseNode.displayName = 'ReleaseNode';

export default ReleaseNode;