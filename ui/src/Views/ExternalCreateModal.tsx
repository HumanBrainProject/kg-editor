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
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import ProgressBar from 'react-bootstrap/ProgressBar';
import { createUseStyles } from 'react-jss';
import { useLocation, useNavigate } from 'react-router-dom';

import useStores from '../Hooks/useStores';


const useStyles = createUseStyles({
  modal: {
    '&.modal-dialog': {
      marginTop: '40vh',
      '& .modal-content':{
        backgroundColor: 'var(--bg-color-ui-contrast2)',
        color: 'var(--ft-color-loud)',
        padding: '20px',
        '& .modal-body': {
          padding: '15px 30px',
          fontSize: '1.6rem',
          textAlign: 'center'
        }
      }
    }
  },
  save: {
    marginLeft: '10px'
  }
});

const ExternalCreateModal = observer(() => {

  const classes = useStyles();

  const location = useLocation();
  const navigate = useNavigate();

  const { appStore, instanceStore } = useStores();

  if (!appStore.externalCreateModal) {
    return null;
  }

  const handleSaveAllAndChangeSpace = async () => {
    const instancesToSave = instanceStore.getUnsavedInstances;
    appStore.updateExternalInstanceModal(instancesToSave.length);
    await Promise.all(instancesToSave.map(async instance => {
      if(!instance.isSaving) {
        await appStore.saveInstance(instance, navigate);
        appStore.updateExternalInstanceModal();
      }
    }));
    appStore.createExternalInstance(appStore.externalCreateModal.space, appStore.externalCreateModal.type, appStore.externalCreateModal.value, location, navigate);
  };

  const handleCancel = () => appStore.clearExternalCreateModal();

  return(
    <div>
      <Modal  dialogClassName={classes.modal} show={true}>
        <Modal.Body>
          {appStore.externalCreateModal.toSave ?
            <div>
              <p>Saving changes...</p>
              <ProgressBar animated now={appStore.savePercentage} label={`${appStore.externalCreateModal.saved}/${appStore.externalCreateModal.toSave}`}/>
            </div>
            :
            <>
              <p>{`Change to space "${appStore.externalCreateModal.space}" to create a new instance "${appStore.externalCreateModal.value}" of type "${appStore.externalCreateModal.type}" ?`}</p>
              <Button variant="primary" onClick={handleCancel}>Cancel</Button>
              <Button className={classes.save} variant="primary" onClick={handleSaveAllAndChangeSpace}><FontAwesomeIcon icon="save"/>&nbsp;Save and Continue</Button>
            </>
          }
        </Modal.Body>
      </Modal>
    </div>
  );
});
ExternalCreateModal.displayName = 'ExternalCreateModal';

export default ExternalCreateModal;