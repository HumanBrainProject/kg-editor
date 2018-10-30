import React from "react";
import { observer } from "mobx-react";
import injectStyles from "react-jss";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Button } from "react-bootstrap";

let styles = {
  container: {
    position: "relative"
  },
  button: {
    position: "relative",
    backgroundColor: "transparent",
    margin: 0,
    padding: 0,
    border: 0,
    outline: 0
  },
  popOver: {
    position: "absolute",
    marginTop: "5px",
    background: "var(--list-bg-hover)",
    border: "1px solid var(--list-border-hover)",
    //background: "linear-gradient(var(--bg-gradient-angle), var(--bg-gradient-start), var(--bg-gradient-end))",
    //backgroundSize: "200%",
    padding: "25px 20px 0px",
    borderRadius: "3px",
    zIndex: 100,
    "&.top": {
      marginTop: "-5px",
      "& $popOverArrow": {
        top: "unset",
        transform: "rotate(180deg)"
      }
    }
  },
  popOverContent: {},
  popOverCloseButton: {
    position: "absolute",
    top: 0,
    right: 0,
    backgroundColor: "transparent",
    border: "transparent"
  },
  popOverFooterBar: {
    width: "100%",
    margin: "20px 0",
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

const windowHeight = () => {
  const w = window,
    d = document,
    e = d.documentElement,
    g = d.getElementsByTagName("body")[0];
  return w.innerHeight || e.clientHeight || g.clientHeight;
  //return $(window).height();
};

@injectStyles(styles)
@observer
export default class PopOverButton extends React.Component{
  constructor(props){
    super(props);
    this.state = { showPopOver: false, popOverPosition: null, popOverStyle: null };
    this.buttonRef = React.createRef();
    this.popOverRef = React.createRef();
    this.timer = null;
    this.handleButtonClick = this.handleButtonClick.bind(this);
    this.handlePopOverClose = this.handlePopOverClose.bind(this);
    this.handlePopOverOver = this.handlePopOverOver.bind(this);
    this.handlePopOverLeave = this.handlePopOverLeave.bind(this);
    this.handleCancelClick = this.handleCancelClick.bind(this);
    this.handleOkClick = this.handleOkClick.bind(this);
  }

  componentDidUpdate() {
    if (this.state.showPopOver && !this.state.popOverPosition) {
      let position = "bottom";
      let style = {};
      if (this.popOverRef.current) {
        const buttonBottomPosition = this.buttonRef.current?this.buttonRef.current.getBoundingClientRect().bottom:0;
        const popOverHeight = this.popOverRef.current.getBoundingClientRect().height;
        if ((buttonBottomPosition + popOverHeight + 5) >= windowHeight()) {
          position = "top";
          const buttonHeight = this.buttonRef.current?this.buttonRef.current.getBoundingClientRect().height:0;
          style = {
            transform: `translateY(-100%) translateY(-${buttonHeight}px)`
          };
        }
      }
      typeof this.props.onPositionChange === "function" &&  this.props.onPositionChange(position);
      this.setState({popOverPosition: position, popOverStyle: style });
    }
  }

  handleButtonClick(event) {
    event.stopPropagation();
    this.setState(state => ({showPopOver: !state.showPopOver, popOverPosition: null }));
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
    this.setState({showPopOver: false, popOverPosition: null });
    typeof this.props.onClose === "function" && this.props.onClose();
  }

  handleCancelClick(event) {
    event && event.stopPropagation();
    this.setState({showPopOver: false, popOverPosition: null });
    typeof this.props.onCancel === "function" && this.props.onCancel();
  }

  handleOkClick(event) {
    event && event.stopPropagation();
    this.setState({showPopOver: false, popOverPosition: null });
    typeof this.props.onOk === "function" && this.props.onOk();
  }

  render(){
    const { classes, className, buttonClassName, buttonTitle, iconComponent, iconProps, popOverClassName, okComponent, okProps, cancelComponent, cancelProps, children } = this.props;
    const IconComponent = iconComponent;
    const OkComponent = okComponent;
    const CancelComponent = cancelComponent;
    return(
      <div className={`${classes.container} ${className?className:""}`} onMouseLeave={this.handlePopOverLeave} onMouseOver={this.handlePopOverOver}>
        <button className={`${classes.button} ${buttonClassName?buttonClassName:""}`} onClick={this.handleButtonClick} title={buttonTitle} ref={this.buttonRef}>
          <IconComponent {...iconProps} />
        </button>
        {this.state.showPopOver && (
          <div className={`popover-popup ${classes.popOver} ${popOverClassName?popOverClassName:""} ${this.state.popOverPosition?this.state.popOverPosition:""}`} style={this.state.popOverStyle} onMouseLeave={this.handlePopOverLeave} onMouseOver={this.handlePopOverOver} onClick={event => event.stopPropagation()} ref={this.popOverRef}>
            <div className={classes.popOverContent}>
              {children}
            </div>
            {(CancelComponent || OkComponent) && (
              <div className={classes.popOverFooterBar}>
                {CancelComponent && (
                  <Button bsSize="small" onClick={this.handleCancelClick}><CancelComponent {...cancelProps} /></Button>
                )}
                {OkComponent && (
                  <Button bsStyle="primary" bsSize="small" onClick={this.handleOkClick}><OkComponent {...okProps}  /></Button>
                )}
              </div>
            )}
            <button className={classes.popOverCloseButton} onClick={this.handlePopOverClose} title="close"><FontAwesomeIcon icon="times"></FontAwesomeIcon></button>
            <div className={classes.popOverArrow} />
          </div>
        )}
      </div>
    );
  }
}