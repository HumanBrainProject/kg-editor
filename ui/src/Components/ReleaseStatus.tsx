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
import uniqueId from 'lodash/uniqueId';
import React from 'react';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';
import { createUseStyles } from 'react-jss';

const useStyles = createUseStyles({
  status: {
    borderRadius: '0.14em',
    width: '2.5em',
    textAlign: 'center',
    opacity: 1,
    padding: '2px',
    lineHeight: 'normal',
    background: 'currentColor',
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(50%, 1fr))',
    color: '#404040',
    '&.status-UNRELEASED': {
      color: 'var(--ft-color-error)'
    },
    '&.status-HAS_CHANGED': {
      color: '#f39c12'
    },
    '&.status-RELEASED': {
      color: '#337ab7'
    },
    '&.status-undefined $instanceStatus': {
      color: 'gray'
    },
    '&.darkmode $instanceStatus': {
      color: 'var(--bg-color-ui-contrast2)'
    },
    '&.high-contrast $instanceStatus': {
      backgroundColor: 'var(--bg-color-ui-contrast2)'
    }
  },
  instanceStatus: {
    color: 'white',
    '& .svg-inline--fa': {
      fontSize: '0.7em',
      verticalAlign: 'baseline'
    },
    '&:only-child': {
      '& .svg-inline--fa': {
        fontSize: '0.8em'
      }
    }

  }
});

const getIconStatus = (status: string) => {
  switch (status) {
  case 'UNRELEASED': return 'unlink';
  case 'HAS_CHANGED': return 'pencil-alt';
  case 'RELEASED': return 'check';
  default: break;
  }
  return 'question';
};

interface MessageStatusProps {
  status: string;
}

const MessageStatus = ({status}: MessageStatusProps) => {
  switch (status) {
  case 'UNRELEASED': return <span>This instance is <strong>not released</strong>.</span>;
  case 'HAS_CHANGED': return <span>This instance is <strong>different</strong> than its released version</span>;
  case 'RELEASED': return <span>This instance is <strong>released</strong></span>;
  default: break;
  }
  return <strong>Unknown entity</strong>;
};

interface ReleaseStatusProps {
  instanceStatus: string;
  darkmode?: boolean;
}

const ReleaseStatus = ({instanceStatus, darkmode}: ReleaseStatusProps) => {
  const classes = useStyles();
  return (
    <OverlayTrigger placement="top" overlay={
      <Tooltip id={uniqueId('release-tooltip')}>
        <div>
          <MessageStatus status={instanceStatus} />
        </div>
      </Tooltip>
    }>
      <div className={`${classes.status} ${darkmode? 'darkmode' : ''} status-${instanceStatus}`}>
        <div className={`${classes.instanceStatus}  `}>
          <FontAwesomeIcon icon={getIconStatus(instanceStatus)} />
        </div>
      </div>
    </OverlayTrigger>
  );
};

export default ReleaseStatus;