import React from "react";
import injectStyles from "react-jss";
import { Row, Col } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const styles = {
  panel: {
    position:"relative",
    "& h6": {
      margin: "0 !important",
      color: "#333",
      fontWeight: "bold"
    }
  },
  hasChanged: {
    position:"absolute",
    top:5,
    right:10,
    color:"#e67e22"
  },
  type: {
    paddingRight: "10px"
  }
};

@injectStyles(styles)
class HeaderPanel extends React.Component{
  render(){
    const { classes, className, types, hasChanged } = this.props;
    return(
      <div className={`${classes.panel} ${className ? className : ""}`}>
        <Row>
          <Col xs={12}>
            <h6>
              {types.map(({name, label, color}) => (
                <span key={name} className={classes.type} title={name}><FontAwesomeIcon icon={"circle"} color={color}/>&nbsp;&nbsp;<span>{label?label:name}</span></span>
              ))}
            </h6>
          </Col>
        </Row>
        {hasChanged &&
          <div className={classes.hasChanged}>
            <FontAwesomeIcon icon={"exclamation-triangle"}/>&nbsp;
            <FontAwesomeIcon icon={"caret-right"}/>&nbsp;
            <FontAwesomeIcon icon={"pencil-alt"}/>
          </div>
        }
      </div>
    );
  }
}

export default HeaderPanel;