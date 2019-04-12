import React from "react";
import injectStyles from "react-jss";
import {observer} from "mobx-react";
import Field from "./Field";

let styles = {
  container:{

  }
};

@injectStyles(styles)
@observer
export default class Fields extends React.Component{
  render(){
    const {classes, field} = this.props;
    return(
      <div className={classes.container}>
        {field.merge && !!field.merge.length && field.merge.map(field => {
          return(
            <Field field={field} key={`merge_${field._uniqueKey}`} />
          );
        })}
        {field.fields && !!field.fields.length && field.fields.map(field => {
          return(
            <Field field={field} key={`field_${field._uniqueKey}`} />
          );
        })}
      </div>
    );
  }
}