import React from "react";
import injectStyles from "react-jss";
import {observer} from "mobx-react";
import { Panel, Button, Overlay, Popover } from "react-bootstrap";
import {uniqueId} from "lodash";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import ReactMarkdown  from "react-markdown";

import featuresStore from "../../Stores/FeaturesStore";
import FetchingLoader from "../../Components/FetchingLoader";

const styles = {
  container: {
    padding: "15px",
    "& h3": {
      marginTop: "0"
    },
    "& img": {
      width: "calc(100% - 20px)"
    },
    "& ul.list": {
      height: "100%",
      paddingLeft: "20px",
      listStyleType: "square",
      "& > li > ul": {
        paddingLeft: "20px",
        listStyleType: "disc",
        "& > li + li": {
          marginTop: "15px"
        },
        "& > li img": {
          cursor: "pointer"
        }
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
            listStyleType: "disc",
            "& > li + li": {
              marginTop: "15px"
            },
            "& > li img": {
              cursor: "pointer"
            }
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
  },
  popOver: {
    top: "50% !important",
    left: "50% !important",
    transform: "translate(-50%, -50%)",
    maxWidth: "unset",
    background: "var(--list-bg-hover)",
    border: "1px solid var(--list-border-hover)",
    "& .arrow": {
      display: "none !important"
    },
    "& .popover-content": {
      padding: "30px"
    }
  },
  popOverCloseButton: {
    position: "absolute",
    top: "3px",
    right: "3px",
    color:"var(--ft-color-loud)",
    backgroundColor: "transparent",
    border: "transparent"
  }
};

const windowHeight = () => {
  const w = window,
    d = document,
    e = d.documentElement,
    g = d.getElementsByTagName("body")[0];
  return w.innerHeight || e.clientHeight || g.clientHeight;
  //return $(window).height();
};

const windowWidth = () => {
  const w = window,
    d = document,
    e = d.documentElement,
    g = d.getElementsByTagName("body")[0];
  return w.innerWidth || e.clientWidth || g.clientWidth;
  //return $(window).width();
};

const getPictureSize = (width, height) => {
  const wWidth = windowWidth() - 120;
  const wheight = windowHeight() - 120;
  if (isNaN(width) && isNaN(height)) {
    width = wWidth;
    height = 0;
  } else if (isNaN(width)) {
    width = 0;
  } if (isNaN(height)) {
    height = 0;
  } else if (width > wWidth && height > wheight) {
    if (width/wWidth > height/wheight) {
      width = wWidth + "px";
      height = "auto";
    } else {
      width = "auto";
      height = wheight + "px";
    }
  } else if (width > wWidth) {
    width = wWidth + "px";
    height = "auto";
  } else if (height > wheight) {
    width = "auto";
    height = wheight + "px";
  } else {
    if (width === 0) {
      width = "auto";
    } else {
      width = width + "px";
    }
    if (height === 0) {
      height = "auto";
    } else {
      height = height  + "px";
    }
  }
  return {
    width: width,
    height: height
  };
};

const getVideoSize = (width, height) => {
  const wWidth = windowWidth() - 120;
  const wheight = windowHeight() - 120;
  if (isNaN(width) || isNaN(height) || width === 0 || height === 0) {
    width = 560;
    height = 315;
  }
  if (width > wWidth && height > wheight) {
    if (width/wWidth > height/wheight) {
      height = Math.floor(wWidth/width * height) + "px";
      width = wWidth + "px";
    } else {
      width = Math.floor(wheight/height * width) + "px";
      height = wheight + "px";
    }
  } else if (width > wWidth) {
    height = Math.floor(wWidth/width * height) + "px";
    width = wWidth + "px";
  } else if (height > wheight) {
    width = Math.floor(wWidth/width * height) + "px";
    height = wheight + "px";
  }
  return {
    width: width,
    height: height
  };
};

@injectStyles(styles)
@observer
export default class Features extends React.Component {
  constructor(props){
    super(props);
    this.state = { pictureZoom: {src: null, width: 0, height: 0}, video:{src: null, width: 0, height: 0} };
    if(!featuresStore.isFetched && !featuresStore.isFetching){
      featuresStore.fetchFeatures();
    }
  }

  handlePictureClick = e => {
    if (e.target.tagName === "IMG" && e.target.currentSrc) {
      event.stopPropagation();
      const [videoUrl, videoWidth, videoHeight] = e.target.alt?e.target.alt.split("|"):null;
      if (videoUrl && videoUrl.indexOf("https://") === 0) {
        const {width, height} = getVideoSize(Number(videoWidth), Number(videoHeight));
        this.setState({pictureZoom: {src: null, width: 0, height: 0}, video:{src: videoUrl, width: width, height:height}});
      } else {
        const src = e.target.currentSrc;
        const {width, height} = getPictureSize(e.target.naturalWidth, e.target.naturalHeight);
        this.setState({pictureZoom: {src: src, width: width, height: height}, video:{src: null, width: 0, height: 0}});
      }
    } else {
      this.handlePopOverClose();
    }
  }

  handlePopOverClose = () => {
    this.setState({pictureZoom: {src: null, width: 0, height: 0}, video:{src: null, width: 0, height: 0}});
  }

  handleFetchFeaturesRetry = () => {
    featuresStore.fetchFeatures();
  }

  render(){
    const { classes } = this.props;
    return (
      <div className={`${classes.container} widget`}>
        <h3>Latest features</h3>
        {!featuresStore.fetchError?
          !featuresStore.isFetching?
            featuresStore.releases.length?
              <ul className="list" onClick={this.handlePictureClick}>
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
                    <Panel.Toggle componentClass="a"><FontAwesomeIcon icon="angle-down"/> &nbsp;<span className="showButtonLabel">Show previous releases</span><span className="collapseButtonLabel">Collapse previous releases</span></Panel.Toggle>
                  </Panel.Footer>
                </Panel>
                <Overlay
                  show={!!this.state.pictureZoom.src || !!this.state.video.src}
                  container={document.body}
                  rootClose={true}
                  onHide={this.handlePopOverClose.bind(this)}
                >
                  <Popover id={uniqueId("pictureZoom")} className={classes.popOver} positionTop="50%" positionLeft="50%">
                    {this.state.video.src?
                      <iframe width={this.state.video.width} height={this.state.video.height} src={this.state.video.src} frameBorder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
                      :
                      <img src={this.state.pictureZoom.src}  width={this.state.pictureZoom.width} height={this.state.pictureZoom.height}/>
                    }
                    <button className={classes.popOverCloseButton} onClick={this.handlePopOverClose} title="close"><FontAwesomeIcon icon="times"></FontAwesomeIcon></button>
                  </Popover>
                </Overlay>
              </ul>
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