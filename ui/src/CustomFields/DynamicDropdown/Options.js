import React from "react";
import {  MenuItem } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import injectStyles from "react-jss";

const styles = {
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
};


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

@injectStyles(styles)
class Option  extends React.Component {
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
      const {onSelect, value} = this.props;
      onSelect(value.id);
    }


    handleKeyDown = e => {
      const {onSelectNext, onSelectPrevious, onSelect, onCancel, value} = this.props;
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
    }

    handleOnPreview = e => {
      e && e.stopPropagation();
      this.props.onPreview(this.props.value.id, this.props.value.name);
    }

    render() {
      const {value, classes} = this.props;
      return(
        <MenuItem className={"quickfire-dropdown-item"} onSelect={this.handleOnSelect}>
          <div title={value.type.name} tabIndex={-1} className="option"  onKeyDown={this.handleKeyDown} ref={ref => this.ref = ref}>
            <span className={classes.icon} style={value.type.color ? { color: value.type.color } : {}}>
              <FontAwesomeIcon fixedWidth icon="circle" />
            </span>
            {value.name}
            <div className={classes.preview} title="preview" onClick={this.handleOnPreview}>
              <FontAwesomeIcon icon="eye" />
            </div>
          </div>
        </MenuItem>
      );
    }

}

export default Options;