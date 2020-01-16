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

  getLinkedFields = (fields, values) => {
    const linkedFields = [];
    Object.entries(fields).forEach(([id, fieldObj]) => {
      const vals = values.filter(v => v[id]).flatMap(v => v[id]);
      if (fieldObj.type === "Nested") {
        linkedFields.push(...this.getLinkedFields(fieldObj.fields, vals));
      } else if(fieldObj.isLink) {
        if (vals.length > 0) {
          linkedFields.push([fieldObj, vals]);
        }
      }
    });
    return linkedFields;
  }

  render(){
    const {classes, mainInstanceId } = this.props;

    const instance = instanceStore.instances.get(this.props.id);
    if (!instance) {
      return null;
    }
    const mainInstance = instanceTabStore.instanceTabs.get(mainInstanceId);
    const currentInstancePath = mainInstance.currentInstancePath;
    let linkFields = [];
    if(instance.isFetched){
      linkFields = Object.keys(instance.fields).reduce((acc, fieldKey) => {
        const fieldObj = instance.form.getField(fieldKey);
        const values = fieldObj.getValue();
        if(fieldObj.type === "Nested") {
          acc.push(...this.getLinkedFields(fieldObj.fields, values));
        } else if(fieldObj.isLink && values.length > 0) {
          acc.push([fieldObj, values]);
        }
        return acc;
      }, []);
    }

    return(
      <React.Fragment>
        {linkFields.length > 0?
          <Pane paneId={"ChildrenOf"+this.props.id} key={"ChildrenOf"+this.props.id} className={classes.pane}>
            {linkFields.map(([fieldObj, values]) => (
              <div key={fieldObj.label} data-provenence={fieldObj.label}>
                <h4>{fieldObj.label}{fieldObj.type === "KgTable"?
                  <em style={{fontWeight:"lighter"}}>
                        (showing {fieldObj.visibleInstancesCount} out of {fieldObj.instances.length})</em>:null}
                </h4>
                {values.map((value, index) => {
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
            ))}
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