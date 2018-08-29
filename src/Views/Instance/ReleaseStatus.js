import React from "react";
import injectStyles from "react-jss";
import {Glyphicon} from "react-bootstrap";

const styles = {
  status:{
    borderRadius:"4px",
    width:"24px",
    height:"34px",
    background:"currentColor",
    display:"inline-block",
    overflow:"hidden",
    lineHeight:"17px",
    textAlign:"center",
    fontSize:"0.7em",
    color:"#337ab7",
    opacity:0.7,
    "&.has-changed":{
      color:"#f39c12",
      opacity:1
    },
    "&.not-released":{
      color:"#e74c3c",
      opacity:1
    }
  },

  instanceStatus:{
    height:"15px",
    color:"white",
    "&:only-child":{
      height:"34px",
      lineHeight:"34px"
    }
  },
  childrenStatus:{
    borderRadius:"2px",
    background:"white",
    height:"15px",
    margin:"2px",
  },
};

@injectStyles(styles)
export default class ReleaseStatus extends React.Component{
  render(){
    const {classes, instanceStatus, childrenStatus} = this.props;

    const globalStatusClass = (instanceStatus === "NOT_RELEASED" || childrenStatus === "NOT_RELEASED")? "not-released"
      :(instanceStatus === "HAS_CHANGED" || childrenStatus === "HAS_CHANGED")? "has-changed"
        :"released";

    const instanceStatusClass = (instanceStatus === "NOT_RELEASED")? "not-released"
      :(instanceStatus === "HAS_CHANGED")? "has-changed"
        :"released";

    const childrenStatusClass = (childrenStatus === "NOT_RELEASED")? "not-released"
      :(childrenStatus === "HAS_CHANGED")? "has-changed"
        :"released";

    return(
      <div className={`${classes.status} ${globalStatusClass}`}>
        <div className={`${classes.instanceStatus} ${instanceStatusClass}`}>
          {instanceStatus === "NOT_RELEASED"?
            <Glyphicon glyph="ban-circle"/>
            :instanceStatus === "HAS_CHANGED"?
              <Glyphicon glyph="retweet"/>
              :instanceStatus === "RELEASED"?
                <Glyphicon glyph="ok"/>
                :
                <strong>?</strong>
          }
        </div>
        {childrenStatus !== null &&
          <div className={`${classes.childrenStatus} ${childrenStatusClass}`}>
            {childrenStatus === "NOT_RELEASED"?
              <Glyphicon glyph="ban-circle"/>
              :childrenStatus === "HAS_CHANGED"?
                <Glyphicon glyph="retweet"/>
                :childrenStatus === "RELEASED"?
                  <Glyphicon glyph="ok"/>
                  :
                  <strong>?</strong>
            }
          </div>
        }
      </div>
    );
  }
}