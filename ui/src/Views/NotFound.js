import React from "react";
import injectStyles from "react-jss";
import { Link } from "react-router-dom";

const styles = {
  container: {
    width: "80%",
    margin: "20% 10% 80% 10%",
    padding: "20px",
    borderRadius: "5px",
    backgroundColor: "white",
    color: "#444",
    textAlign: "center",
    "@media screen and (min-width:992px)": {
      width: "auto",
      margin: "0",
      position: "absolute",
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)"
    },
    "& h3": {
      marginTop: "0",
      fontSize: "18px",
      "@media screen and (min-width:992px)": {
        fontSize: "24px"
      }
    },
    "& p": {
      margin: "20px 0"
    }
  }
};

@injectStyles(styles)
class NotFound extends React.Component{
  render(){
    const {classes} =  this.props;
    return (
      <div className={classes.container}>
        <h3>Page not found</h3>
        <div>
          <Link className="btn btn-default" to={"/"}>Go back to the dashboard</Link>
        </div>
      </div>
    );
  }
}

export default NotFound;
