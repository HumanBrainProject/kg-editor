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
        <h1>Browse the Knowledge Graph</h1>
        <p>One of the key features of the KG Editor is to allow its users to find any instance they need.</p>
        <h2>Access the feature</h2>
        <p>To access the <code>Browse</code> feature, you can use either the always present tab at the top of the window, or the quick access button on the dashboard.</p>
        <p>
          <img src={`${window.rootPath}/assets/help/browse/access.png`}/>
        </p>
      </div>
    );
  }
}