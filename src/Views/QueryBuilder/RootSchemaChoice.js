import React from "react";
import queryBuilderStore from "../../Stores/QueryBuilderStore";
import { observer } from "mobx-react";
import injectStyles from "react-jss";

let style = {
  container:{
    color:"var(--ft-color-loud)"
  },
  schemaSelectGroup:{
    fontSize:"1.25em",
    fontWeight:"bold",
    marginBottom:"10px"
  },
  schemaSelectSchema:{
    fontSize:"0.8em",
    fontWeight:"normal",
    paddingLeft:"10px"
  },
};

@observer
@injectStyles(style)
export default class RootSchemaChoice extends React.Component{
  handleSelectRootSchema = (schema) => {
    queryBuilderStore.selectRootSchema(schema);
  }

  render(){
    const {classes} = this.props;
    return(
      <div className={classes.container}>
        {queryBuilderStore.getSortedSchemaGroups().map(group => {
          return(
            <div className={classes.schemaSelectGroup} key={group}>
              {group}
              <div>
                {queryBuilderStore.getSortedSchemasByGroup(group).map(schema => {
                  if(!schema.properties || !schema.properties.length){
                    return null;
                  }
                  return(
                    <div className={classes.schemaSelectSchema} key={schema.id} onClick={this.handleSelectRootSchema.bind(this, schema)}>
                      {schema.label}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    );
  }
}