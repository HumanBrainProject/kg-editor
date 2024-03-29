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

import {faTimes} from '@fortawesome/free-solid-svg-icons/faTimes';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { observer } from 'mobx-react-lite';
import React from 'react';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import { Scrollbars } from 'react-custom-scrollbars-2';
import { createUseStyles } from 'react-jss';

import useStores from '../../../Hooks/useStores';

import CompareWithReleasedVersionChanges from '../CompareWithReleasedVersionChanges';
import type { ReleaseStatus, UUID } from '../../../types';
import type { MouseEvent } from 'react';

const useStyles = createUseStyles({
  container: {
    width: '90%',
    '@media screen and (min-width:1024px)': {
      width: '900px',
      maxWidth: 'unset'
    },
    '& .modal-header': {
      overflow: 'hidden',
      whiteSpace: 'nowrap',
      textOverflow: 'ellipsis'
    },
    '& .modal-body': {
      height: 'calc(95vh - 112px)',
      padding: '3px 0'
    }
  }
});

const CompareInstancesModal = observer(() => {

  const classes = useStyles();

  const { releaseStore } = useStores();

  const handleHideCompare = (e?: MouseEvent<HTMLButtonElement>) => {
    e && e.stopPropagation();
    releaseStore.setComparedInstance(undefined);
  };

  return(
    <Modal
      show={true}
      dialogClassName={classes.container}
      onHide={handleHideCompare}
    >
      <Modal.Header closeButton>
        Compare with the released version of &nbsp;
        <strong>
          {releaseStore.comparedInstance?.typesName}&nbsp;
          {releaseStore.comparedInstance?.label}
        </strong>
      </Modal.Header>
      <Modal.Body>
        <Scrollbars autoHide>
          <CompareWithReleasedVersionChanges
            instanceId={releaseStore.comparedInstance?.id as UUID}
            status={releaseStore.comparedInstance?.status as ReleaseStatus}
          />
        </Scrollbars>
      </Modal.Body>
      <Modal.Footer>
        <Button size="sm" onClick={handleHideCompare} >
          <FontAwesomeIcon icon={faTimes} />&nbsp;Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
});
CompareInstancesModal.displayName = 'CompareInstancesModal';

export default CompareInstancesModal;