import React from "react";
import injectStyles from "react-jss";
import {observer} from "mobx-react";
import { Scrollbars } from "react-custom-scrollbars";

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
    "& h3": {
      marginTop: 0,
      borderBottom: "1px solid var(--border-color-ui-contrast2)",
      paddingBottom: "10px"
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
    const {classes, title, list, onSelect, onDelete, onCancelDelete} = this.props;

    return (
      <div className={classes.container}>
        {title && (
          <h3>{title}</h3>
        )}
        {!list || !list.length?
          <div>no saved queries yet.</div>
          :
          <Scrollbars autoHide ref={ref => this.scrolledPanel = ref}>
            {list.map(query => (
              <SavedQuery key={query.id} query={query} onSelect={onSelect} onDelete={onDelete} onCancelDelete={onCancelDelete} />
            ))}
          </Scrollbars>
        }
      </div>
    );
  }
}