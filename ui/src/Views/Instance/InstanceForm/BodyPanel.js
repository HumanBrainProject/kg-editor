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
class BodyPanel extends React.Component{
  render(){
    const { classes, className,  show, level, id, instance, fields, mainInstanceId, disableLinks } = this.props;
    return(
      <Panel className={`${classes.panel} ${className}`} expanded={show} onToggle={() => {}}>
        <Panel.Collapse>
          <Panel.Body>
            {fields.map(name => <InstanceField key={id+name} name={name} level={level} id={id} instance={instance} mainInstanceId={mainInstanceId} disableLinks={disableLinks} />)}
          </Panel.Body>
        </Panel.Collapse>
      </Panel>
    );
  }
}

export default BodyPanel;