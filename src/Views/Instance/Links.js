import React from "react";
import injectStyles from "react-jss";
import { observer, inject } from "mobx-react";
import Pane from "./Pane";
import InstanceForm from "./InstanceForm";

const styles = {
  pane: {
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
          <Pane className={classes.pane}>
            {linkKeys.map(fieldKey => {
              let fieldObj = instance.form.getField(fieldKey);
              if(fieldObj.isLink && fieldObj.value.length > 0){
                return (
                  <div key={fieldObj.label}>
                    <h4>{fieldObj.label}</h4>
                    {fieldObj.value.map(value => {
                      const id = value[fieldObj.mappingValue];
                      return (
                        <InstanceForm level={this.props.level} id={id} key={id} />
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