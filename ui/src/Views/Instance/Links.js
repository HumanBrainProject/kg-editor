import React from "react";
import injectStyles from "react-jss";
import { observer } from "mobx-react";
import Pane from "./Pane";
import InstanceForm from "./InstanceForm";
import instanceStore from "../../Stores/InstanceStore";
import instanceTabStore from "../../Stores/InstanceTabStore";

const styles = {
  pane: {
    position: "relative"
  }
};

@injectStyles(styles)
@observer
class Links extends React.Component{
  componentDidMount() {
    if (this.props.id) {
      this.fetchInstance();
    }
  }

  componentDidUpdate(prevProps) {
    if(this.props.id && prevProps.id !== this.props.id) {
      this.fetchInstance();
    }
  }

  fetchInstance = (forceFetch = false) => {
    const instance = instanceStore.createInstanceOrGet(this.props.id);
    instance.fetch(forceFetch);
  }

  render(){
    const {classes, mainInstanceId } = this.props;

    const instance = instanceStore.instances.get(this.props.id);
    if (!instance) {
      return null;
    }
    const mainInstance = instanceTabStore.instancesTabs.get(mainInstanceId);
    const currentInstancePath = mainInstance.currentInstancePath;
    let linkKeys = [];
    if(instance.isFetched){
      linkKeys = Object.keys(instance.fields).filter(fieldKey => {
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
                    <h4>{fieldObj.label}{fieldObj.type === "KgTable"?
                      <em style={{fontWeight:"lighter"}}>
                        (showing {fieldObj.visibleInstancesCount} out of {fieldObj.instances.length})</em>:null}
                    </h4>
                    {fieldObj.value.map((value, index) => {
                      const id = value[fieldObj.mappingValue];
                      if(fieldObj.type === "KgTable") {
                        if(index < fieldObj.defaultVisibleInstances || fieldObj.instancesMap.get(id).show){
                          return (
                            <InstanceForm level={this.props.level} id={id} key={id} provenence={fieldObj.label} mainInstanceId={mainInstanceId} />
                          );
                        }
                      } else {
                        return (
                          <InstanceForm level={this.props.level} id={id} key={id} provenence={fieldObj.label} mainInstanceId={mainInstanceId} />
                        );
                      }
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