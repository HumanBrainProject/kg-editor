import React from "react";
import injectStyles from "react-jss";
import { Row, Col, Button } from "react-bootstrap";
import { Link } from "react-router-dom";

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
    const { classes, className, id, onSave, onCancel, onCancelBackLink, useCancelBackLink, showEditButtons, disableSaveButton } = this.props;
    const handleSave = (e) => {
      e.stopPropagation();
      onSave(e);
    };
    const handleCancel = (e) => {
      e.stopPropagation();
      onCancel(e);
    };
    return(
      <div className={`${classes.panel} ${className}`}>
        <Row>
          <Col xs={12} md={showEditButtons?8:12}>
            <div className={classes.id}>Nexus ID: {id}</div>
          </Col>
          {showEditButtons && <React.Fragment>
            <Col xs={6} md={2} className={classes.action}>
              {useCancelBackLink?
                <Link to={onCancelBackLink} className="btn btn-default">Cancel</Link>
                :
                <Button bsStyle="default" onClick={handleCancel}>Cancel</Button>
              }
            </Col>
            <Col xs={6} md={2} className={classes.action}>
              <Button disabled={disableSaveButton} bsStyle={"success"} onClick={handleSave}>Save</Button>
            </Col>
          </React.Fragment>}
        </Row>
      </div>
    );
  }
}