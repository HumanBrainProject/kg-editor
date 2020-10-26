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

import React, { useEffect, useState } from "react";
import { createUseStyles } from "react-jss";
import {observer} from "mobx-react";
import Card from "react-bootstrap/Card";
import Button from "react-bootstrap/Button";
import Overlay from "react-bootstrap/Overlay";
import Popover from "react-bootstrap/Popover";
import uniqueId from "lodash/uniqueId";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import ReactMarkdown  from "react-markdown";

import featuresStore from "../../Stores/FeaturesStore";
import FetchingLoader from "../../Components/FetchingLoader";

const useStyles = createUseStyles({
  container: {
    position: "relative",
    padding: "15px",
    background: "var(--bg-color-ui-contrast2)",
    border: "1px solid var(--border-color-ui-contrast1)",
    color: "var(--ft-color-normal)",
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
    color: "var(--ft-color-error)"
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
});

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

const Features = observer(() => {

  const classes = useStyles();

  const [zoom, setZoom] = useState({type: null, src: null, width: 0, height: 0});

  useEffect(() => {
    if(!featuresStore.isFetched && !featuresStore.isFetching){
      featuresStore.fetchFeatures();
    }
  }, []);

  const handlePictureClick = e => {
    if (e && e.target && e.target.tagName === "IMG" && e.target.currentSrc) {
      event.stopPropagation();
      const [altType, altSrc, altWidth, altHeight] = (typeof e.target.alt === "string")?e.target.alt.split("|"):[null, null, null, null];
      if ((altType === "image" || altType === "video") && /^https?:\/\/.+$/.test(altSrc)) {
        const {width, height} = getVideoSize(Number(altWidth), Number(altHeight));
        setZoom({type: altType, src: altSrc, width: width, height: height});
      } else {
        const src = e.target.currentSrc;
        const {width, height} = getPictureSize(Number(e.target.naturalWidth), Number(e.target.naturalHeight));
        setZoom({type: "image", src: src, width: width, height: height});
      }
    } else {
      handlePopOverClose();
    }
  };

  const handlePopOverClose = () => {
    setZoom({type: null, src: null, width: 0, height: 0});
  };

  const handleFetchFeaturesRetry = () => {
    featuresStore.fetchFeatures();
  };

  return (
    <div className={classes.container}>
      <h3>Latest features</h3>
      {!featuresStore.fetchError?
        !featuresStore.isFetching?
          featuresStore.releases.length?
            <ul className="list" onClick={handlePictureClick}>
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
              <Card>
                <Card.Collapse>
                  <Card.Body>
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
                  </Card.Body>
                </Card.Collapse>
                <Card.Footer>
                  <Card.Toggle as="a"><FontAwesomeIcon icon="angle-down"/> &nbsp;<span className="showButtonLabel">Show previous releases</span><span className="collapseButtonLabel">Collapse previous releases</span></Card.Toggle>
                </Card.Footer>
              </Card>
              <Overlay
                show={!!zoom.type}
                container={document.body}
                rootClose={true}
                onHide={handlePopOverClose}
              >
                <Popover id={uniqueId("pictureZoom")} className={classes.popOver} positionTop="50%" positionLeft="50%">
                  {zoom.type === "video"?
                    <iframe width={zoom.width} height={zoom.height} src={zoom.src} frameBorder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
                    :
                    zoom.type === "image"?
                      <img src={zoom.src}  width={zoom.width} height={zoom.height}/>
                      :null
                  }
                  <button className={classes.popOverCloseButton} onClick={handlePopOverClose} title="close"><FontAwesomeIcon icon="times"></FontAwesomeIcon></button>
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
          <Button variant="primary" onClick={handleFetchFeaturesRetry}>Retry</Button>
        </div>
      }
    </div>
  );
});

export default Features;