import React from "react";
import ReleaseStore from "../Stores/ReleaseStore";
import { observer } from "mobx-react";
import FetchingLoader from "../Components/FetchingLoader";
import injectStyles from "react-jss";

const styles = {
  container: {
    position: "absolute",
    top: "80px",
    width: "100vw",
    height: "calc(100vh - 80px)",
    backgroundColor: "white",
    "@media screen and (min-width:576px)": {
      left: "50%",
      width: "calc(100vw - 40px)",
      height: "calc(100vh - 100px)",
      padding: "20px",
      borderRadius: "10px",
      transform: "translateX(-50%)",
    }
  }
};

@injectStyles(styles)
@observer
export default class Release extends React.Component{
  constructor(props){
    super(props);
    this.releaseStore = new ReleaseStore(props.match.params.id);
  }

  UNSAFE_componentWillReceiveProps(newProps){
    this.releaseStore = new ReleaseStore(newProps.match.id);
  }

  render(){
    const { classes } = this.props;
    return (
      <div className={classes.container}>
        {this.releaseStore?
          <FetchingLoader><span>Fetching release data...</span></FetchingLoader>
          :
          <div>Release</div>
        }
      </div>
    );
  }
}