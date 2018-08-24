import React from "react";
import injectStyles from "react-jss";
import { Row, Col } from "react-bootstrap";
import ToggleButton from "./ToggleButton";
import ReleaseStatus from "../ReleaseStatus";

const styles = {
  panel: {
    "& h6": {
      margin: "0 !important",
      color: "gray",
      fontWeight: "bold"
    }
  },
  activePanel: {
    "& h6": {
      color: "#333"
    }
  },
  status:{
    display:"inline-block",
    verticalAlign:"middle",
    transform:"scale(0.66)",
    marginRight:"6px"
  }
};

@injectStyles(styles)
export default class HeaderPanel extends React.Component{
  render(){
    const { classes, className,  title, onEdit, onReadMode, showButtons, isReadMode, instanceStatus, childrenStatus } = this.props;
    const handleEdit = (e) => {
      e.stopPropagation();
      onEdit(e);
    };
    const handleReadMode = (e) => {
      e.stopPropagation();
      onReadMode(e);
    };
    return(
      <div className={`${classes.panel} ${showButtons?classes.activePanel:""} ${className}`}>
        <Row>
          <Col xs={10}>
            <h6>
              <div className={classes.status}>
                <ReleaseStatus instanceStatus={instanceStatus} childrenStatus={childrenStatus}/>
              </div>
              <span>{title}</span>
            </h6>
          </Col>
          <Col xs={2} >
            <span className="pull-right">
              {showButtons &&
              <ToggleButton isOn={!isReadMode} onToggle={handleEdit} offToggle={handleReadMode} onGlyph="pencil" offGlyph="eye-open" onTitle="edit" offTitle="cancel edition" />
              }
            </span>
          </Col>
        </Row>
      </div>
    );
  }
}