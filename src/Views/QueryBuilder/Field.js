import React from "react";
import injectStyles from "react-jss";
import {observer} from "mobx-react";

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
    margin:"1px",
    backgroundColor:"var(--bg-color-ui-contrast1)",
    position:"relative",
    zIndex:2,
    cursor:"pointer",
    "&:hover":{
      backgroundColor:"var(--bg-color-ui-contrast4)"
    },
    "&.selected":{
      backgroundColor:"var(--bg-color-ui-contrast4)"
    }
  },
  rename:{
    color:"var(--ft-color-louder)",
    fontWeight:"bold"
  },
  subFields:{
    paddingLeft:"20px"
  },
  optionsButton:{
    position:"absolute",
    right:"10px",
    top:"9px"
  }
};

@injectStyles(styles)
@observer
export default class Field extends React.Component{
  handleSelectField = () => {
    queryBuilderStore.selectField(this.props.field);
  }

  render(){
    const {classes, field} = this.props;
    return(
      <div className={classes.container}>
        <div className={`${classes.label} ${field === queryBuilderStore.currentField?"selected":""}`} onClick={this.handleSelectField}>
          {field.schema.label}&nbsp;
          {field.schema.canBe && field.schema.canBe.length &&
          <span className={classes.canBe}>
            ( {field.schema.canBe.map(schemaId => queryBuilderStore.findSchemaById(schemaId).label+" ")} )
          </span>}
          {field.getOption("alias")?
            <span className={classes.rename}>
              &nbsp;&nbsp;<FontAwesomeIcon icon="long-arrow-alt-right"/>&nbsp;&nbsp;
              {field.getOption("alias")}
            </span>
            :null}
        </div>
        <div className={classes.subFields}>
          <Fields field={field}/>
        </div>
      </div>
    );
  }
}