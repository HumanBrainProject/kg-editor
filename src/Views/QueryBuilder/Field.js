import React from "react";
import injectStyles from "react-jss";
import {observer} from "mobx-react";
import {Button} from "react-bootstrap";

import Fields from "./Fields";
import queryBuilderStore from "../../Stores/QueryBuilderStore";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

let styles = {
  container:{
    position:"relative",
    "&::before":{
      display:"block",
      content:"''",
      position:"absolute",
      left:"10px",
      width:"0",
      height:"calc(100% - 17px)",
      borderLeft:"1px dashed #ccc"
    },
    "&::after":{
      display:"block",
      content:"''",
      position:"absolute",
      left:"-9px",
      top:"20px",
      width:"10px",
      height:"0",
      borderTop:"1px dashed #ccc"
    }
  },
  label:{
    padding:"10px",
    margin:"2px",
    backgroundColor:"var(--bg-color-ui-contrast3)",
    position:"relative",
    zIndex:2
  },
  subFields:{
    paddingLeft:"20px"
  },
  addButton:{
    marginLeft:"20px",
    position:"relative",
    "&::after":{
      display:"block",
      content:"''",
      position:"absolute",
      left:"-9px",
      top:"17px",
      width:"10px",
      height:"0",
      borderTop:"1px dashed #ccc"
    }
  }
};

@injectStyles(styles)
@observer
export default class Field extends React.Component{
  handleAddField = () => {
    queryBuilderStore.toggleShowModalFieldChoice(this.props.field);
  }

  render(){
    const {classes, field} = this.props;
    return(

      <div className={classes.container}>
        <div className={classes.label}>
          {field.schema.label}&nbsp;
          {field.schema.canBe && field.schema.canBe.length &&
          <span className={classes.canBe}>
            ( {field.schema.canBe.map(schemaId => queryBuilderStore.findSchemaById(schemaId).label+" ")} )
          </span>}
        </div>
        <div className={classes.subFields}>
          <Fields field={field}/>
        </div>
        {field.schema.canBe && field.schema.canBe.length &&
          <div className={classes.addButton}>
            <Button className={"btn btn-link"} onClick={this.handleAddField}>
              <FontAwesomeIcon icon={"plus-square"}/>
            </Button>
          </div>}
      </div>
    );
  }
}