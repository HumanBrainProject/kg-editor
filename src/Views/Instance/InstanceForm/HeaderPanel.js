import React from "react";
import injectStyles from "react-jss";
import { Row, Col } from "react-bootstrap";
import ToggleButton from "./ToggleButton";

const styles = {
  panel: {
    "& h6": {
      margin: "0",
      color: "gray",
      fontWeight: "bold"
    }
  },
  activePanel: {
    "& h6": {
      margin: "10px 0",
      color: "#333"
    }
  }
};

@injectStyles(styles)
export default class HeaderPanel extends React.Component{
  render(){
    const { classes, className,  title, onEdit, onReadMode, showButtons, isReadMode } = this.props;
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
            <h6>{title}</h6>
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