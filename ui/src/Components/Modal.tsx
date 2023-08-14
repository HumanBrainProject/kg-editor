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
import type { ReactNode } from 'react';

const useStyles = createUseStyles({
  modal: {
    overflow: 'hidden',
    margin: 'auto',
    '&.modal-dialog': {
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
          overflowY: 'hidden'
        },
        '& .modal-footer': {
          borderTop: '1px solid var(--border-color-ui-contrast5)',
        }
      }
    }
  },
  smallModal: {
    width: 'fit-content',
    '&.modal-dialog': {
      marginTop: 'min(25vh, 25%)'
    }

  },
  largeModal: {
    width: '90%',
    '@media screen and (min-width:1024px)': {
      width: '900px'
    },
    '&.modal-dialog': {
      marginTop: '5vh',
      '& .modal-body': {
        height: '80vh'
      }
    }
  }
});

//margin-top: min(25vh, 25%);

interface HeaderProps {
  title: string;
  closeButton?: boolean;
}

const Header = ({ title, closeButton }: HeaderProps) => {

  const hasCloseButton = closeButton === undefined?true:closeButton;

  return (
    <ModalComponent.Header closeButton={hasCloseButton} closeVariant="white">
      <ModalComponent.Title>{title}</ModalComponent.Title>
    </ModalComponent.Header>
  );
};

interface BodyProps {
  children: ReactNode;
}

const Body = ({ children }: BodyProps) => (
  <ModalComponent.Body>
    {children}
  </ModalComponent.Body>
);

interface FooterProps {
  children: ReactNode;
}

const Footer = ({ children }: FooterProps) => (
  <ModalComponent.Footer>
    {children}
  </ModalComponent.Footer>
);

enum ModalSize {
  FIT = 'fit',
  LARGE = 'large'
}

interface ModalProps {
  size?: ModalSize;
  show?: boolean;
  backdrop?: boolean | 'static';
  keyboard?: boolean;
  onHide?: () => void;
  children: ReactNode;
}

const Modal = ({ show, size=ModalSize.LARGE, backdrop=undefined, keyboard=true, onHide, children }: ModalProps) => {

  const classes = useStyles();

  return (
    <ModalComponent dialogClassName={`${classes.modal} ${size===ModalSize.FIT?classes.smallModal:classes.largeModal}`} backdrop={backdrop} keyboard={keyboard} show={show === undefined?true:show} onHide={onHide}>
      {children}
    </ModalComponent>
  );
};
Modal.Header = Header;
Modal.Body = Body;
Modal.Footer = Footer;
Modal.size = ModalSize;

export default Modal;

