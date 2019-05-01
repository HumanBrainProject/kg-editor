import React from "react";
import injectStyles from "react-jss";
import { observer } from "mobx-react";
import Pane from "./Pane";
import InstanceForm from "./InstanceForm";
import instanceStore from "../../Stores/InstanceStore";

const styles = {
  pane: {
    position: "relative"
  }
};

@injectStyles(styles)
@observer
class Links extends React.Component{
  render(){
    const {classes, mainInstanceId } = this.props;
    let linkKeys = [];
    const instance = instanceStore.getInstance(this.props.id);
    const mainInstance = instanceStore.openedInstances.get(mainInstanceId);
    const currentInstancePath = mainInstance.currentInstancePath;
    if(instance.isFetched){
      linkKeys = Object.keys(instance.data.fields).filter(fieldKey => {
        return instance.form.getField(fieldKey).isLink && instance.form.getField(fieldKey).getValue().length > 0;
      });
    }
    return(
      <React.Fragment>
        {linkKeys.length > 0?
          <Pane paneId={"ChildrenOf"+this.props.id} key={"ChildrenOf"+this.props.id} className={classes.pane}>
            {linkKeys.map(fieldKey => {
              let fieldObj = instance.form.getField(fieldKey);
              if(fieldObj.isLink && fieldObj.value.length > 0){
                return (
                  <div key={fieldObj.label} data-provenence={fieldObj.label}>
                    <h4>{fieldObj.label}</h4>
                    {fieldObj.value.map(value => {
                      const id = value[fieldObj.mappingValue];
                      return (
                        <InstanceForm level={this.props.level} id={id} key={id} provenence={fieldObj.label} mainInstanceId={mainInstanceId} />
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
        {currentInstancePath.length-1 >= this.props.level &&
          <DecoratedLinks
            level={this.props.level+1}
            id={currentInstancePath[this.props.level]}
            mainInstanceId={mainInstanceId} />
        }
      </React.Fragment>
    );
  }
}

const DecoratedLinks = Links;
export default DecoratedLinks;