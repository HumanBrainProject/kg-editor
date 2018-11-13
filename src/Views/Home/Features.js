import React from "react";
import injectStyles from "react-jss";
import {observer} from "mobx-react";
import { Panel, Button } from "react-bootstrap";
import { Scrollbars } from "react-custom-scrollbars";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import ReactMarkdown  from "react-markdown";

import featuresStore from "../../Stores/FeaturesStore";
import FetchingLoader from "../../Components/FetchingLoader";

const styles = {
  container: {
    "& h3": {
      marginTop: "0"
    },
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
              color: "var(--ft-color-loud)"
            },
            "& svg": {
              transform: "transform 0.5s ease"
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
              color: "var(--ft-color-loud)"
            }
          },
          "& a[aria-expanded='false']": {
            "& .collapseButtonLabel": {
              display: "none"
            }
          },
          "& a[aria-expanded='true']": {
            "& .showButtonLabel": {
              display: "none"
            },
            "& svg": {
              transform: "rotateX(180deg)"
            }
          }
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
  }
};

@injectStyles(styles)
@observer
export default class Features extends React.Component {
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
      <div className={`${classes.container} widget`}>
        <h3>Latest features:</h3>
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
                          <li key={feature}><ReactMarkdown source={feature} /></li>
                        ))}
                      </ul>
                    </li>
                  ))}
                  <Panel>
                    <Panel.Collapse>
                      <Panel.Body>
                        {featuresStore.olderReleases.map(release => (
                          <li key={release.version}>
                            <h4>{release.version}</h4>
                            <ul>
                              {release.features.map(feature => (
                                <li key={feature}><ReactMarkdown source={feature} /></li>
                              ))}
                            </ul>
                          </li>
                        ))}
                      </Panel.Body>
                    </Panel.Collapse>
                    <Panel.Footer>
                      <Panel.Toggle componentClass="a"><FontAwesomeIcon icon={"angle-down"}/> &nbsp;<span className="showButtonLabel">Show previous releases</span><span className="collapseButtonLabel">Collapse previous releases</span></Panel.Toggle>
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
    );
  }
}