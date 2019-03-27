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
    border: "1px solid var(--border-color-ui-contrast2)",
    padding: "10px",
    background: "var(--bg-color-ui-contrast2)",
    color: "var(--ft-color-loud)",
    "& > div > div:first-child": {
      overflowX: "hidden !important"
    }
  },
  title: {
    "&.withContent": {
      marginBottom: "10px",
      paddingBottom: "10px",
      borderBottom: "1px solid var(--border-color-ui-contrast2)"
    },
    "& button": {
      display: "inline-block",
      margin: 0,
      padding: 0,
      border: 0,
      background: "transparent",
      outline: 0,
      "&:hover": {
        outline: 0
      },
      "&.collapse svg": {
        transform: "rotateX(180deg)",
        transition: "transform 0.3s ease"
      }
    },
    "& h4": {
      display: "inline-block",
      margin: 0,
      padding: 0,
      "& small":{
        color:"var(--ft-color-quiet)",
        fontStyle:"italic"
      }
    },
    "& button + h4": {
      margin: "0 0 0 6px"
    }
  }
};

@injectStyles(styles)
@observer
export default class SavedQueries extends React.Component{

  UNSAFE_componentWillUpdate(){
    if(this.scrolledPanel){
      this.scrolledPanel.scrollToTop();
    }
  }

  render(){
    const {classes, title, subTitle, list, expanded, onExpandToggle, enableDelete } = this.props;

    return (
      <div className={classes.container}>
        {title && (
          <div className={`${classes.title} ${expanded !== false?"withContent":""}`}>
            {typeof onExpandToggle === "function" && (
              <button className={`${expanded !== false?"":"collapse"}`} onClick={onExpandToggle}><FontAwesomeIcon icon="angle-down"/></button>
            )}
            <h4>{title}<small>{subTitle?(" - " + subTitle):""}</small></h4>
          </div>
        )}
        {expanded !== false || !title?
          !list || !list.length?
            <div>no saved queries yet.</div>
            :
            <Scrollbars autoHide ref={ref => this.scrolledPanel = ref}>
              {list.map(query => (
                <SavedQuery key={query.id} query={query} enableDelete={enableDelete} />
              ))}
            </Scrollbars>
          :
          null
        }
      </div>
    );
  }
}