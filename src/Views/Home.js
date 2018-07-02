import React from "react";
import injectStyles from "react-jss";
import { observer, inject } from "mobx-react";
import { Link } from "react-router-dom";

const styles = {
  container: {
    position: "absolute",
    top: "80px",
    width: "100%",
    height: "calc(100% - 80px)",
    "@media screen and (min-width:992px)": {
      width: "auto",
      height: "auto",
      margin: "0",
      top: "40%",
      left: "50%",
      transform: "translate(-50%, -50%)"
    },
    "& h1": {
      margin: "20px 0 10px 0",
      color: "white",
      textAlign: "center",
      "@media screen and (min-width:992px)": {
        margin: "30px 0",
        fontSize: "60px",
      }
    },
    "& > div": {
      position: "relative",
      height: "100%"
    },
    "& ul": {
      display: "grid",
      gridTemplateRows: "repeat(3, 1fr)",
      listStyleType: "none",
      height: "calc(100% - 70px)",
      margin: "0",
      padding: "20px",
      columnGap: "10px",
      rowGap: "1em",
      overflowY: "auto",
      "@media screen and (min-width:992px)": {
        gridTemplateColumns: "repeat(3, 1fr)",
        gridTemplateRows: "unset",
      }
    },
    "& li": {
      display: "inline-block",
      borderRadius: "5px",
      backgroundColor: "white",
      color: "#444",
    },
    "& a": {
      display: "inline-block",
      width: "100%",
      height: "100%",
      textAlign: "center",
      verticalAlign: "middle",
      "@media screen and (min-width:992px)": {
        width: "300px",
        height: "300px"
      },
      "@media screen and (min-width:1200px)": {
        width: "400px",
        height: "400px"
      }
    },
    "& h2": {
      marginTop: "10px",
      wordBreak: "break-word",
      whiteSpace: "normal",
      lineHeight: "1.3em",
      "@media screen and (min-width:768px)": {
        marginTop: "30px",
      },
      "@media screen and (min-width:992px)": {
        marginTop: "30%",
        fontSize: "36px"
      }
    }
  }
};

@injectStyles(styles)
@inject("navigationStore")
@observer
export default class Home extends React.Component{
  constructor(props){
    super(props);
    this.props.navigationStore.setHomeLinkVisibility(false);
  }

  componentWillUnmount() {
    this.props.navigationStore.setHomeLinkVisibility(true);
  }

  render(){
    const {classes} =  this.props;
    return (
      <div className={classes.container}>
        <div>
          <h1>Welcome</h1>
          <ul>
            <li>
              <Link className="btn btn-default" to={"/search"}><h2>Search<br/>(review &amp; edit)<br/>an instance</h2></Link>
            </li>
            <li>
              <Link className="btn btn-default" to={"/create"}><h2>Create<br/>a new instance</h2></Link>
            </li>
            <li>
              <Link className="btn btn-default" to={"/help"}><h2>Help<br/>&<br/>Tutorials</h2></Link>
            </li>
          </ul>
        </div>
      </div>
    );
  }
}
