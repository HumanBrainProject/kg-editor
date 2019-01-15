import React from "react";
import injectStyles from "react-jss";
import {observer} from "mobx-react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Button } from "react-bootstrap";

import Fields from "./Fields";
import queryBuilderStore from "../../Stores/QueryBuilderStore";

let styles = {
  container:{
    position:"relative",
    "&::before":{
      display:"block",
      content:"''",
      position:"absolute",
      left:"10px",
      width:"0",
      height:"calc(100% - 20px)",
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
    },
    "&.flattenedParent::after":{
      borderTop:"3px solid #40a9f3"
    }
  },
  hasFlattenedParentExtraBox:{
    display:"block",
    content:"''",
    position:"absolute",
    top:"-1px",
    left:"-11px",
    width:"0",
    height:"24px",
    borderLeft:"3px solid #40a9f3"
  },
  label:{
    padding:"10px",
    margin:"1px",
    backgroundColor:"var(--bg-color-ui-contrast1)",
    position:"relative",
    zIndex:2,
    cursor:"pointer",
    "&:hover":{
      backgroundColor:"var(--bg-color-ui-contrast4)",
      "& $optionsButton":{
        opacity:1
      }
    },
    "&.selected":{
      backgroundColor:"var(--bg-color-ui-contrast4)",
      "& $optionsButton":{
        opacity:1
      }
    }
  },
  required:{
    color:"var(--ft-color-louder)"
  },
  rename:{
    color:"var(--ft-color-louder)",
    fontWeight:"bold"
  },
  defaultname:{
    color:"var(--ft-color-normal)",
    fontStyle:"italic"
  },
  subFields:{
    paddingLeft:"20px"
  },
  optionsButton:{
    position:"absolute",
    right:"10px",
    top:"9px",
    opacity:0.25
  }
};

@injectStyles(styles)
@observer
export default class Field extends React.Component{
  handleSelectField = () => {
    queryBuilderStore.selectField(this.props.field);
  }

  handleRemoveField = (e) => {
    e.stopPropagation();
    queryBuilderStore.removeField(this.props.field);
  }

  render(){
    const {classes, field} = this.props;

    const isFlattened = field.getOption("flatten");
    const hasFlattenedParent = field.parent && field.parent.getOption("flatten");
    return(
      <div className={`${classes.container}${isFlattened?" flattened":""}${hasFlattenedParent?" flattenedParent":""}`}>
        {hasFlattenedParent &&
          <div className={classes.hasFlattenedParentExtraBox}></div>
        }
        <div className={`${classes.label} ${field === queryBuilderStore.currentField?"selected":""}`} onClick={this.handleSelectField}>
          {field.getOption("flatten")?
            <span className={classes.required}>
              <FontAwesomeIcon transform="flip-h" icon="level-down-alt"/>&nbsp;&nbsp;
            </span>
            :null}
          {field.getOption("required")?
            <span className={classes.required}>
              <FontAwesomeIcon transform="shrink-8" icon="asterisk"/>&nbsp;&nbsp;
            </span>
            :null}
          {field.schema.label}&nbsp;
          {field.schema.canBe && field.schema.canBe.length &&
          <span className={classes.canBe}>
            ( {field.schema.canBe.map(schemaId => queryBuilderStore.findSchemaById(schemaId).label+" ")} )
          </span>}
          {field.parent && !field.parent.getOption("flatten")?
            field.getOption("alias")?
              <span className={classes.rename}>
                &nbsp;&nbsp;<FontAwesomeIcon icon="long-arrow-alt-right"/>&nbsp;&nbsp;
                {field.getOption("alias")}
              </span>
              :
              <span className={classes.defaultname}>
                &nbsp;&nbsp;<FontAwesomeIcon icon="long-arrow-alt-right"/>&nbsp;&nbsp;
                {field.getDefaultAlias()}
              </span>
            :null}
          <div className={classes.optionsButton}>
            <Button bsSize={"xsmall"} bsStyle={"primary"} onClick={this.handleRemoveField}>
              <FontAwesomeIcon icon="times"/>
            </Button>
          </div>
        </div>
        <div className={classes.subFields}>
          <Fields field={field}/>
        </div>
      </div>
    );
  }
}