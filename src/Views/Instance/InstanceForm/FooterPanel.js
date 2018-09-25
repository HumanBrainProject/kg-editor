import React from "react";
import injectStyles from "react-jss";
import { Row, Col } from "react-bootstrap";

const styles = {
  panel:{
    "& .btn":{
      display:"block",
      width:"100%"
    }
  },
  id:{
    paddingBottom: "10px",
    color:"grey",
    fontWeight:"300",
    fontSize:"0.7em",
    wordBreak: "break-all"
  }
};

@injectStyles(styles)
export default class FooterPanel extends React.Component{
  render(){
    const { classes, className, id } = this.props;

    return(
      <div className={`${classes.panel} ${className}`}>
        <Row>
          <Col xs={12}>
            <div className={classes.id}>Nexus ID: {id}</div>
          </Col>
        </Row>
      </div>
    );
  }
}