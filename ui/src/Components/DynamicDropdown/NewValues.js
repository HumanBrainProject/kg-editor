import React from "react";
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

class  NewValue extends React.Component {
  componentDidMount() {
    this.setFocus();
  }

  componentDidUpdate() {
    this.setFocus();
  }

    setFocus = () => {
      const { hasFocus } = this.props;
      if (hasFocus) {
        this.ref.focus();
      }
    }

    handleOnSelect = () => {
      const {onSelect, type} = this.props;
      onSelect(type.name);
    }

    handleKeyDown = e => {
      const {onSelectNext, onSelectPrevious, onSelect, onCancel, type} = this.props;
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
    }

    render() {
      const classes = useStyles();
      const  {type, value} = this.props;
      return(
        <MenuItem className={`quickfire-dropdown-item ${classes.container}`} key={type.name} onSelect={this.handleOnSelect}>
          <div tabIndex={-1} className="option" onKeyDown={this.handleKeyDown} ref={ref => this.ref = ref}>
            <em>Add a new <span style={type.color ? { color: type.color } : {}}>
              <FontAwesomeIcon fixedWidth icon="circle" />
            </span>
            {type.label} </em> : <strong>{value}</strong>
          </div>
        </MenuItem>
      );

    }

}

export default NewValues;