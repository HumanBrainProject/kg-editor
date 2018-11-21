import React from "react";
import injectStyles from "react-jss";

const styles = {
  container:{

  }
};

@injectStyles(styles)
export default class HelpView extends React.Component{
  render(){
    const {classes} = this.props;
    return (
      <div className={classes.container}>
        <h1>Contact us</h1>
        <p>Should you encounter any problem with this application, please contact our team by email at : kg-team@humanbrainproject.eu</p>
      </div>
    );
  }
}