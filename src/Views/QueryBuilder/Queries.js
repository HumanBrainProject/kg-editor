import React from "react";
import injectStyles from "react-jss";
import {observer} from "mobx-react";
import { Scrollbars } from "react-custom-scrollbars";

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
  },
  query:{
    position:"relative",
    cursor:"pointer",
    margin:"1px",
    padding:"10px",
    background:"var(--bg-color-ui-contrast1)",
    color:"var(--ft-color-normal)",
    "&:hover":{
      background:"var(--bg-color-ui-contrast4)"
    }
  },
  name: {
    display: "inline",
    color:"var(--ft-color-louder)",
    textTransform: "capitalize",
    "& small":{
      color:"var(--ft-color-quiet)",
      fontStyle:"italic",
      textTransform: "none"
    }
  },
  description: {
    overflow:"hidden",
    marginTop:"5px",
    whiteSpace:"nowrap",
    textOverflow:"ellipsis",
    fontSize:"0.9em",
  }
};

@injectStyles(styles)
@observer
export default class Queries extends React.Component{
  handleSelect(query){
    const { onSelect} = this.props;
    typeof onSelect === "function" && onSelect(query);
  }

  handleDelete(query){
    const { onDelete} = this.props;
    typeof onDelete === "function" && onDelete(query);
  }

  UNSAFE_componentWillUpdate(){
    if(this.scrolledPanel){
      this.scrolledPanel.scrollToTop();
    }
  }

  render(){
    const {classes, title, list} = this.props;

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
              <div className={classes.query} key={query.id} onClick={this.handleSelect.bind(this, query)}>
                <div className={classes.name}>{query.label} - <small title="queryId">{query.id}</small></div>
                {query.description && (
                  <div className={classes.description} title={query.description}>{query.description}</div>
                )}
              </div>
            ))}
          </Scrollbars>
        }
      </div>
    );
  }
}