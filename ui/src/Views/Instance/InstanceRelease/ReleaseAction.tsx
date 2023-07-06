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
import React, { useState}  from 'react';
import Button from 'react-bootstrap/Button';
import { createUseStyles } from 'react-jss';

import useStores from '../../../Hooks/useStores';

import Matomo from '../../../Services/Matomo';
import ClientPreviewModal from './ClientPreviewModal';
import ReleaseStats from './ReleaseStats';
import Reviewers from './Reviewers';

const useStyles = createUseStyles({
  container: {
    display: 'grid',
    gridTemplateRows: 'auto auto auto 1fr auto',
    gridTemplateColumns: '1fr',
    gridRowGap: '15px',
    width: '100%',
    height: '100%'
  },
  releasePnl: {
    textAlign: 'center'
  },
  releaseButton: {
    fontSize: '1.5em',
    outline: 'none',
    '&[disabled]': {
      opacity: 1,
      backgroundColor: '#748ca6',
      borderColor: '#748ca6',
      color: '#9f9f9f'
    },
    '&:focus, &:active, &:focus:active, &:hover, &[disabled], &[disabled]:focus, &[disabled]:active, &[disabled]:focus:active, &[disabled]:hover': {
      outline: 'none'
    },
    '&[disabled]:focus, &[disabled]:active, &[disabled]:focus:active, &[disabled]:hover': {
      cursor: 'default'
    },
    '& div': {
      display: 'inline',
      marginLeft: '6px'
    },
    '@media screen and (min-height:1024px)': {
      fontWeight: 'bold',
      fontSize: '2em',
      borderRadius: '50%',
      width: '200px',
      height: '200px',
      '& div': {
        display: 'block',
        marginLeft: 0
      }
    }
  },
  preview: {
    width: '100%',
    display: 'grid',
    gridTemplateColumns: '1fr auto',
    border: '1px solid var(--border-color-ui-contrast1)',
    padding: '10px',
    fontSize: 'large',
    background: 'var(--bg-color-ui-contrast3)'
  },
  invite: {
    width: '100%',
    border: '1px solid var(--border-color-ui-contrast1)',
    padding: '10px',
    background: 'var(--bg-color-ui-contrast3)'
  },
  section: {
    paddingBottom: '10px',
    '& h5': {
      fontSize: '0.8em',
      fontWeight: 'bold'
    },
    '& .content': {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      '&.previewContent': {
        gridTemplateColumns: '2fr 1fr',
        '& .previewIcon': {
          fontSize: '1em',
          fontWeight: 'bold',
          textAlign: 'right',
          paddingRight: '4px',
          cursor: 'pointer',
          '& :hover': {
            color: 'lightgrey'
          }
        }
      },
      '& .type': {
        fontSize: '0.8em',
        paddingLeft: '4px',
        lineHeight: '16px'
      }
    }
  }
});


const ReleaseAction = observer(() => {

  const classes = useStyles();

  const { releaseStore, instanceStore } = useStores();

  const [showModal, setShowModal] = useState(false);

  const handleProceed = () => {
    if (!releaseStore.isSaving) {
      Matomo.trackEvent('Instance', 'Release', releaseStore.topInstanceId);
      releaseStore.commitStatusChanges();
    }
  };

  const handleOpenModal = () => setShowModal(true);

  const handleCloseModal = () => setShowModal(false);

  if (!releaseStore.treeStats) {
    return null;
  }

  const getTitle = () => {
    if(releaseStore.isSaving) {
      return 'Saving...';
    }
    if (releaseStore.treeStats?.proceed_release === 0 && releaseStore.treeStats.proceed_unrelease === 0) {
      return 'No pending changes to release';
    }
    return 'Proceed';
  };

  const instance = releaseStore.topInstanceId ? instanceStore.instances.get(releaseStore.topInstanceId): undefined;
  const permissions = instance && instance.permissions;
  const title = getTitle();
  return (
    <div className={classes.container}>
      <ReleaseStats />
      <div className={classes.preview}>
        <div className={classes.section}>
          <h5>Preview:</h5>
          <div className={'content previewContent'}>
            <div className={'type'}>Search</div>
            <div
              onClick={handleOpenModal}
              className={'previewIcon'}
              title="Preview in KG Search"
            >
              <FontAwesomeIcon style={{ verticalAlign: 'top' }} icon="eye" />
            </div>
          </div>
        </div>
      </div>
      <div className={classes.invite}>
        {(permissions && permissions.canInviteForSuggestion) && (
          <Reviewers id={releaseStore.topInstanceId} />
        )}
      </div>
      <div className={classes.releasePnl} >
        <Button
          onClick={handleProceed}
          disabled={
            releaseStore.isSaving ||
              (releaseStore.treeStats.proceed_release === 0 &&
                releaseStore.treeStats.proceed_unrelease === 0)
          }
          bsPrefix={`${classes.releaseButton} btn btn-primary`}
          variant={'primary'}
          title={title}
        >
          <FontAwesomeIcon
            icon={releaseStore.isSaving ? 'circle-notch' : 'cloud-upload-alt'}
            spin={releaseStore.isSaving}
          />
          <div>{releaseStore.isSaving ? 'Saving...' : 'Proceed'}</div>
        </Button>
      </div>
      <ClientPreviewModal
        instanceId={releaseStore.topInstanceId}
        show={showModal}
        handleClose={handleCloseModal}
      />
    </div>
  );
});
ReleaseAction.displayName = 'ReleaseAction';

export default ReleaseAction;