import React from "react";
import injectStyles from "react-jss";
import { observer } from "mobx-react";

import Instance from "./Instance";

const styles = {
  container: {
    color:"var(--ft-color-normal)",
    "& h3": {
      margin: "25px 0 10px 0"
    },
    "& ul": {
      listStyleType: "none",
      paddingLeft: 0,
      "& li": {
      }
    }
  }
};

@injectStyles(styles)
@observer
export default class Instances extends React.Component{

  render(){
    const {classes, title, list} = this.props;
    return(
      <div className={classes.container}>
        <h3>{title}</h3>
        <ul>
          {list.map(instanceId => {
            return (
              <li key={instanceId}>
                <Instance instanceId={instanceId} />
              </li>
            );
          })}
        </ul>
      </div>
    );
  }
}