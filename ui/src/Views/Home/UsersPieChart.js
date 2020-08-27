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
import { ResponsivePie } from "nivo";

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
class UsersPieChart extends React.Component {
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
        <h3>Top 5 active users</h3>
        {!structureStatisticsStore.fetchError?
          !structureStatisticsStore.isFetching?
            structureStatisticsStore.usersStatistics.length?
              <ResponsivePie
                data={structureStatisticsStore.usersStatistics}
                margin={{
                  "top": 30,
                  "right": 140,
                  "bottom": 70,
                  "left": 140
                }}
                innerRadius={0.5}
                padAngle={0.7}
                cornerRadius={3}
                colors="nivo"
                colorBy="id"
                borderWidth={1}
                borderColor="inherit:darker(0.2)"
                radialLabelsSkipAngle={10}
                radialLabelsTextXOffset={6}
                radialLabelsTextColor="var(--ft-color-normal)"
                radialLabelsLinkOffset={0}
                radialLabelsLinkDiagonalLength={16}
                radialLabelsLinkHorizontalLength={24}
                radialLabelsLinkStrokeWidth={1}
                radialLabelsLinkColor="inherit"
                slicesLabelsSkipAngle={10}
                slicesLabelsTextColor="#333333"
                animate={true}
                motionStiffness={90}
                motionDamping={15}
                theme={{
                  tooltip: {
                    container: {
                      background: "var(--bg-color-ui-contrast1)",
                    }
                  }
                }}
                legends={[
                  {
                    "anchor": "bottom",
                    "direction": "row",
                    "translateY": 56,
                    "itemWidth": 100,
                    "itemHeight": 18,
                    "itemTextColor": "#999",
                    "symbolSize": 18,
                    "symbolShape": "circle",
                    "effects": [
                      {
                        "on": "hover",
                        "style": {
                          "itemTextColor": "#000"
                        }
                      }
                    ]
                  }
                ]}
              />
              :
              <div className={classes.noStatisticsPanel}>
                <div>No users statistics available.</div>
              </div>
            :
            <FetchingLoader>
              Fetching users statistics
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

export default UsersPieChart;