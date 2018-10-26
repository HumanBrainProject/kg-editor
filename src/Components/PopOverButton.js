import React from "react";
import { observer } from "mobx-react";
import injectStyles from "react-jss";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Button } from "react-bootstrap";

let styles = {
  container: {
    position: "relative"
  },
  Button: {
    backgroundColor: "transparent",
    border: "transparent",
    outline: 0
  },
  popOver: {
    position: "absolute",
    marginTop: "5px",
    background: "var(--list-bg-hover)",
    border: "1px solid var(--list-border-hover)",
    //background: "linear-gradient(var(--bg-gradient-angle), var(--bg-gradient-start), var(--bg-gradient-end))",
    //backgroundSize: "200%",
    padding: "15px 15px 0 15px",
    borderRadius: "3px",
    zIndex: 100
  },
  text: {
    margin: "15px 0",
    wordBreak: "keep-all"
  },
  popOverCloseButton: {
    position: "absolute",
    top: "5px",
    right: "5px",
    backgroundColor: "transparent",
    border: "transparent"
  },
  popOverFooterBar: {
    width: "100%",
    margin: "10px 0 15px 0",
    textAlign: "center",
    "& button + button": {
      marginLeft: "20px"
    }
  },
  popOverArrow: {
    position: "absolute",
    top: "-7px",
    left: "1px",
    width: 0,
    height: 0,
    border: "0 solid transparent",
    borderRightWidth: "6px",
    borderLeftWidth: "6px",
    borderBottom: "6px solid var(--list-border-hover)" //--bg-color-ui-contrast1
  }
};

@injectStyles(styles)
@observer
export default class PopOverButton extends React.Component{
  constructor(props){
    super(props);
    this.state = { showPopOver: false };
    this.timer = null;
    this.handleButtonClick = this.handleButtonClick.bind(this);
    this.handlePopOverClose = this.handlePopOverClose.bind(this);
    this.handlePopOverOver = this.handlePopOverOver.bind(this);
    this.handlePopOverLeave = this.handlePopOverLeave.bind(this);
    this.handleCancelClick = this.handleCancelClick.bind(this);
    this.handleOkClick = this.handleOkClick.bind(this);
  }

  handleButtonClick(event) {
    event.stopPropagation();
    this.setState(state => ({showPopOver: !state.showPopOver }));
  }

  handlePopOverOver() {
    if (this.state.showPopOver) {
      clearTimeout(this.fetchtimer);
    }
  }

  handlePopOverLeave() {
    if (this.state.showPopOver) {
      clearTimeout(this.fetchtimer);
      this.fetchtimer = setTimeout(() => this.handlePopOverClose(), 500);
    }
  }

  handlePopOverClose(event) {
    event && event.stopPropagation();
    this.setState({showPopOver: false});
    typeof this.props.onCancelClick === "function" && this.props.onCloseClick();
  }

  handleCancelClick(event) {
    event && event.stopPropagation();
    this.setState({showPopOver: false});
    typeof this.props.onCancelClick === "function" && this.props.onCancelClick();
  }

  handleOkClick(event) {
    event && event.stopPropagation();
    this.setState({showPopOver: false});
    typeof this.props.onOkClick === "function" && this.props.onOkClick();
  }

  render(){
    const { classes, className, buttonClassName, buttonTitle, iconComponent, iconProps, popOverClassName, text, textClassName, okComponent, okProps, cancelComponent, cancelProps } = this.props;
    const IconComponent = iconComponent;
    const OkComponent = okComponent;
    const CancelComponent = cancelComponent;
    return(
      <div className={`${classes.container} ${className?className:""}`} onMouseLeave={this.handlePopOverLeave} onMouseOver={this.handlePopOverOver}>
        <button className={`${classes.Button} ${buttonClassName?buttonClassName:""}`} onClick={this.handleButtonClick} title={buttonTitle}>
          <IconComponent {...iconProps} />
        </button>
        {this.state.showPopOver && (
          <div className={`${classes.popOver} ${popOverClassName?popOverClassName:""}`} onMouseLeave={this.handlePopOverLeave} onMouseOver={this.handlePopOverOver} onClick={event => event.stopPropagation()}>
            <h5 className={`${classes.text} ${textClassName?textClassName:""}`}>{text}</h5>
            <div className={classes.popOverFooterBar}>
              {CancelComponent && (
                <Button bsSize="small" onClick={this.handleCancelClick}><CancelComponent {...cancelProps} /></Button>
              )}
              {OkComponent && (
                <Button bsStyle="primary" bsSize="small" onClick={this.handleOkClick}><OkComponent {...okProps}  /></Button>
              )}
            </div>
            <button className={classes.popOverCloseButton} onClick={this.handlePopOverClose}><FontAwesomeIcon icon="times"></FontAwesomeIcon></button>
            <div className={classes.popOverArrow} />
          </div>
        )}
      </div>
    );
  }
}