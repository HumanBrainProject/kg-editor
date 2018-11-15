import React from "react";
import { Route, Switch, Link } from "react-router-dom";
import injectStyles from "react-jss";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Scrollbars } from "react-custom-scrollbars";

import Introduction from "./Help/Introduction";
import Browse from "./Help/Browse";

const styles = {
  container:{
    display:"grid",
    height:"100%",
    padding:"10px",
    gridTemplateColumns:"320px 1fr",
    gridTemplateRows:"1fr",
    gridGap:"10px"
  },
  navigation:{
    background:"var(--bg-color-ui-contrast2)",
    padding:"10px",
    border:"1px solid var(--border-color-ui-contrast1)",
    "& ul":{
      listStyle:"none",
      padding:0,
      "& li":{
        margin:"10px 0 10px 20px",
        "& a":{
          fontSize:"1.2em",
          color:"var(--ft-color-loud)",
          "& .svg-inline--fa":{
            marginRight:"10px"
          }
        }
      }
    }
  },
  content:{
    background:"var(--bg-color-ui-contrast2)",
    border:"1px solid var(--border-color-ui-contrast1)",
    color:"var(--ft-color-loud)",
    fontSize:"1.05em",
  },
  contentInner:{
    padding:"10px 20px",
    "& img":{
      border:"5px solid #ccc",
      display:"block",
      borderRadius:"4px",
      margin:"20px auto"
    },
    "& p":{
      margin:"10px 0"
    }
  }
};

@injectStyles(styles)
export default class Instances extends React.Component{
  render(){
    const {classes, match} = this.props;
    const {path} = match;
    return (
      <div className={classes.container}>
        <div className={classes.navigation}>
          <ul>
            <li><Link to={`${path}/introduction`}><FontAwesomeIcon fixedWidth icon="question-circle"/>Introduction</Link></li>
            <li>
              <Link to={`${path}/browse`}><FontAwesomeIcon fixedWidth icon="search"/>Browse the Knowledge Graph</Link>
              <ul>
                <li><Link to={`${path}/browse/nodetypes`}><FontAwesomeIcon fixedWidth icon="code-branch" transform={"flip-h rotate--90"}/>Nodetypes</Link></li>
                <li><Link to={`${path}/browse/bookmarks`}><FontAwesomeIcon fixedWidth icon="star"/>Bookmarks</Link></li>
              </ul>
            </li>
            <li>
              <Link to={`${path}/instance`}><FontAwesomeIcon fixedWidth icon="circle"/>Open an instance</Link>
              <ul>
                <li><Link to={`${path}/instance/view`}><FontAwesomeIcon fixedWidth icon="eye"/>View</Link></li>
                <li><Link to={`${path}/instance/edit`}><FontAwesomeIcon fixedWidth icon="pencil-alt"/>Edit</Link></li>
                <li><Link to={`${path}/instance/save`}><FontAwesomeIcon fixedWidth icon="save"/>Save</Link></li>
                <li><Link to={`${path}/instance/graph`}><FontAwesomeIcon fixedWidth icon="project-diagram"/>Explore</Link></li>
                <li><Link to={`${path}/instance/release`}><FontAwesomeIcon fixedWidth icon="cloud-upload-alt"/>Release</Link></li>
              </ul>
            </li>
            <li><Link to={`${path}/statistics`}><FontAwesomeIcon fixedWidth icon="chart-bar"/>Statistics</Link></li>
            <li><Link to={`${path}/settings`}><FontAwesomeIcon fixedWidth icon="cog"/>Settings</Link></li>
            <li><Link to={`${path}/faq`}><FontAwesomeIcon fixedWidth icon="question-circle"/>F.A.Q</Link></li>
            <li><Link to={`${path}/contact`}><FontAwesomeIcon fixedWidth icon="envelope"/>Contact the support</Link></li>
          </ul>
        </div>
        <div className={classes.content}>
          <Scrollbars autoHide>
            <div className={classes.contentInner}>
              <Switch>
                <Route path={`${path}/introduction`} component={Introduction}/>
                <Route path={`${path}/browse`} component={Browse}/>
              </Switch>
            </div>
          </Scrollbars>
        </div>
      </div>
    );
  }
}