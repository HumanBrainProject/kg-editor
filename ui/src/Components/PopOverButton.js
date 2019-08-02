import React from "react";
import { observer } from "mobx-react";
import injectStyles from "react-jss";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Overlay, Popover, Button } from "react-bootstrap";
import {uniqueId} from "lodash";

let styles = {
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
};

const windowHeight = () => {
  const w = window,
    d = document,
    e = d.documentElement,
    g = d.getElementsByTagName("body")[0];
  return w.innerHeight || e.clientHeight || g.clientHeight;
  //return $(window).height();
};

class PopOverContent extends React.Component {
  constructor(props){
    super(props);
    this.ref = React.createRef();
  }
  componentDidMount() {
    this.handleSizeChange();
  }
  componentDidUpdate() {
    this.handleSizeChange();
  }
  handleSizeChange() {
    if (this.ref.current) {
      typeof this.props.onSizeChange === "function" && this.props.onSizeChange(this.ref.current.getBoundingClientRect());
    }
  }
  render() {
    return (
      <div ref={this.ref}>
        {this.props.children}
      </div>
    );
  }
}

@injectStyles(styles)
@observer
export default class PopOverButton extends React.Component{
  constructor(props){
    super(props);
    this.state = { showPopOver: false, popOverPosition: "bottom" };
    this.popOverId = uniqueId("popover");
    this.buttonRef = React.createRef();
  }

  handlePopOverPosition(popOverRect) {
    if (!popOverRect) { return null; }
    const buttonRect = this.buttonRef.current.getBoundingClientRect();
    const position = (buttonRect.bottom + popOverRect.height + 5) >= windowHeight()?"top":"bottom";
    if (this.state.popOverPosition !== position) {
      this.setState({popOverPosition: position});
    }
  }

  handleButtonClick(event) {
    event.stopPropagation();
    this.setState(state => ({showPopOver: !state.showPopOver }));
  }

  handlePopOverClose(event) {
    event && event.stopPropagation();
    this.setState({showPopOver: false });
    typeof this.props.onClose === "function" && this.props.onClose();
  }

  handleCancelClick(event) {
    event && event.stopPropagation();
    this.setState({showPopOver: false });
    typeof this.props.onCancel === "function" && this.props.onCancel();
  }

  handleOkClick(event) {
    event && event.stopPropagation();
    this.setState({showPopOver: false });
    typeof this.props.onOk === "function" && this.props.onOk();
  }

  componentWillUnmount() {
    if (this.state.showPopOver) {
      this.handlePopOverClose();
    }
  }

  render(){
    const { classes, className, buttonClassName, buttonTitle, iconComponent, iconProps, okComponent, okProps, cancelComponent, cancelProps, children } = this.props;
    const IconComponent = iconComponent;
    const OkComponent = okComponent;
    const CancelComponent = cancelComponent;
    return(
      <div className={`${classes.container} ${className?className:""}`}>
        <button className={`${classes.button} ${buttonClassName?buttonClassName:""}`} onClick={this.handleButtonClick.bind(this)} title={buttonTitle} ref={this.buttonRef}>
          <IconComponent {...iconProps} />
        </button>
        <Overlay
          show={this.state.showPopOver}
          target={this.buttonRef.current}
          placement={this.state.popOverPosition}
          container={document.body}
          rootClose={true}
          onHide={this.handlePopOverClose.bind(this)}
        >
          <Popover id={this.popOverId} className={classes.popOver}>
            <PopOverContent onSizeChange={this.handlePopOverPosition.bind(this)}>
              <div className={classes.popOverContent}>
                {children}
              </div>
              {(CancelComponent || OkComponent) && (
                <div className={classes.popOverFooterBar}>
                  {CancelComponent && (
                    <Button bsSize="small" onClick={this.handleCancelClick.bind(this)}><CancelComponent {...cancelProps} /></Button>
                  )}
                  {OkComponent && (
                    <Button bsStyle="primary" bsSize="small" onClick={this.handleOkClick.bind(this)}><OkComponent {...okProps}  /></Button>
                  )}
                </div>
              )}
              <button className={classes.popOverCloseButton} onClick={this.handlePopOverClose.bind(this)} title="close"><FontAwesomeIcon icon="times"></FontAwesomeIcon></button>
            </PopOverContent>
          </Popover>
        </Overlay>
      </div>
    );
  }
}