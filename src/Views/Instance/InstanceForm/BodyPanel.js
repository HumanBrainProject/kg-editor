import React from "react";
import injectStyles from "react-jss";
import { Panel } from "react-bootstrap";
import InstanceField from "./InstanceField";

const styles = {
  panel: {
    border: "0",
    borderRadius: "0",
    boxShadow: "none",
    backgroundColor: "transparent",
    margin: "0",
    padding: "0",
    "& .panel-body": {
      padding: "0"
    }
  }
};

@injectStyles(styles)
export default class BodyPanel extends React.Component{
  render(){
    const { classes, className,  show, level, id, instance, fields } = this.props;
    return(
      <Panel className={`${classes.panel} ${className}`} expanded={show} onToggle={() => {}}>
        <Panel.Collapse>
          <Panel.Body>
            {fields.map(name => <InstanceField key={name} name={name} level={level} id={id} instance={instance} />)}
          </Panel.Body>
        </Panel.Collapse>
      </Panel>
    );
  }
}