import React from "react";
import injectStyles from "react-jss";
import Pane from "./Pane";
import InstanceForm from "./InstanceForm";

import { observer, inject } from "mobx-react";
import { Panel } from "react-bootstrap";

const styles = {
  readMode:{
    background:"#ccc"
  },
  panelBody:{
    position: "relative"
  }
};

@injectStyles(styles)
@inject("instanceStore")
@observer
class Links extends React.Component{
  render(){
    const {classes} = this.props;
    let linkKeys = [];
    const instance = this.props.instanceStore.getInstance(this.props.id);
    if(instance.isFetched){
      linkKeys = Object.keys(instance.data.fields).filter(fieldKey => {
        return instance.form.getField(fieldKey).isLink;
      });
    }
    return(
      <React.Fragment>
        {linkKeys.length > 0?
          <Pane>
            {linkKeys.map(fieldKey => {
              let fieldObj = instance.form.getField(fieldKey);
              if(fieldObj.isLink && fieldObj.value.length > 0){
                return (
                  <div key={fieldObj.label}>
                    <h4>{fieldObj.label}</h4>
                    {fieldObj.value.map(value => {
                      let readModeClass = this.props.instanceStore.currentInstanceId !== value[fieldObj.mappingValue]? classes.readMode: undefined;
                      return (
                        <Panel className={readModeClass} key={value[fieldObj.mappingValue]}>
                          <Panel.Body className={classes.panelBody}>
                            <InstanceForm level={this.props.level} id={value[fieldObj.mappingValue]}/>
                          </Panel.Body>
                        </Panel>
                      );
                    })}
                  </div>
                );
              }
            })}
          </Pane>
          :
          null
        }
        {this.props.instanceStore.currentInstancePath.length-1 >= this.props.level &&
          <DecoratedLinks
            level={this.props.level+1}
            id={this.props.instanceStore.currentInstancePath[this.props.level]}/>
        }
      </React.Fragment>
    );
  }
}

const DecoratedLinks = Links;
export default DecoratedLinks;