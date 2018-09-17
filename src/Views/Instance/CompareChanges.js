import React from "react";
import { inject, observer } from "mobx-react";
import injectStyles from "react-jss";
import { toJS } from "mobx";
import { isEqual } from "lodash";
import Color from "color";

import { Form, FormStore, Field } from "hbp-quickfire";

let styles = {
  container:{
    display:"grid",
    gridTemplateColumns:"1fr 1fr",
    fontFamily:"'Lato', sans-serif",
    gridGap:"20px"
  },
  field:{
    padding:10,
    margin:"0 0 10px 0"
  },
  beforeDiff:{
    background:new Color("#e74c3c").lighten(0.6).hex()
  },
  afterDiff:{
    background:new Color("#2ecc71").lighten(0.6).hex()
  }
};

@injectStyles(styles)
@observer
@inject("instanceStore")
export default class CompareChanges extends React.Component{
  render(){
    const {classes, instanceStore} = this.props;
    const instance = instanceStore.getInstance(this.props.instanceId);

    const formStoreBefore = new FormStore(toJS(instance.form.structure));
    formStoreBefore.injectValues(instance.initialValues);
    formStoreBefore.toggleReadMode(true);
    const formStoreAfter = new FormStore(toJS(instance.form.structure));
    formStoreAfter.toggleReadMode(true);

    const beforeValues = formStoreBefore.getValues();
    const afterValues = formStoreAfter.getValues();

    const valueDiff = {};

    Object.keys(afterValues).forEach(key => {
      valueDiff[key] = !isEqual(beforeValues[key], afterValues[key]);
    });

    return(
      <div className={classes.container}>
        <div className={classes.before}>
          <Form store={formStoreBefore}>
            {Object.keys(formStoreBefore.structure.fields).map(key => {
              return (<div className={`${classes.field} ${valueDiff[key]?classes.beforeDiff:""}`} key={key}>
                <Field name={key}/>
              </div>);
            })}
          </Form>
        </div>
        <div className={classes.before}>
          <Form store={formStoreAfter}>
            {Object.keys(formStoreAfter.structure.fields).map(key => {
              return (<div className={`${classes.field} ${valueDiff[key]?classes.afterDiff:""}`} key={key}>
                <Field name={key}/>
              </div>);
            })}
          </Form>
        </div>
      </div>
    );
  }
}