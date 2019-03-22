import React from "react";
import injectStyles from "react-jss";
import { observer } from "mobx-react";

import queryBuilderStore from "../../Stores/QueryBuilderStore";
import Field from "./Field";

const styles = {
  container:{
    display: "grid",
    gridTemplateRows: "auto 1fr",
    gridTemplateColumns: "1fr",
    gridGap: "10px",
    height: "100%"
  },
  info: {
    display: "grid",
    gridTemplateRows: "auto auto",
    gridTemplateColumns: "1fr 2fr",
    gridRowGap: "20px",
    gridColumnGap: "30px",
    background: "var(--bg-color-ui-contrast2)",
    border: "1px solid var(--border-color-ui-contrast1)",
    color: "var(--ft-color-loud)",
    padding: "10px",
    "&:not(.available)": {
      display: "none",
      "& + $schemas": {
        gridRowStart: "span 2"
      }
    },
    "& h4": {
      marginTop: 0,
      marginBottom: "8px"
    }
  },
  description: {
    gridColumnStart: "span 2",
    "& textarea": {
      minWidth: "100%",
      maxWidth: "100%",
      minHeight: "10rem"
    }
  },
  input:{
    borderRadius: "2px",
    backgroundColor: "var(--bg-color-blend-contrast1)",
    color: "var(--ft-color-loud)",
    width:"100%",
    border:"1px solid transparent",
    "&:focus":{
      borderColor: "rgba(64, 169, 243, 0.5)"
    },
    "&.disabled,&:disabled":{
      backgroundColor: "var(--bg-color-blend-contrast1)",
    }
  },
  schemas:{
    position:"relative",
    background: "var(--bg-color-ui-contrast2)",
    border: "1px solid var(--border-color-ui-contrast1)",
    overflow:"auto",
    color:"var(--ft-color-normal)"
  },
};

@injectStyles(styles)
@observer
export default class Query extends React.Component{

  handleChange = event => {
    window.console.log(event.target.value);
  }

  render(){
    const { classes } = this.props;

    if (!queryBuilderStore.rootField) {
      return null;
    }

    return (
      <div className={classes.container}>
        <div className={`${classes.info} ${queryBuilderStore.queryId?"available":""}`}>
          <div>
            <h4>QueryId :</h4>
            <input
              className={`form-control ${classes.input}`}
              placeholder={""}
              type="text"
              value={queryBuilderStore.queryId}
              onChange={this.handleChange} />
          </div>
          <div>
            <h4>Label :</h4>
            <input
              className={`form-control ${classes.input}`}
              placeholder={""}
              type="text"
              value={queryBuilderStore.label}
              onChange={this.handleChange} />
          </div>
          <div className={classes.description}>
            <h4>Description :</h4>
            <textarea
              className={`form-control ${classes.input}`}
              placeholder={""}
              type="text"
              value={queryBuilderStore.description}
              onChange={this.handleChange} />
          </div>
        </div>
        <div className={classes.schemas}>
          <Field field={queryBuilderStore.rootField}/>
        </div>
      </div>
    );
  }
}