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
import { observer } from 'mobx-react-lite';
import React, { useState, useEffect, useRef } from 'react';
import Button from 'react-bootstrap/Button';
import Overlay from 'react-bootstrap/Overlay';
import Popover from 'react-bootstrap/Popover';
import { createUseStyles } from 'react-jss';
import type { ReactNode, MouseEvent } from 'react';
import type { Placement } from 'react-bootstrap/esm/types';

const useStyles = createUseStyles({
  container: {
    position: 'relative',
    display: 'inline-block'
  },
  button: {
    position: 'relative',
    minWidth: '1.1em',
    margin: 0,
    padding: 0,
    border: 0,
    backgroundColor: 'transparent',
    outline: 0
  },
  popOver: {
    background: 'var(--bg-color-ui-contrast6)',
    border: '1px solid var(--border-color-ui-contrast6)',
    '& .arrow:after': {
      borderBottomColor: 'var(--border-color-ui-contrast6) !important'
    }
  },
  popOverContent: {
    margin: '20px 0',
    color:'var(--ft-color-loud)'
  },
  popOverCloseButton: {
    position: 'absolute',
    top: '3px',
    right: '3px',
    color:'var(--ft-color-loud)',
    backgroundColor: 'transparent',
    border: 'transparent'
  },
  popOverFooterBar: {
    marginBottom: '10px',
    width: '100%',
    textAlign: 'center',
    wordBreak: 'keep-all',
    whiteSpace: 'nowrap',
    '& button + button': {
      marginLeft: '20px'
    }
  },
  fetchErrorIcon: {
    color: 'var(--ft-color-error)'
  }
});

const windowHeight = () => {
  const w = window,
    d = document,
    e = d.documentElement,
    g = d.getElementsByTagName('body')[0];
  return w.innerHeight || e.clientHeight || g.clientHeight;
};

interface PopOverContentProps {
  onSizeChange: (v: DOMRect) => void;
  children: ReactNode;
}

const PopOverContent = ({ onSizeChange, children}: PopOverContentProps) => {

  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current) {
      typeof onSizeChange === 'function' && onSizeChange(ref.current.getBoundingClientRect());
    }
  });

  return (
    <div ref={ref}>
      {children}
    </div>
  );
};

interface PopOverButtonProps {
  buttonTitle: string;
  children: ReactNode;
  onOk: () => void;
}

const PopOverButton = observer(({ buttonTitle, children, onOk }: PopOverButtonProps) => {

  const classes = useStyles();

  const [showPopOver, setShowPopOver] = useState(false);
  const [popOverPosition, setPopOverPosition] = useState<Placement>('bottom');

  const buttonRef = useRef<HTMLButtonElement>(null);

  const handlePopOverPosition = (popOverRect:DOMRect ) => {
    if (!popOverRect) { return null; }
    const buttonRect = buttonRef.current?.getBoundingClientRect();
    const position = buttonRect && (buttonRect.bottom + popOverRect.height + 5) >= windowHeight()?'top':'bottom';
    if (popOverPosition !== position) {
      setPopOverPosition(position);
    }
  };

  const handleButtonClick = (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    setShowPopOver(!showPopOver);
  };

  const handlePopOverClose = (e: Event | MouseEvent<HTMLButtonElement>) => {
    e && e.stopPropagation();
    setShowPopOver(false);
  };

  const handleOkClick = (e: MouseEvent<HTMLButtonElement>) => {
    e && e.stopPropagation();
    setShowPopOver(false);
    onOk();
  };

  return(
    <div className={classes.container}>
      <button className={classes.button} onClick={handleButtonClick} title={buttonTitle} ref={buttonRef}>
        <FontAwesomeIcon icon="exclamation-triangle" className={classes.fetchErrorIcon}/>
      </button>
      <Overlay
        show={showPopOver}
        target={buttonRef.current}
        placement={popOverPosition}
        container={document.body}
        rootClose={true}
        onHide={handlePopOverClose}
      >
        <Popover id={uniqueId('popover')} className={classes.popOver}>
          <PopOverContent onSizeChange={handlePopOverPosition}>
            <div className={classes.popOverContent}>
              {children}
            </div>
            <div className={classes.popOverFooterBar}>
              <Button variant="primary" size="sm" onClick={handleOkClick}><FontAwesomeIcon icon="redo-alt"/>&nbsp;Retry</Button>
            </div>
            <button className={classes.popOverCloseButton} onClick={handlePopOverClose} title="close"><FontAwesomeIcon icon="times" /></button>
          </PopOverContent>
        </Popover>
      </Overlay>
    </div>
  );
});
PopOverButton.displayName = 'PopOverButton';

export default PopOverButton;