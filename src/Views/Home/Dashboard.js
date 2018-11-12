import React from "react";
import injectStyles from "react-jss";
import {observer} from "mobx-react";
import showdown from "showdown";
import xssFilter from "showdown-xss-filter";
import { Panel, Button } from "react-bootstrap";
import { Scrollbars } from "react-custom-scrollbars";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";

import authStore from "../../Stores/AuthStore";
import featuresStore from "../../Stores/FeaturesStore";
import FetchingLoader from "../../Components/FetchingLoader";

const converter = new showdown.Converter({extensions: [xssFilter]});

const styles = {
  container: {
    display:"grid",
    gridTemplateAreas: `"welcome welcome"
                        "features other"`,
    gridTemplateColumns:"1fr 1fr",
    gridTemplateRows:"auto 1fr",
    gridGap: "20px",
    padding: "20px",
    color: "var(--ft-color-normal)"
  },
  welcome: {
    gridArea: "welcome",
    "& h1": {
      margin: "0"
    }
  },
  features: {
    gridArea: "features",
    "& > div > div > ul": {
      height: "100%",
      listStyleType: "square",
      "& > li > ul": {
        listStyleType: "disc"
      },
      "& > .panel": {
        margin: "0",
        border: "0",
        background: "none",
        "& > .panel-heading": {
          padding: "0",
          border: "0",
          background: "none",
          "& a[aria-expanded]": {
            marginLeft: "-15px",
            cursor: "pointer",
            textDecoration: "none",
            color: "var(--ft-color-normal)",
            "&:hover, &:visited, &:focus": {
              color: "var(--ft-color-normal)",
            },
            "& svg": {
              transform: "transform 0.2s ease"
            }
          },
          "& a[aria-expanded='true']": {
            display: "none"
          }
        },
        "& > .panel-collapse > .panel-body": {
          marginTop: "-10px",
          padding: "0",
          "& > li > ul": {
            listStyleType: "disc"
          }
        },
        "& > .panel-footer": {
          padding: "0",
          border: "0",
          background: "none",
          "& a[aria-expanded]": {
            marginLeft: "-15px",
            cursor: "pointer",
            textDecoration: "none",
            color: "var(--ft-color-normal)",
            "&:hover, &:visited, &:focus": {
              color: "var(--ft-color-normal)",
            }
          }
        },
        "& > .panel-collapse.collapse:not(.in) + .panel-footer": {
          display: "none",
        }
      }
    }
  },
  featuresFetchErrorPanel:{
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
  noFeaturesPanel:{
    extend:"featuresFetchErrorPanel",
    color:"var(--ft-color-loud)"
  },
  other: {
    gridArea: "other"
  }
};

@injectStyles(styles)
@observer
export default class Dashboard extends React.Component {
  constructor(props){
    super(props);
    if(!featuresStore.isFetched && !featuresStore.isFetching){
      featuresStore.fetchFeatures();
    }
  }

  handleFetchFeaturesRetry = () => {
    featuresStore.fetchFeatures();
  }

  render(){
    const { classes } = this.props;
    return (
      <div className={classes.container} >
        <div className={classes.welcome}>
          <h1>Welcome <span title={authStore.user.name}>{authStore.user.name.split(" ")[0]}</span></h1>
        </div>
        <div className={classes.features}>
          <h3>Features:</h3>
          {!featuresStore.fetchError?
            !featuresStore.isFetching?
              featuresStore.releases.length?
                <Scrollbars autoHide>
                  <ul>
                    {featuresStore.latestReleases.map(release => (
                      <li key={release.version}>
                        <h4>{release.version}</h4>
                        <ul>
                          {release.features.map(feature => (
                            <li key={feature} dangerouslySetInnerHTML={{__html:converter.makeHtml(feature)}}></li>
                          ))}
                        </ul>
                      </li>
                    ))}
                    <Panel>
                      <Panel.Heading>
                        <Panel.Toggle componentClass="a"><FontAwesomeIcon icon={"angle-down"}/> &nbsp;Show previous releases</Panel.Toggle>
                      </Panel.Heading>
                      <Panel.Collapse>
                        <Panel.Body>
                          {featuresStore.olderReleases.map(release => (
                            <li key={release.version}>
                              <h4>{release.version}</h4>
                              <ul>
                                {release.features.map(feature => (
                                  <li key={feature} dangerouslySetInnerHTML={{__html:converter.makeHtml(feature)}}></li>
                                ))}
                              </ul>
                            </li>
                          ))}
                        </Panel.Body>
                      </Panel.Collapse>
                      <Panel.Footer>
                        <Panel.Toggle componentClass="a"><FontAwesomeIcon icon={"angle-up"}/> &nbsp;Collapse previous releases</Panel.Toggle>
                      </Panel.Footer>
                    </Panel>
                  </ul>
                </Scrollbars>
                :
                <div className={classes.noFeaturesPanel}>
                  <div>No list of features available.</div>
                </div>
              :
              <FetchingLoader>
              Fetching list of features
              </FetchingLoader>
            :
            <div className={classes.featuresFetchErrorPanel}>
              <div>{featuresStore.fetchError}</div>
              <Button bsStyle="primary" onClick={this.handleFetchFeaturesRetry}>Retry</Button>
            </div>
          }
        </div>
      </div>
    );
  }
}