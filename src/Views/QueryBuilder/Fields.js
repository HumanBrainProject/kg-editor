import React from "react";
import injectStyles from "react-jss";
import {observer} from "mobx-react";
import {Button} from "react-bootstrap";

import queryBuilderStore from "../../Stores/QueryBuilderStore";

let styles = {
  container:{

  },
  childFields:{
    paddingLeft:"30px",
    marginBottom:"30px"
  }
};

@injectStyles(styles)
@observer
class Fields extends React.Component{
  handleAddField = () => {
    queryBuilderStore.toggleShowModalFieldChoice(this.props.field);
  }

  render(){
    const {classes, field} = this.props;
    return(
      <div className={classes.container}>
        {field.fields.map(field => {
          return(
            <div className={classes.childFields} key={field.id}>
              {field.schema.label}
              ( {field.schema.canBe && field.schema.canBe.length && field.schema.canBe.map(schemaId => queryBuilderStore.findSchemaById(schemaId).label+" ")} )
              <DecoratedFields field={field}/>
            </div>
          );
        })}
        {field.schema.canBe && field.schema.canBe.length && <Button onClick={this.handleAddField}>Add a field</Button>}
      </div>
    );
  }
}

const DecoratedFields = Fields;
export default Fields;