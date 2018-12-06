import React from "react";
import injectStyles from "react-jss";
import { observer } from "mobx-react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import historyStore from "../../Stores/HistoryStore";
import appStore from "../../Stores/AppStore";
import instanceStore from "../../Stores/InstanceStore";
import routerStore from "../../Stores/RouterStore";
import InstanceRow from "../Instance/InstanceRow";
import PopOverButton from "../../Components/PopOverButton";

const nodeTypes = [
  "dataset",
  "person"
];

const styles = {
  container: {
    color:"var(--ft-color-normal)",
    "& .header": {
      display: "flex",
      margin: "25px 0 10px 0",
      "& h3": {
        flex: 1,
        margin: 0,
        "& .selector": {
          display: "inline-block",
          position: "relative",
          marginRight: "4px",
          "& select": {
            background: "transparent",
            border: 0,
            margin: "0",
            padding: "0 25px 0 0",
            "-webkit-appearance": "none",
            cursor: "pointer"
          },
          "&:before": {
            content: "\" \"",
            display: "block",
            position: "absolute",
            top: "50%",
            right: "10px",
            transform: "translateY(-3px)",
            width: 0,
            height: 0,
            borderLeft: "6px solid transparent",
            borderRight: "6px solid transparent",
            borderTop: "6px solid var(--ft-color-normal)",
            cursor: "pointer",
            pointerEvents: "none"
          }
        }
      },
      "& ul": {
        display: "inline-block",
        margin: "6px 0 0 0",
        "& li": {
          display: "inline-block",
          margin: "0 0 0 10px",
          "& input": {
            marginRight: "4px"
          }
        }
      }
    },
    "& ul": {
      listStyleType: "none",
      paddingLeft: 0,
      "& li": {
      }
    }
  },
  message: {
    position: "relative",
    width: "100%",
    padding: "15px",
    border: "1px solid var(--border-color-ui-contrast1)",
    background: "var(--bg-color-ui-contrast2)",
    color: "var(--ft-color-normal)"
  },
  noHistory: {
    extend: "message"
  },
  fetching: {
    extend: "message",
    "& span": {
      paddingLeft: "10px"
    }
  },
  fetchError: {
    extend: "message",
    "& span": {
      paddingLeft: "10px"
    }
  },
  textError: {
    margin: 0,
    wordBreak: "keep-all"
  }
};

@injectStyles(styles)
@observer
export default class InstancesHistory extends React.Component{
  constructor(props){
    super(props);
    this.fetchInstances();
  }

  fetchInstances = () => {
    const eventTypes = Object.entries(appStore.historySettings.eventTypes).reduce((result, [eventType, eventValue]) => {
      if (eventValue) {
        result.push(eventType);
      }
      return result;
    }, []);
    const history = historyStore.getFileredInstancesHistory(appStore.historySettings.nodeType, eventTypes, appStore.historySettings.size);
    historyStore.fetchInstances(history);
  }

  handleHistorySizeChange = event => {
    appStore.setSizeHistorySetting(event.target.value);
    this.fetchInstances();
  }

  handleHistoryNodeTypeChange = event => {
    appStore.setNodeTypeHistorySetting(event.target.value);
    this.fetchInstances();
  }

  handleHistoryViewedFlagChange = event => {
    appStore.toggleViewedFlagHistorySetting(event.target.checked);
    this.fetchInstances();
  }

  handleHistoryEditedFlagChange = event => {
    appStore.toggleEditedFlagHistorySetting(event.target.checked);
    this.fetchInstances();
  }

  handleHistoryBookmarkedFlagChange = event => {
    appStore.toggleBookmarkedFlagHistorySetting(event.target.checked);
    this.fetchInstances();
  }

  handleHistoryReleasedFlagChange = event => {
    appStore.toggleReleasedFlagHistorySetting(event.target.checked);
    this.fetchInstances();
  }

  handleInstanceClick(instance){
    if (instance && instance.id) {
      routerStore.history.push(`/instance/view/${instance.id}`);
    }
  }

  handleInstanceCtrlClick(instance){
    if (instance && instance.id) {
      instanceStore.openInstance(instance.id);
    }
  }

  handleInstanceActionClick(instance, mode){
    if (instance && instance.id) {
      routerStore.history.push(`/instance/${mode}/${instance.id}`);
    }
  }

  render(){
    const { classes } = this.props;
    return(
      <div className={classes.container}>
        <div className="header">
          <h3>
            <span>Your last </span>
            <div className="selector">
              <select value={appStore.historySettings.size} onChange={this.handleHistorySizeChange} >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
            </div>
            <div className="selector">
              <select value={appStore.historySettings.nodeType?appStore.historySettings.nodeType:""} onChange={this.handleHistoryNodeTypeChange} >
                <option value="">instances</option>
                {nodeTypes.map(nodeType => <option key={nodeType} value={nodeType}>{nodeType}s</option>)}
              </select>
            </div>
          </h3>
          <ul className="config">
            <li><input type="checkbox" checked={appStore.historySettings.eventTypes.viewed} onChange={this.handleHistoryViewedFlagChange} />Viewed</li>
            <li><input type="checkbox" checked={appStore.historySettings.eventTypes.edited} onChange={this.handleHistoryEditedFlagChange} />Edited</li>
            <li><input type="checkbox" checked={appStore.historySettings.eventTypes.bookmarked} onChange={this.handleHistoryBookmarkedFlagChange} />Bookmarked</li>
            <li><input type="checkbox" checked={appStore.historySettings.eventTypes.released} onChange={this.handleHistoryReleasedFlagChange} />Released</li>
          </ul>
        </div>
        {historyStore.isFetching?
          <div className={classes.fetching}><FontAwesomeIcon icon="circle-notch" spin/><span>Fetching history {appStore.historySettings.nodeType?appStore.historySettings.nodeType:"instance"}s...</span></div>
          :
          historyStore.fetchError?
            <div className={classes.fetchError}>
              <PopOverButton
                buttonClassName={classes.fetchErrorButton}
                buttonTitle={`fetching history ${appStore.historySettings.nodeType?appStore.historySettings.nodeType:"instance"}s failed, click for more information`}
                iconComponent={FontAwesomeIcon}
                iconProps={{icon: "exclamation-triangle"}}
                okComponent={() => (
                  <React.Fragment>
                    <FontAwesomeIcon icon="redo-alt"/>&nbsp;Retry
                  </React.Fragment>
                )}
                onOk={this.fetchInstances}
              >
                <h5 className={classes.textError}>{historyStore.fetchError}</h5>
              </PopOverButton>
              <span>fetching history {appStore.historySettings.nodeType?appStore.historySettings.nodeType:"instance"}s failed.</span>
            </div>
            :
            historyStore.instances.length?
              <ul>
                {historyStore.instances.map(instance => {
                  return (
                    <li key={instance.id}>
                      <InstanceRow instance={instance} selected={false} onClick={this.handleInstanceClick}  onCtrlClick={this.handleInstanceCtrlClick}  onActionClick={this.handleInstanceActionClick} />
                    </li>
                  );
                })}
              </ul>
              :
              <div className={classes.noHistory}>No {appStore.historySettings.nodeType?appStore.historySettings.nodeType:"instance"} matches your filters in your history.</div>
        }
      </div>
    );
  }
}