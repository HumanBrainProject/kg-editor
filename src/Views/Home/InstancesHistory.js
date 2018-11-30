import React from "react";
import injectStyles from "react-jss";
import { observer } from "mobx-react";

import historyStore from "../../Stores/HistoryStore";
import appStore from "../../Stores/AppStore";
import Instance from "./Instance";

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
  noHistory: {
    position: "relative",
    width: "100%",
    padding: "15px",
    border: "1px solid var(--border-color-ui-contrast1)",
    background: "var(--bg-color-ui-contrast2)",
    color: "var(--ft-color-normal)"
  }
};

@injectStyles(styles)
@observer
export default class InstancesHistory extends React.Component{

  handleHistorySizeChange = event => {
    appStore.setSizeHistorySetting(event.target.value);
  }

  handleHistoryNodeTypeChange = event => {
    appStore.setNodeTypeHistorySetting(event.target.value);
  }

  handleHistoryViewedFlagChange = event => {
    appStore.toggleViewedFlagHistorySetting(event.target.checked);
  }

  handleHistoryEditedFlagChange = event => {
    appStore.toggleEditedFlagHistorySetting(event.target.checked);
  }

  handleHistoryBookmarkedFlagChange = event => {
    appStore.toggleBookmarkedFlagHistorySetting(event.target.checked);
  }

  handleHistoryReleasedFlagChange = event => {
    appStore.toggleReleasedFlagHistorySetting(event.target.checked);
  }

  render(){
    const { classes } = this.props;
    const eventTypes = Object.entries(appStore.historySettings.eventTypes).reduce((result, [eventType, eventValue]) => {
      if (eventValue) {
        result.push(eventType);
      }
      return result;
    }, []);
    const history = historyStore.getFileredInstancesHistory(appStore.historySettings.nodeType, eventTypes, appStore.historySettings.size);
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
        {history.length?
          <ul>
            {history.map(instanceId => {
              return (
                <li key={instanceId}>
                  <Instance instanceId={instanceId} />
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