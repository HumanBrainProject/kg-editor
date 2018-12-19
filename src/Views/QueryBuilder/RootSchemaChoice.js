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
    marginBottom:"10px",
    "& h3":{
      paddingLeft:"10px"
    }
  },
  schemaSelectSchema:{
    fontSize:"0.8em",
    fontWeight:"normal",
    cursor: "pointer",
    padding: "10px",
    margin:"1px",
    background:"var(--bg-color-ui-contrast1)",
    "& small":{
      color:"var(--ft-color-quiet)",
      fontStyle:"italic"
    },
    "&:hover":{
      background:"var(--bg-color-ui-contrast4)",
    }
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
              <h3>{group}</h3>
              <div>
                {queryBuilderStore.getSortedSchemasByGroup(group).map(schema => {
                  return(
                    <div className={classes.schemaSelectSchema} key={schema.id} onClick={this.handleSelectRootSchema.bind(this, schema)}>
                      {schema.label} - <small>{schema.id}</small>
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