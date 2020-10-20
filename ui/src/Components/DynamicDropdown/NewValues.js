import React, { useEffect } from "react";
import {  MenuItem } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { createUseStyles } from "react-jss";

const useStyles = createUseStyles({
  container: {
    "& .option": {
      position: "relative"
    }
  }
});


const NewValues = ({types, currentType, value, onSelectNext, onSelectPrevious, onSelect, onCancel}) => (
  <React.Fragment>
    {types.map(type => <NewValue type={type} key={type.name} value={value} onSelectNext={onSelectNext} onSelectPrevious={onSelectPrevious} onSelect={onSelect} onCancel={onCancel} hasFocus={currentType === type.name} />)}
  </React.Fragment>
);

const NewValue = ({ type, value, hasFocus, onSelectNext, onSelectPrevious, onSelect, onCancel }) => {

  const classes = useStyles();

  useEffect(() => {
    if (hasFocus) {
      this.ref.focus();
    }
  });

  const handleOnSelect = () => {
    onSelect(type.name);
  };

  const handleKeyDown = e => {
    if(e) {
      switch(e.keyCode) {
      case 38: {
        e.preventDefault();
        onSelectPrevious(type.name);
        break;
      }
      case 40: {
        e.preventDefault();
        onSelectNext(type.name);
        break;
      }
      case 13: {
        e.preventDefault();
        onSelect(type.name);
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

  const style = type.color ? { color: type.color } : {};

  return (
    <MenuItem className={`quickfire-dropdown-item ${classes.container}`} key={type.name} onSelect={handleOnSelect}>
      <div tabIndex={-1} className="option" onKeyDown={handleKeyDown} ref={ref => this.ref = ref}>
        <em>Add a new <span style={style}>
          <FontAwesomeIcon fixedWidth icon="circle" />
        </span>
        {type.label} </em> : <strong>{value}</strong>
      </div>
    </MenuItem>
  );
};

export default NewValues;