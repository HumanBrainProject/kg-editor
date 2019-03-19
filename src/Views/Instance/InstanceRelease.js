import React from "react";
import { observer } from "mobx-react";
import injectStyles from "react-jss";
import { Button, ButtonGroup } from "react-bootstrap";
import { uniqueId, fill } from "lodash";
import { Scrollbars } from "react-custom-scrollbars";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import ReleaseStore from "../../Stores/ReleaseStore";

import FetchingLoader from "../../Components/FetchingLoader";
import ReleaseStatus from "../../Components/ReleaseStatus";
import MultiToggle from "../../Components/MultiToggle";
import BGMessage from "../../Components/BGMessage";
import SavingModal from "./InstanceRelease/SavingModal";

const styles = {
  container: {
    position: "relative",
    width: "calc(100% - 20px)",
    height: "calc(100% - 20px)",
    backgroundColor: "var(--bg-color-ui-contrast2)",
    color: "var(--ft-color-normal)",
    border: "1px solid var(--bg-color-blend-contrast1)",
    margin:"10px"
  },
  hlActions:{
    position:"absolute",
    top:-3,
    left:"50%",
    transform:"translateX(-50%)",
    borderRadius:"0 0 4px 4px",
    background:"#2ecc71",
    padding:"4px 4px 4px 4px",
    "&::before":{
      display:"block",
      position:"absolute",
      content:"''",
      width:30,
      height:30,
      top:0,
      left:-14,
      background:"transparent",
      backgroundImage:"radial-gradient(circle at 0 100%, rgba(46, 204, 113, 0) 14px, #2ecc71 15px)",
      backgroundSize: "50% 50%",
      backgroundRepeat: "no-repeat",
      borderTop:"3px solid #2ecc71",
      boxSizing:"content-box"
    },
    "&::after":{
      display:"block",
      position:"absolute",
      content:"''",
      width:30,
      height:30,
      top:0,
      right:-29,
      background:"transparent",
      backgroundImage:"radial-gradient(circle at 100% 100%, rgba(46, 204, 113, 0) 14px, #2ecc71 15px)",
      backgroundSize: "50% 50%",
      backgroundRepeat: "no-repeat",
      borderTop:"3px solid #2ecc71",
      boxSizing:"content-box"
    }
  },
  tree:{
    "& .glyphicon + $label":{
      marginLeft:"10px"
    },
    "& .node:hover":{
      outline:"1"
    },
    "& .node":{
      paddingLeft:"32px",
      position:"relative",
      transition:"outline-color 0.25s ease, background 0.25s ease",
      outlineColor:"transparent",
      "&.highlighted":{
        outline:"3px dashed var(--release-color-highlight)",
        background: "var(--release-bg-highlight)",
        zIndex:"2",
        "& .node-content":{
          opacity:0.8
        },
        "& .node::before":{
          display:"block",
          content:"''",
          position:"absolute",
          width:"3px",
          height:"100%",
          background:"var(--release-color-highlight)",
          top:0,
          left:"-14px"
        }
      }
    },
    "& .node-content":{
      padding: "8px",
      position:"relative",
      border:"2px solid var(--bg-color-ui-contrast2)",
      transition:"background 0.25s ease",
      marginLeft:"-32px"
    },
    "& .node.released > .node-content":{
      backgroundColor:"var(--release-bg-released)"
    },
    "& .node.not-released > .node-content":{
      backgroundColor:"var(--release-bg-not-released)"
    },
    "& .node.has-changed > .node-content":{
      backgroundColor:"var(--release-bg-has-changed)"
    },
    "& .status-indicator":{
      display:"inline-block",
      verticalAlign:"middle",
      marginRight:"4px"
    },
    "& .child-icon":{
      color:"black",
      fontSize:"1.2em",
      verticalAlign:"middle",
      transform:"rotateX(180deg)",
      transformOrigin:"50% 41%",
      marginRight:"5px"
    },
    "& .node-type":{
      fontSize:"0.75em",
      display:"inline-block",
      verticalAlign:"middle",
      fontWeight:"bold",
      color:"var(--ft-color-loud)",
      marginRight:"5px"
    }
  },
  releasePreview:{
    display:"grid",
    gridTemplateRows:"1fr",
    gridTemplateColumns:"1fr 240px 1fr",
    padding:"10px"
  },
  label:{
    display:"inline-block",
    verticalAlign:"middle",
  },
  nodeActions:{
    position:"absolute",
    top:7,
    right:10,
    "&.no-unrelease":{
      right:"34px"
    }
  },
  removeIcon:{
    color: "#e74c3c",
    fontSize:"1.5em",
    marginLeft:"10px",
    opacity:0.25,
    transition:"all 0.25s ease",
    cursor:"pointer",
    "&.selected":{
      opacity:1
    },
    "&.disabled":{
      opacity:0,
      pointerEvents:"none",
      cursor:"default"
    }
  },
  globalActions:{
    position:"relative",
    "& h4":{
      margin:"0 0 10px 2px",
      color:"var(--ft-color-loud)"
    }
  },
  releaseInfos:{
    extend:"globalActions"
  },
  releaseActions:{
    gridRow:"span 2",
    position:"relative",
    "&::before":{
      content:"''",
      display:"block",
      position:"absolute",
      height:"100%",
      width:"1px",
      backgroundColor:"var(--border-color-ui-contrast5)",
      top:"50px",
      left:"50%"
    }
  },
  releaseButton:{
    fontWeight:"bold",
    fontSize:"1.25em",
    position:"absolute",
    left:"50%",
    top:"100px",
    transform:"translateX(-50%)",
    borderRadius:"50%",
    width:"130px",
    height:"130px",
    outline:"none",
    "&:focus, &:active, &:focus:active, &:hover, &[disabled], &[disabled]:focus, &[disabled]:active, &[disabled]:focus:active, &[disabled]:hover":{
      outline:"none",
      border:"15px solid var(--bg-color-ui-contrast2)"
    },
    "&[disabled]:focus, &[disabled]:active, &[disabled]:focus:active, &[disabled]:hover": {
      cursor: "default"
    },
    border:"15px solid var(--bg-color-ui-contrast2)"
  },
  treeStats:{
    position:"absolute",
    top:"280px",
    width:"200px",
    left:"50%",
    marginLeft:"-90px",
    padding:"0 10px",
    background:"var(--bg-color-ui-contrast3)",
    border:"1px solid var(--border-color-ui-contrast1)",
    borderRadius:"4px",
    overflow:"hidden",
    "& .section":{
      paddingBottom:"10px",
      "& h5":{
        fontSize:"0.8em",
        fontWeight:"bold"
      },
      "& .stat":{
        display:"grid",
        gridTemplateColumns:"1fr 1fr",
        "&.pending":{
          gridTemplateColumns:"2fr 1fr",
          "& .pending-count":{
            fontSize:"0.8em",
            fontWeight:"bold",
            textAlign:"right",
            paddingRight:"4px"
          }
        },
        "& .name":{
          fontSize:"0.8em",
          paddingLeft:"4px",
          lineHeight:"16px"
        },
        "& .bar":{
          height:"16px",
          background:"var(--release-bg-released)",
          position:"relative",
          "& .bar-inner":{
            height:"16px",
            width:"0%",
            background:"var(--release-color-released)",
            transition:"width 0.25s ease"
          },
          "& .bar-label":{
            position:"absolute",
            top:0,
            left:0,
            width:"100%",
            textAlign:"center",
            fontSize:"0.8em",
            fontWeight:"bold",
            color:"var(--ft-color-loud)"
          },
          "&.not-released":{
            background:"var(--release-bg-not-released)",
            "& .bar-inner":{
              background:"var(--release-color-not-released)"
            }
          },
          "&.has-changed":{
            background:"var(--release-bg-has-changed)",
            "& .bar-inner":{
              background:"var(--release-color-has-changed)"
            }
          }
        }
      }
    }
  }
};

@injectStyles(styles)
@observer
export default class InstanceRelease extends React.Component{
  constructor(props){
    super(props);
    this.releaseStore = new ReleaseStore(props.id);
    this.keyMap = new WeakMap();
  }

  UNSAFE_componentWillReceiveProps(newProps){
    if(this.props.id !== newProps.id){
      this.releaseStore = new ReleaseStore(newProps.id);
    }
  }

  generateKey(o){
    if(!this.keyMap.has(o)){
      this.keyMap.set(o, uniqueId("release-node"));
    }
    return this.keyMap.get(o);
  }

  handleToggleChange(node, status){
    this.releaseStore.markNodeForChange(node, status);
  }

  handleAllNodeChange(node, status){
    this.releaseStore.markAllNodeForChange(node, status);
  }

  handleHLNode(node, e){
    e.stopPropagation();
    this.releaseStore.toggleHLNode(node);
  }

  handleStopToggleClick = (e) => {
    e.stopPropagation();
  }

  handleProceed = () => {
    this.releaseStore.commitStatusChanges();
  }

  handleDismissSaveError = () => {
    this.releaseStore.dismissSaveError();
  }

  handleRetryFetching = () => {
    this.releaseStore.fetchReleaseData();
  }

  renderNode(node, prefix = "", level = 0){
    const { classes } = this.props;
    let iterator = new Array(level);
    fill(iterator, 0);
    const statusClass = (node[prefix+"status"] === "NOT_RELEASED")? "not-released"
      :(node[prefix+"status"] === "HAS_CHANGED")? "has-changed"
        :"released";
    return(
      <div key={this.generateKey(node)} className={`node ${statusClass} ${this.releaseStore.hlNode === node?"highlighted":""}`}>
        <div className="node-content" onClick={this.handleHLNode.bind(this, node)}>
          <div className={"status-indicator"}>
            <ReleaseStatus instanceStatus={node[prefix+"status"]} childrenStatus={node[prefix+"childrenStatus"]}/>
          </div>
          <span className={"node-type"}>
            ({node.type})
          </span>
          <span className={classes.label}>
            {node.label}
          </span>
          {prefix === "" &&
            <div className={`${classes.nodeActions}${node.status==="NOT_RELEASED"?" no-unrelease":""}`} onClick={this.handleStopToggleClick}>
              <MultiToggle selectedValue={node.pending_status} onChange={this.handleToggleChange.bind(this, node)}>
                {node.status !== "RELEASED" && <MultiToggle.Toggle color={"#3498db"} value={"RELEASED"} icon="check"/>}
                <MultiToggle.Toggle color={"#999"} value={node.status} icon="dot-circle" noscale/>
                {node.status !== "NOT_RELEASED" && <MultiToggle.Toggle color={"#e74c3c"} value={"NOT_RELEASED"} icon="unlink"/>}
              </MultiToggle>
            </div>
          }
        </div>
        {node.children && node.children.length > 0 &&
          <div className={"children"}>
            {node.children.map(child => this.renderNode(child, prefix, level+1))}
          </div>
        }
        {prefix === "" && this.releaseStore.hlNode === node && node.children && node.children.length > 0 &&
          <div className={classes.hlActions}>
            <ButtonGroup>
              <Button onClick={this.handleAllNodeChange.bind(this, node, "RELEASED")} bsSize={"xsmall"}>
                Release
              </Button>
              <Button onClick={this.handleAllNodeChange.bind(this, node, null )} bsSize={"xsmall"}>
                Do nothing
              </Button>
            </ButtonGroup>
          </div>
        }
      </div>
    );
  }

  render(){
    const { classes } = this.props;
    const treeStats = this.releaseStore.isFetched? this.releaseStore.treeStats: {};

    return (
      <div className={classes.container}>
        {this.releaseStore.saveError?
          <BGMessage icon="ban">
            There has been an error while releasing one or more instances.<br/>
            Please try again or contact our support if the problem persists.<br/><br/>
            <small>{this.releaseStore.saveError}</small><br/><br/>
            <Button bsStyle="primary" onClick={this.handleDismissSaveError}>OK</Button>
          </BGMessage>
          :this.releaseStore.fetchError?
            <BGMessage icon="ban">
              There has been an error while fetching the release data for this instance.<br/>
              Please try again or contact our support if the problem persists.<br/><br/>
              <small>{this.releaseStore.fetchError}</small><br/><br/>
              <Button bsStyle="primary" onClick={this.handleRetryFetching}>Retry</Button>
            </BGMessage>
            :
            <Scrollbars autoHide>
              {this.releaseStore.isFetching?
                <FetchingLoader><span>Fetching release data...</span></FetchingLoader>
                :
                <div className={classes.releasePreview}>
                  <div className={classes.globalActions}>
                    <h4>Current state</h4>
                  </div>
                  <div className={classes.releaseActions}>
                    <Button onClick={this.releaseStore.isSaving?undefined:this.handleProceed} disabled={this.releaseStore.isSaving || (treeStats.proceed_release === 0 && treeStats.proceed_unrelease === 0)} bsClass={`${classes.releaseButton} btn btn-primary`} bsStyle={"primary"} title={this.releaseStore.isSaving?"Saving...":(treeStats.proceed_release === 0 && treeStats.proceed_unrelease === 0?"No pending changes to release":"Proceed")}>
                      <FontAwesomeIcon icon={this.releaseStore.isSaving?"circle-notch":"cloud-upload-alt"} spin={this.releaseStore.isSaving}/>
                      <div>{this.releaseStore.isSaving?"Saving...":"Proceed"}</div>
                    </Button>
                    <div className={classes.treeStats}>
                      <div className={"section"}>
                        <h5>Pending changes:</h5>
                        <div className={"stat pending"}>
                          <div className={"name"}>Instances released</div>
                          <div className={"pending-count"}>{treeStats.proceed_release}</div>
                        </div>
                        <div className={"stat pending"}>
                          <div className={"name"}>Instances unreleased</div>
                          <div className={"pending-count"}>{treeStats.proceed_unrelease}</div>
                        </div>
                        <div className={"stat pending"}>
                          <div className={"name"}>Instances not modified</div>
                          <div className={"pending-count"}>{treeStats.proceed_do_nothing}</div>
                        </div>
                      </div>

                      <div className={"section"}>
                        <h5>Current state:</h5>
                        <div className={"stat"}>
                          <div className={"name"}>Released</div>
                          <div className={"bar released"}>
                            <div className={"bar-inner"} style={{width:`${treeStats.released/treeStats.total*100}%`}}></div>
                            <div className={"bar-label"}>{treeStats.released} / {treeStats.total}</div>
                          </div>
                        </div>
                        <div className={"stat"}>
                          <div className={"name"}>Not released</div>
                          <div className={"bar not-released"}>
                            <div className={"bar-inner"} style={{width:`${treeStats.not_released/treeStats.total*100}%`}}></div>
                            <div className={"bar-label"}>{treeStats.not_released} / {treeStats.total}</div>
                          </div>
                        </div>
                        <div className={"stat"}>
                          <div className={"name"}>Has changed</div>
                          <div className={"bar has-changed"}>
                            <div className={"bar-inner"} style={{width:`${treeStats.has_changed/treeStats.total*100}%`}}></div>
                            <div className={"bar-label"}>{treeStats.has_changed} / {treeStats.total}</div>
                          </div>
                        </div>
                      </div>

                      <div className={"section"}>
                        <h5>Preview state:</h5>
                        <div className={"stat"}>
                          <div className={"name"}>Released</div>
                          <div className={"bar released"}>
                            <div className={"bar-inner"} style={{width:`${treeStats.pending_released/treeStats.total*100}%`}}></div>
                            <div className={"bar-label"}>{treeStats.pending_released} / {treeStats.total}</div>
                          </div>
                        </div>
                        <div className={"stat"}>
                          <div className={"name"}>Not released</div>
                          <div className={"bar not-released"}>
                            <div className={"bar-inner"} style={{width:`${treeStats.pending_not_released/treeStats.total*100}%`}}></div>
                            <div className={"bar-label"}>{treeStats.pending_not_released} / {treeStats.total}</div>
                          </div>
                        </div>
                        <div className={"stat"}>
                          <div className={"name"}>Has changed</div>
                          <div className={"bar has-changed"}>
                            <div className={"bar-inner"} style={{width:`${treeStats.pending_has_changed/treeStats.total*100}%`}}></div>
                            <div className={"bar-label"}>{treeStats.pending_has_changed} / {treeStats.total}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className={classes.releaseInfos}>
                    <h4>Preview state</h4>
                  </div>
                  <div className={classes.tree}>
                    {this.renderNode(this.releaseStore.instancesTree)}
                  </div>
                  <div className={classes.tree}>
                    {this.renderNode(this.releaseStore.instancesTree, "pending_")}
                  </div>
                  <SavingModal store={this.releaseStore}/>
                </div>
              }
            </Scrollbars>
        }
      </div>
    );
  }
}