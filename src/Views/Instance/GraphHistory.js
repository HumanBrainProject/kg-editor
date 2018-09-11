import React from "react";
import {observer, inject} from "mobx-react";
import injectStyles from "react-jss";
import Color from "color";
import { Glyphicon } from "react-bootstrap";
import { isString } from "lodash";

const styles = {
  container:{

  },
  entry:{
    position:"relative",
    minHeight:"45px",
    padding:"0 10px 0 35px",
    "&:nth-child(odd)":{
      background:"#fafafa"
    },
    cursor:"pointer"
  },
  entryLabel:{
    padding:"12px 0 12px 20px",
  },
  entryLegend:{
    position:"absolute",
    width:"20px",
    height:"20px",
    left:30,
    top:13,
    borderRadius:"50%",
    background:"white",
    border:"2px solid gray",
    zIndex:2
  },

  currentMarker:{
    color:"#bdc3c7",
    position:"absolute",
    top:16,
    left:6
  }
};

@injectStyles(styles)
@inject("graphStore")
@observer
export default class GraphHistory extends React.Component{
  handleEntryClick(level){
    this.props.graphStore.historyBack(level);
  }

  render(){
    const {classes, graphStore} = this.props;
    if(graphStore.typeStates === null){
      return null;
    }
    let currentNode = graphStore.getCurrentNode();
    return (
      <div className={classes.container}>
        {currentNode &&
          <div className={`${classes.entry}`}>
            <Glyphicon glyph={"arrow-right"} className={classes.currentMarker}/>
            <div className={classes.entryLegend} style={{borderRadius: "50%", background:graphStore.colorScheme[currentNode.dataType], borderColor:new Color(graphStore.colorScheme[currentNode.dataType]).darken(0.25).hex()}}/>
            <div className={classes.entryLabel}>
              <small><strong>({currentNode.dataType})</strong></small>&nbsp;{isString(currentNode.title)?currentNode.title:currentNode.id}
            </div>
          </div>
        }

        {graphStore.nodeHistory.concat().reverse().map((node, index) => {
          if(!node){
            return null;
          }
          return(
            <div className={`${classes.entry}`} key={node.id+"_"+index} onClick={this.handleEntryClick.bind(this, index)}>
              <div className={classes.entryLegend} style={{borderRadius: "50%", background:graphStore.colorScheme[node.dataType], borderColor:new Color(graphStore.colorScheme[node.dataType]).darken(0.25).hex()}}/>
              <div className={classes.entryLabel}>
                <small><strong>({node.dataType})</strong></small>&nbsp;{isString(node.title)?node.title:node.id}
              </div>
            </div>
          );
        })}
      </div>
    );
  }
}