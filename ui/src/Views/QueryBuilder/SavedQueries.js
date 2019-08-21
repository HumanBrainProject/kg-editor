import React from "react";
import injectStyles from "react-jss";
import {observer} from "mobx-react";
import { Scrollbars } from "react-custom-scrollbars";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import SavedQuery from "./SavedQuery";

let styles = {
  container:{
    display:"grid",
    gridTemplateRows:"auto 1fr",
    height: "100%",
    border: "1px solid var(--border-color-ui-contrast5)",
    borderRadius: "10px 10px 0 0",
    padding: "10px",
    background: "var(--bg-color-ui-contrast3)",
    color: "var(--ft-color-loud)",
    transition: "border-radius 0.3s ease",
    "& > div > div:first-child": {
      overflowX: "hidden !important"
    },
    "& > div > div:nth-child(2)": {
      display: "none !important"
    },
    "&.collapsed": {
      borderRadius: 0,
      "& $title": {
        marginBottom: 0,
        paddingBottom: 0,
        borderBottom: 0
      },
      "& $toggleButton": {
        transform: "rotateX(180deg)"
      }
    }
  },
  title: {
    display: "flex",
    marginBottom: "10px",
    paddingBottom: "10px",
    borderBottom: "1px solid var(--border-color-ui-contrast5)",
    "& button": {
      display: "inline-block",
      margin: 0,
      padding: 0,
      border: 0,
      background: "transparent",
      outline: 0,
      "&:hover": {
        outline: 0
      }
    },
    "& h4": {
      flex: 1,
      display: "inline-block",
      margin: 0,
      padding: 0,
      "& small":{
        color:"var(--ft-color-quiet)",
        fontStyle:"italic"
      }
    },
    "& button.refresh-btn": {
      color: "var(--ft-color-normal)"
    }
  },
  toggleButton: {
    "& svg": {
      transition: "transform 0.3s ease"
    },
    "& + h4": {
      margin: "0 0 0 6px",
      cursor: "pointer"
    }
  }
};

@injectStyles(styles)
@observer
export default class SavedQueries extends React.Component{
  render(){
    const {classes, title, subTitle, list, expanded, onExpandToggle, onRefresh, showUser, enableDelete } = this.props;

    return (
      <div className={`${classes.container} ${expanded !== false?"":"collapsed"}`}>
        {title && (
          <div className={classes.title}>
            {typeof onExpandToggle === "function" && (
              <button className={`toggle-btn ${classes.toggleButton}`} onClick={onExpandToggle}><FontAwesomeIcon icon="angle-down"/></button>
            )}
            <h4 onClick={onExpandToggle}>{title}<small>{subTitle?(" - " + subTitle):""}</small></h4>
            {typeof onRefresh === "function" && (
              <button className="refresh-btn" onClick={onRefresh} title="Refresh"><FontAwesomeIcon icon="redo-alt"/></button>
            )}
          </div>
        )}
        {expanded !== false || !title?
          !list || !list.length?
            <div>no saved queries yet.</div>
            :
            <Scrollbars autoHide>
              {list.map(query => (
                <SavedQuery key={query.id} query={query} showUser={showUser} enableDelete={enableDelete} />
              ))}
            </Scrollbars>
          :
          null
        }
      </div>
    );
  }
}