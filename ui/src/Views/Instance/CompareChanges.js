import React from "react";
import injectStyles from "react-jss";
import { observer } from "mobx-react";
import { toJS } from "mobx";
import { FormStore } from "hbp-quickfire";
import CompareFieldChanges from "./CompareFieldChanges";
import instanceStore from "../../Stores/InstanceStore";

const styles = {
  container: {
    padding: "12px 15px"
  }
};

@injectStyles(styles)
@observer
class CompareChanges extends React.Component{
  render(){
    const { classes } = this.props;
    const instance = instanceStore.instances.get(this.props.instanceId);
    if (!instance) {
      return null;
    }

    const formStoreBefore = new FormStore(toJS(instance.form.structure));
    formStoreBefore.injectValues(instance.initialValues);
    formStoreBefore.toggleReadMode(true);
    const formStoreAfter = new FormStore(toJS(instance.form.structure));
    formStoreAfter.toggleReadMode(true);

    const beforeValues = formStoreBefore.getValues();
    const afterValues = formStoreAfter.getValues();

    return(
      <div className={classes.container}>
        {instance.promotedFields.map(key => (
          <CompareFieldChanges key={key} field={instance.form.structure.fields[key]} beforeValue={beforeValues[key]} afterValue={afterValues[key]} />
        ))}
        {instance.nonPromotedFields.map(key => (
          <CompareFieldChanges key={key} field={instance.form.structure.fields[key]} beforeValue={beforeValues[key]} afterValue={afterValues[key]} />
        ))}
      </div>
    );
  }
}

export default CompareChanges;