/*
*   Copyright (c) 2020, EPFL/Human Brain Project PCO
*
*   Licensed under the Apache License, Version 2.0 (the "License");
*   you may not use this file except in compliance with the License.
*   You may obtain a copy of the License at
*
*       http://www.apache.org/licenses/LICENSE-2.0
*
*   Unless required by applicable law or agreed to in writing, software
*   distributed under the License is distributed on an "AS IS" BASIS,
*   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
*   See the License for the specific language governing permissions and
*   limitations under the License.
*/

import React from "react";
import injectStyles from "react-jss";
import {observer} from "mobx-react";
import {uniqueId} from "lodash";
import { Button } from "react-bootstrap";
import { ResponsiveBar } from "nivo";

import structureStatisticsStore from "../../Stores/StructureStatisticsStore";
import FetchingLoader from "../../Components/FetchingLoader";

const styles = {
  container: {
    position: "relative",
    width: "100%",
    height: "400px",
    padding: "15px",
    background: "var(--bg-color-ui-contrast2)",
    border: "1px solid var(--border-color-ui-contrast1)",
    color:"var(--ft-color-normal)",
    "& h3": {
      margin: "5px 0",
      textAlign: "center"
    }
  },
  statisticsFetchErrorPanel:{
    textAlign:"center",
    fontSize:"0.9em",
    wordBreak:"break-all",
    padding:"40px 20px",
    "& .btn":{
      minWidth:"140px",
      marginTop:"20px"
    },
    color: "var(--ft-color-error)"
  },
  noStatisticsPanel:{
    extend:"statisticsFetchErrorPanel",
    color:"var(--ft-color-loud)"
  }
};

@injectStyles(styles)
@observer
export default class NodeTypesBarChart extends React.Component {
  constructor(props){
    super(props);
    this.state = {key: uniqueId("key")};
  }

  handleResize = () => {
    this.setState({key: uniqueId("key")});
  }

  componentDidMount = () => {
    window.addEventListener("resize", this.handleResize);
    if(!structureStatisticsStore.isFetched && !structureStatisticsStore.isFetching){
      structureStatisticsStore.fetchStatistics();
    }
  }

  componentWillUnmount = () => {
    window.removeEventListener("resize", this.handleResize);
  }

  handleFetchStatisticsRetry = () => {
    structureStatisticsStore.fetchStatistics();
  }

  render(){
    const { classes } = this.props;
    return (
      <div key={this.state.key} className={classes.container}>
        <h3>Top 10 unreleased instances by type</h3>
        {!structureStatisticsStore.fetchError?
          !structureStatisticsStore.isFetching?
            structureStatisticsStore.nodeTypeStatistics.length?
              <ResponsiveBar
                data={structureStatisticsStore.nodeTypeStatistics}
                keys={[
                  "released",
                  "unreleased"
                ]}
                indexBy="nodeType"
                margin={{
                  "top": 0,
                  "right": 10,
                  "bottom": 40,
                  "left": 180
                }}
                padding={0.3}
                layout="horizontal"
                colors="nivo"
                colorBy="id"
                enableGridY={false}
                axisLeft={{
                  "tickSize": 0
                }}
                axisBottom={null}
                labelSkipWidth={12}
                labelSkipHeight={12}
                labelTextColor="inherit:darker(1.6)"
                animate={true}
                motionStiffness={90}
                motionDamping={15}
                theme={{
                  axis: {
                    textColor: "var(--ft-color-normal)",
                    fontSize: "14px"
                  },
                  tooltip: {
                    container: {
                      background: "var(--bg-color-ui-contrast1)",
                    }
                  }
                }}
                legends={[
                  {
                    "dataFrom": "keys",
                    "anchor": "bottom-right",
                    "direction": "column",
                    "justify": false,
                    "translateX": 120,
                    "translateY": 0,
                    "itemsSpacing": 2,
                    "itemWidth": 100,
                    "itemHeight": 20,
                    "itemDirection": "left-to-right",
                    "itemOpacity": 0.85,
                    "symbolSize": 20,
                    "effects": [
                      {
                        "on": "hover",
                        "style": {
                          "itemOpacity": 1,
                          "itemTextColor": "#000"
                        }
                      }
                    ]
                  }
                ]}
              />
              :
              <div className={classes.noStatisticsPanel}>
                <div>No instances statistics available.</div>
              </div>
            :
            <FetchingLoader>
              Fetching instances statistics
            </FetchingLoader>
          :
          <div className={classes.statisticsFetchErrorPanel}>
            <div>{structureStatisticsStore.fetchError}</div>
            <Button bsStyle="primary" onClick={this.handleFetchStatisticsRetry}>Retry</Button>
          </div>
        }
      </div>
    );
  }
}