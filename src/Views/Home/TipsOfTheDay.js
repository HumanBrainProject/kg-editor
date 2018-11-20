import React from "react";
import injectStyles from "react-jss";
import {observer} from "mobx-react";
import { Button } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import tipsOfTheDayStore from "../../Stores/TipsOfTheDayStore";
import FetchingLoader from "../../Components/FetchingLoader";

const styles = {
  container: {
    padding: "15px",
    "& h3": {
      marginTop: "0"
    }
  },
  tip: {
    display: "flex",
    "& > div": {
      flex: "1"
    },
    "& > button": {
      height: "100%",
      padding: "0 0 0 10px",
      textAlign: "right",
      background: "none",
      border: "0",
      cursor: "pointer",
      outline: "0",
      "&:hover": {
        color: "var(--ft-color-loud)"
      }
    }
  },
  tipsOfTheDayFetchErrorPanel:{
    textAlign:"center",
    fontSize:"0.9em",
    wordBreak:"break-all",
    padding:"40px 20px",
    "& .btn":{
      minWidth:"140px",
      marginTop:"20px"
    },
    color:"#e74c3c"
  },
  noTipsOfTheDayPanel:{
    extend:"tipsOfTheDayFetchErrorPanel",
    color:"var(--ft-color-loud)"
  }
};

@injectStyles(styles)
@observer
export default class TipsOfTheDay extends React.Component {
  constructor(props){
    super(props);
    this.state = { currentIndex: 0 };
    if(!tipsOfTheDayStore.isFetched && !tipsOfTheDayStore.isFetching){
      tipsOfTheDayStore.fetchTipsOfTheDay();
    }
  }

  handleFetchTipOfTheDayRetry = () => {
    tipsOfTheDayStore.fetchFeatures();
  }

  handleShowNextTip = () => {
    this.setState(state => ({currentIndex: (state.currentIndex + 1 === tipsOfTheDayStore.tips.length)?0:state.currentIndex + 1}));
  }

  render(){
    const { classes } = this.props;
    return (
      <div className={`${classes.container} widget`}>
        <h3>Tips of the day</h3>
        {!tipsOfTheDayStore.fetchError?
          !tipsOfTheDayStore.isFetching?
            tipsOfTheDayStore.tips.length?
              <div className={classes.tip}>
                <div>{tipsOfTheDayStore.tips[this.state.currentIndex]}</div>
                <button onClick={this.handleShowNextTip} title="show next tip"><FontAwesomeIcon icon="angle-right" /></button>
              </div>
              :
              <div className={classes.noTipsOfTheDayPanel}>
                <div>No tips of the day available.</div>
              </div>
            :
            <FetchingLoader>
              Fetching tips of the day
            </FetchingLoader>
          :
          <div className={classes.TipsOfTheDayFetchErrorPanel}>
            <div>{tipsOfTheDayStore.fetchError}</div>
            <Button bsStyle="primary" onClick={this.handleFetchTipOfTheDayRetry}>Retry</Button>
          </div>
        }
      </div>
    );
  }
}