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

import React from 'react';
import ModalComponent from 'react-bootstrap/Modal';
import { createUseStyles } from 'react-jss';

const useStyles = createUseStyles({
  modal: {
    overflow: 'hidden',
    width: '90%',
    margin: 'auto',
    '@media screen and (min-width:1024px)': {
      width: '900px'
    },
    '&.modal-dialog': {
      marginTop: '5vh',
      maxWidth: 'unset',
      '& .modal-content': {
        background: 'var(--bg-color-ui-contrast2)',
        color: 'var(--ft-color-normal)',
        border: '1px solid var(--border-color-ui-contrast5)',
        '& .modal-header': {
          borderBottom: '1px solid var(--border-color-ui-contrast5)'
        },
        '& .modal-body': {
          borderRadius: 'var(--bs-modal-border-radius)',
          padding: '0',
          height: '80vh',
          overflowY: 'hidden'
        }
      }
    }
  }
});

interface ModalProps {
  title: string;
  show?: boolean;
  closeButton?: boolean;
  onHide?: () => void;
  children: JSX.Element | JSX.Element[];
}

const Modal = ({ title, show, closeButton, onHide, children }: ModalProps) => {

  const classes = useStyles();

  return (
    <ModalComponent dialogClassName={classes.modal} show={show === undefined?true:show} onHide={onHide}>
      <ModalComponent.Header closeButton={closeButton === undefined?true:closeButton} closeVariant="white">
        <ModalComponent.Title>{title}</ModalComponent.Title>
      </ModalComponent.Header>
      <ModalComponent.Body>
        {children}
      </ModalComponent.Body>
    </ModalComponent>
  );
};

export default Modal;

