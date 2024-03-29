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

import {faCircleNotch} from '@fortawesome/free-solid-svg-icons/faCircleNotch';
import {faTimesCircle} from '@fortawesome/free-solid-svg-icons/faTimesCircle';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { observer } from 'mobx-react-lite';
import React from 'react';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import ProgressBar from 'react-bootstrap/ProgressBar';
import { createUseStyles } from 'react-jss';

import useStores from '../../../Hooks/useStores';

const useStyles = createUseStyles({
  lastEndedOperation: {
    fontWeight: 'bold',
    fontSize: '0.8em',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
    overflow: 'hidden'
  },
  lastEndedInstance: {
    fontWeight: 'bold',
    fontSize: '0.8em',
    whiteSpace: 'nowrap'
  },
  reloadRelease: {
    extend: 'lastEndedOperation'
  },
  error: {
    background: 'rgba(255,0,0,0.1)',
    borderTop: '1px solid #f5f5f5',
    padding: '10px 5px',
    fontWeight: 'bold',
    fontSize: '0.8em',
    '&:last-child': {
      borderBottom: '1px solid #f5f5f5'
    },
    '&:nth-child(odd)': {
      background: 'rgba(255,0,0,0.15)'
    }
  },
  errors: {
    marginTop: '10px'
  },
  absoluteProgress: {
    fontSize: '12px',
    transform: 'translateY(-10px)',
    marginTop: '-10px'
  }
});

interface AfterSaveProps {
  hasSavingErrors: boolean;
  className: string;
}

const AfterSave = observer(({ hasSavingErrors, className }:AfterSaveProps) => {
  if (hasSavingErrors) {
    return null;
  }
  return (
    <div className={className}>
      <FontAwesomeIcon icon={faCircleNotch} spin />
      &nbsp;&nbsp;Reloading current instance release status
    </div>
  );
});

const SavingModal = observer(() => {
  const classes = useStyles();

  const { releaseStore } = useStores();

  const handleDismissSavingReport = () => releaseStore.dismissSaveError();

  const handleStop = () => releaseStore.stopRelease();

  return (
    <Modal show={releaseStore.isSaving}>
      <Modal.Body>
        <ProgressBar
          animated={releaseStore.savingProgress !== releaseStore.savingTotal}
          now={
            releaseStore.savingTotal <= 0
              ? 100
              : Math.round(
                (releaseStore.savingProgress / releaseStore.savingTotal) * 100
              )
          }
          label={`${
            releaseStore.savingTotal <= 0
              ? 100
              : Math.round(
                (releaseStore.savingProgress / releaseStore.savingTotal) * 100
              )
          }%`}
        />
        <div className={classes.absoluteProgress}>
          {releaseStore.savingProgress} / {releaseStore.savingTotal}
        </div>
        {releaseStore.savingProgress !== releaseStore.savingTotal ? (
          <>
            <div className={classes.lastEndedInstance}>
              {releaseStore.savingLastEndedNode &&
                releaseStore.savingLastEndedNode.label}
            </div>
            <div className={classes.lastEndedOperation}>
              {releaseStore.savingLastEndedRequest}
            </div>
          </>
        ) : (
          <AfterSave
            hasSavingErrors={releaseStore.savingErrors.length !== 0}
            className={classes.reloadRelease}
          />
        )}
        {releaseStore.savingErrors.length > 0 && (
          <div className={classes.errors}>
            {releaseStore.savingErrors.map((error) => (
              <div key={error.node.id} className={classes.error}>
                <FontAwesomeIcon icon={faTimesCircle} />
                  &nbsp; ({error.node.typesName}) {error.node.label}
                <br />
                <br />
                {error.message}
              </div>
            ))}
          </div>
        )}
      </Modal.Body>
      {releaseStore.savingErrors.length > 0 &&
      releaseStore.savingProgress === releaseStore.savingTotal ? (
          <Modal.Footer>
            <Button variant="primary" onClick={handleDismissSavingReport}>
            Dismiss
            </Button>
          </Modal.Footer>
        ) : (
          <Modal.Footer>
            <Button variant="danger" onClick={handleStop}>
            Stop
            </Button>
          </Modal.Footer>
        )}
    </Modal>
  );
});

export default SavingModal;
