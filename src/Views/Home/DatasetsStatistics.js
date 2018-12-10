import React from "react";
import injectStyles from "react-jss";
import {observer} from "mobx-react";
import {uniqueId} from "lodash";
import { Button } from "react-bootstrap";
import { ResponsiveBar } from "nivo";

import statisticsStore from "../../Stores/StatisticsStore";
import FetchingLoader from "../../Components/FetchingLoader";

// from https://github.com/plouc/nivo/blob/master/packages/core/src/lib/colors/index.js
const palette = ["#e8c1a0", "#f47560", "#f1e15b", "#e8a838", "#61cdbb", "#97e3d5"];

const styles = {
  container: {
    position: "relative",
    width: "100%",
    minHeight:"383px",
    padding: "15px",
    background: "var(--bg-color-ui-contrast2)",
    border: "1px solid var(--border-color-ui-contrast1)",
    color:"var(--ft-color-normal)",
    "& h3": {
      margin: "5px 0 20px 0",
      textAlign: "center"
    }
  },
  panel: {
    "@media screen and (min-width:1200px)": {
      display: "flex"
    }
  },
  chart: {
    flex: 1,
    position: "relative",
    height: "300px",
    marginRight: "15px",
    "&.frame": {
      border: "1px solid var(--ft-color-normal)"
    }
  },
  noChartData: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)"
  },
  tables: {
    display: "flex",
    "& table.legend": {
      marginTop: "15px",
      marginLeft: "5px",
      borderCollapse: "separate",
      borderSpacing: "10px 0",
      "& td:first-child": {
        "& div": {
          height: "1em",
          width: "1.5em",
          border: "1px solid var(--ft-color-normal)"
        }
      },
      "& td:last-child": {
        width: "100%",
        textAlign: "left",
        whiteSpace: "nowrap"
      }
    },
    "& .spacer": {
      flex: 1
    },
    "& table.stats": {
      marginTop: "15px",
      borderCollapse: "separate",
      borderSpacing: "10px 0",
      "& td:first-child": {
        textAlign: "right"
      },
      "& td:last-child": {
        fontSize: "1.4em",
        textAlign: "right"
      }
    },
    "@media screen and (min-width:1200px)": {
      flexDirection: "column",
      "& table.legend": {
        marginTop: 0,
        marginLeft: 0
      },
      "& table.stats": {
        marginTop: 0
      }
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
    color:"#e74c3c"
  },
  noStatisticsPanel:{
    extend:"statisticsFetchErrorPanel",
    color:"var(--ft-color-loud)"
  },
  warning: {
    position: "absolute",
    top: "50%",
    left: "50%",
    width: "90%",
    transform: "translate(-50%, -50%)",
    wordBreak: "keep-all",
    fontSize: "3em",
    fontWeight: "bold",
    textAlign: "center",
    textTransform: "uppercase"
  }
};

@injectStyles(styles)
@observer
export default class DatasetsStatistics extends React.Component {
  constructor(props){
    super(props);
    this.state = {key: uniqueId("key")};
    if(!statisticsStore.isFetched && !statisticsStore.isFetching){
      statisticsStore.fetchStatistics();
    }
  }

  handleResize = () => {
    this.setState({key: uniqueId("key")});
  }

  componentDidMount = () => {
    window.addEventListener("resize", this.handleResize);
  }

  componentWillUnmount = () => {
    window.removeEventListener("resize", this.handleResize);
  }

  handleFetchStatisticsRetry = () => {
    statisticsStore.fetchStatistics();
  }

  getNumberOfDays = value => {
    let number = Number(value);
    if (isNaN(number)) {
      return "-";
    }
    number = Math.ceil(number);
    if (number <= 1) {
      return "1 day";
    }
    return number + " days";
  }

  getColorForNumberOfDays = value => {
    const min = 20;
    const max = 60;

    const getCalc = (start, end, frac) => {
      return start<end?(start + Math.floor((end-start) * frac)):(start - Math.floor((start-end) * frac));
    };

    let number = Number(value);
    if (isNaN(number)) {
      number = 0;
    } else if (number > max) {
      number = max;
    }
    const start = {h: 91, s: 92, l: 59};
    const end = {h: 7, s: 88, l: 52};
    const frac = number<=min?0:number/max;
    return `hsl(${getCalc(start.h, end.h, frac)}, ${getCalc(start.s, end.s, frac)}%, ${getCalc(start.l, end.l, frac)}%)`;
  }

  getChartData = series => {
    if (!series.length) {
      return [];
    }
    return series.map(serie => {
      return {
        "period": serie.period,
        "newly created datasets": serie.numberOfNewlyCreatedDatasets,
        "newly released datasets": serie.numberOfNewlyReleasedDatasets
      };
    });
  }

  render(){
    const { classes } = this.props;
    return (
      <div key={this.state.key} className={classes.container}>
        <h3>Datasets Statistics</h3>
        {!statisticsStore.fetchError?
          !statisticsStore.isFetching?
            statisticsStore.statistics?
              <div className={classes.panel}>
                <div className={`${classes.chart} ${statisticsStore.statistics.PerWeekStatistics && statisticsStore.statistics.PerWeekStatistics.length > 0?"":"frame"}`}>
                  {statisticsStore.statistics.PerWeekStatistics && statisticsStore.statistics.PerWeekStatistics.length > 0?
                    <ResponsiveBar
                      data={this.getChartData(statisticsStore.statistics.PerWeekStatistics)}
                      keys={[
                        "newly created datasets",
                        "newly released datasets"
                      ]}
                      indexBy="period"
                      margin={{
                        "top": 0,
                        "right": 0,
                        "bottom": 32,
                        "left": 60
                      }}
                      padding={0.3}
                      groupMode="grouped"
                      colors={palette}
                      borderColor="inherit:darker(1.6)"
                      axisTop={null}
                      axisRight={null}
                      axisBottom={{
                        "tickSize": 5,
                        "tickPadding": 5,
                        "tickRotation": 0
                      }}
                      axisLeft={{
                        "tickSize": 5,
                        "tickPadding": 5,
                        "tickRotation": 0,
                        "legend": "number of datasets",
                        "legendPosition": "center",
                        "legendOffset": -40
                      }}
                      labelSkipWidth={12}
                      labelSkipHeight={12}
                      labelTextColor="inherit:darker(1.6)"
                      animate={true}
                      motionStiffness={90}
                      motionDamping={15}
                      theme={{
                        tick: {
                          textColor: "var(--ft-color-normal)",
                        },
                        axis: {
                          textColor: "var(--ft-color-normal)",
                          fontSize: "14px",
                          tickColor: "var(--ft-color-normal)",
                          legendColor: "var(--ft-color-normal)"
                        },
                        tooltip: {
                          container: {
                            background: "var(--bg-color-ui-contrast1)"
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
                          "itemTextColor": "var(--ft-color-normal)",
                          "symbolSize": 20,
                          "effects": [
                            {
                              "on": "hover",
                              "style": {
                                "itemOpacity": 1,
                                "itemTextColor": "var(--ft-color-normal)"
                              }
                            }
                          ]
                        }
                      ]}
                    />
                    :
                    <div className={classes.noChartData}>No chart data available.</div>
                  }
                </div>
                <div className={classes.tables}>
                  <table className="legend">
                    <tbody>
                      <tr>
                        <td><div style={{background: palette[0]}}></div></td>
                        <td>Newly created datasets</td>
                      </tr>
                      <tr>
                        <td><div style={{background: palette[1]}}></div></td>
                        <td>Newly released datasets</td>
                      </tr>
                    </tbody>
                  </table>
                  <div className="spacer"></div>
                  <table className="stats">
                    <tbody>
                      <tr>
                        <td>Total datasets:</td>
                        <td>{statisticsStore.statistics.TotalNumberOfDatasets}</td>
                      </tr>
                      <tr>
                        <td>Total released datasets:</td>
                        <td>{statisticsStore.statistics.TotalNumberOfReleasedDatasets}</td>
                      </tr>
                      <tr>
                        <td>Average time to release a dataset:</td>
                        <td style={{color: this.getColorForNumberOfDays(statisticsStore.statistics.AverageNumberOfDaysToReleaseADataset)}}>{this.getNumberOfDays(statisticsStore.statistics.AverageNumberOfDaysToReleaseADataset)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div className={classes.warning}>FAKE DATA - FOR DEMONSTRATION PURPOSES ONLY</div>
              </div>
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
            <div>{statisticsStore.fetchError}</div>
            <Button bsStyle="primary" onClick={this.handleFetchStatisticsRetry}>Retry</Button>
          </div>
        }
      </div>
    );
  }
}