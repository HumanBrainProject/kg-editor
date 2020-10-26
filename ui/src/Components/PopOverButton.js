/*
*   Copyright (c) 2020, EPFL/Human Brain Project PCO
*
*   Licensed under the Apache License, Version 2.0 (the "License");
*   you may not use this file except in compliance with the License.
*   You may obtain a copy of the License at
*
*       http://www.apache.org/licenses/LICENSE-2.0
*
*   Unless required by applicable law or agreed to in writing, software
*   distributed under the License is distributed on an "AS IS" BASIS,
*   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
*   See the License for the specific language governing permissions and
*   limitations under the License.
*/

import React, { useState, useEffect, useRef } from "react";
import { observer } from "mobx-react";
import { createUseStyles } from "react-jss";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Overlay from "react-bootstrap/Overlay";
import Popover from "react-bootstrap/Popover";
import Button from "react-bootstrap/Button";
import {uniqueId} from "lodash";

const useStyles = createUseStyles({
  container: {
    position: "relative",
    display: "inline-block"
  },
  button: {
    position: "relative",
    minWidth: "1.1em",
    margin: 0,
    padding: 0,
    border: 0,
    backgroundColor: "transparent",
    outline: 0
  },
  popOver: {
    background: "var(--list-bg-hover)",
    border: "1px solid var(--list-border-hover)",
    "& .arrow:after": {
      borderBottomColor: "var(--list-border-hover) !important"
    }
  },
  popOverContent: {
    margin: "20px 0",
    color:"var(--ft-color-loud)"
  },
  popOverCloseButton: {
    position: "absolute",
    top: "3px",
    right: "3px",
    color:"var(--ft-color-loud)",
    backgroundColor: "transparent",
    border: "transparent"
  },
  popOverFooterBar: {
    marginBottom: "10px",
    width: "100%",
    textAlign: "center",
    wordBreak: "keep-all",
    whiteSpace: "nowrap",
    "& button + button": {
      marginLeft: "20px"
    }
  }
});

const windowHeight = () => {
  const w = window,
    d = document,
    e = d.documentElement,
    g = d.getElementsByTagName("body")[0];
  return w.innerHeight || e.clientHeight || g.clientHeight;
};

const PopOverContent = ({ onSizeChange, children}) => {

  const ref = useRef();

  useEffect(() => {
    if (ref.current) {
      typeof onSizeChange === "function" && onSizeChange(ref.current.getBoundingClientRect());
    }
  });

  return (
    <div ref={ref}>
      {children}
    </div>
  );
};

const PopOverButton = observer(({ className, buttonClassName, buttonTitle, iconComponent, iconProps, okComponent, okProps, cancelComponent, cancelProps, children, onClose, onOk, onCancel }) => {

  const classes = useStyles();

  const [showPopOver, setShowPopOver] = useState(false);
  const [popOverPosition, setPopOverPosition] = useState("bottom");

  useEffect(() => {
    return () => {
      handlePopOverClose();
    };
  }, []);

  const buttonRef = useRef();

  const handlePopOverPosition = popOverRect => {
    if (!popOverRect) { return null; }
    const buttonRect = buttonRef.current.getBoundingClientRect();
    const position = (buttonRect.bottom + popOverRect.height + 5) >= windowHeight()?"top":"bottom";
    if (popOverPosition !== position) {
      setPopOverPosition(position);
    }
  };

  const handleButtonClick = event => {
    event.stopPropagation();
    setShowPopOver(!showPopOver);
  };

  const handlePopOverClose = e => {
    e && e.stopPropagation();
    setShowPopOver(false);
    typeof onClose === "function" && onClose();
  };

  const handleCancelClick = e => {
    e && e.stopPropagation();
    setShowPopOver(false);
    typeof onCancel === "function" && onCancel();
  };

  const handleOkClick = e => {
    e && e.stopPropagation();
    setShowPopOver(false);
    typeof onOk === "function" && onOk();
  };

  const IconComponent = iconComponent;
  const OkComponent = okComponent;
  const CancelComponent = cancelComponent;
  return(
    <div className={`${classes.container} ${className?className:""}`}>
      <button className={`${classes.button} ${buttonClassName?buttonClassName:""}`} onClick={handleButtonClick} title={buttonTitle} ref={buttonRef}>
        <IconComponent {...iconProps} />
      </button>
      <Overlay
        show={showPopOver}
        target={buttonRef.current}
        placement={popOverPosition}
        container={document.body}
        rootClose={true}
        onHide={handlePopOverClose.bind(this)}
      >
        <Popover id={uniqueId("popover")} className={classes.popOver}>
          <PopOverContent onSizeChange={handlePopOverPosition}>
            <div className={classes.popOverContent}>
              {children}
            </div>
            {(CancelComponent || OkComponent) && (
              <div className={classes.popOverFooterBar}>
                {CancelComponent && (
                  <Button size="sm" onClick={handleCancelClick}><CancelComponent {...cancelProps} /></Button>
                )}
                {OkComponent && (
                  <Button variant="primary" size="sm" onClick={handleOkClick}><OkComponent {...okProps}  /></Button>
                )}
              </div>
            )}
            <button className={classes.popOverCloseButton} onClick={handlePopOverClose} title="close"><FontAwesomeIcon icon="times"></FontAwesomeIcon></button>
          </PopOverContent>
        </Popover>
      </Overlay>
    </div>
  );
});

export default PopOverButton;