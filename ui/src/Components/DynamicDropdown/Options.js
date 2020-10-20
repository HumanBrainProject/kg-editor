import React, { useEffect } from "react";
import {  MenuItem } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { createUseStyles } from "react-jss";

const useStyles = createUseStyles({
  container: {
    "& .option": {
      position: "relative"
    },
    "& :hover $preview": {
      display: "block"
    }
  },
  preview: {
    display: "none",
    position: "absolute",
    top: "50%",
    right: "-10px",
    borderRadius: "2px",
    background: "var(--bg-color-ui-contrast2)",
    color: "var(--ft-color-louder)",
    padding: "3px 6px",
    cursor: "pointer",
    transform: "translateY(-50%)"
  },
  icon: {
    paddingRight: "8px"
  }
});

const Options = ({values, current, onSelectNext, onSelectPrevious, onSelect, onCancel, onPreview}) => (
  <React.Fragment>
    {values.map(value =>
      <Option value={value}
        key={value.id}
        onSelectNext={onSelectNext}
        onSelectPrevious={onSelectPrevious}
        onSelect={onSelect}
        onCancel={onCancel}
        onPreview={onPreview}
        hasFocus={current === value.id}/>
    )}
  </React.Fragment>
);

const Option = ({ value, hasFocus, onSelectNext, onSelectPrevious, onSelect, onCancel, onPreview }) => {

  const classes = useStyles();

  useEffect(() => {
    if (hasFocus) {
      this.ref.focus();
    }
  });

  const handleOnSelect = () => {
    onSelect(value.id);
  };

  const handleKeyDown = e => {
    if(e) {
      switch(e.keyCode) {
      case 38: {
        e.preventDefault();
        onSelectPrevious(value.id);
        break;
      }
      case 40: {
        e.preventDefault();
        onSelectNext(value.id);
        break;
      }
      case 13: {
        e.preventDefault();
        onSelect(value.id);
        break;
      }
      case 27: {
        e.preventDefault();
        onCancel();
        break;
      }
      }
    }
  };

  const handleOnPreview = e => {
    e && e.stopPropagation();
    onPreview(value.id, value.name);
  };

  const style = value.type.color ? { color: value.type.color } : {};

  return (
    <MenuItem className={`quickfire-dropdown-item ${classes.container}`} onSelect={handleOnSelect}>
      <div title={value.type.name} tabIndex={-1} className="option" onKeyDown={handleKeyDown} ref={ref => this.ref = ref}>
        <span className={classes.icon} style={style}>
          <FontAwesomeIcon fixedWidth icon="circle" />
        </span>
        {value.name}
        <div className={classes.preview} title="preview" onClick={handleOnPreview}>
          <FontAwesomeIcon icon="eye" />
        </div>
      </div>
    </MenuItem>
  );
};

export default Options;