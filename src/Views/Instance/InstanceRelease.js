import React from "react";
import { observer } from "mobx-react";
import injectStyles from "react-jss";
import { Button, ButtonGroup, Modal } from "react-bootstrap";
import { Scrollbars } from "react-custom-scrollbars";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import ReleaseStore from "../../Stores/ReleaseStore";
import instanceStore from "../../Stores/InstanceStore";

import FetchingLoader from "../../Components/FetchingLoader";
import ReleaseStatus from "../../Components/ReleaseStatus";
import MultiToggle from "../../Components/MultiToggle";
import BGMessage from "../../Components/BGMessage";
import SavingModal from "./InstanceRelease/SavingModal";
import CompareWithReleasedVersionChanges from "./CompareWithReleasedVersionChanges";

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
      display: "grid",
      gridTemplateColumns: "auto auto 1fr auto auto",
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
      marginTop: "3px",
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
    overflow: "hidden",
    whiteSpace: "nowrap",
    textOverflow: "ellipsis"
  },
  nodeActions:{
    height: 0,
    marginTop: "-1px",
    "&.no-release":{
      marginLeft:"24px"
    },
    "&.no-unrelease":{
      marginRight:"24px"
    }
  },
  removeIcon:{
    color: "var(--ft-color-error)",
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
  },
  compareButton: {
    margin: "0 10px",
    height: "20px",
    "& button": {
      marginTop: "-3px",
      padding: "4px 10px 5px 10px",
      border: "transparent",
      background: "var(--bg-color-ui-contrast4)",
      color: "var(--ft-color-normal)"
    }
  },
  compareModal: {
    width:"90%",
    "@media screen and (min-width:1024px)": {
      width:"900px",
    },
    "& .modal-header": {
      overflow: "hidden",
      whiteSpace: "nowrap",
      textOverflow: "ellipsis"
    },
    "& .modal-body": {
      height: "calc(95vh - 112px)",
      padding: "3px 0"
    }
  }
};

@injectStyles(styles)
@observer
class ReleaseAction extends React.Component {

  handleProceed = () => {
    const { releaseStore } = this.props;
    if (!releaseStore.isSaving) {
      releaseStore.commitStatusChanges();
    }
  }

  render() {
    const { classes, releaseStore } = this.props;

    if (!releaseStore || !releaseStore.treeStats) {
      return null;
    }

    return (
      <React.Fragment>
        <Button onClick={this.handleProceed} disabled={releaseStore.isSaving || (releaseStore.treeStats.proceed_release === 0 && releaseStore.treeStats.proceed_unrelease === 0)} bsClass={`${classes.releaseButton} btn btn-primary`} bsStyle={"primary"} title={releaseStore.isSaving?"Saving...":(releaseStore.treeStats.proceed_release === 0 && releaseStore.treeStats.proceed_unrelease === 0?"No pending changes to release":"Proceed")}>
          <FontAwesomeIcon icon={releaseStore.isSaving?"circle-notch":"cloud-upload-alt"} spin={releaseStore.isSaving}/>
          <div>{releaseStore.isSaving?"Saving...":"Proceed"}</div>
        </Button>
        <div className={classes.treeStats}>
          <div className={"section"}>
            <h5>Pending changes:</h5>
            <div className={"stat pending"}>
              <div className={"name"}>Instances released</div>
              <div className={"pending-count"}>{releaseStore.treeStats.proceed_release}</div>
            </div>
            <div className={"stat pending"}>
              <div className={"name"}>Instances unreleased</div>
              <div className={"pending-count"}>{releaseStore.treeStats.proceed_unrelease}</div>
            </div>
            <div className={"stat pending"}>
              <div className={"name"}>Instances not modified</div>
              <div className={"pending-count"}>{releaseStore.treeStats.proceed_do_nothing}</div>
            </div>
          </div>

          <div className={"section"}>
            <h5>Current state:</h5>
            <div className={"stat"}>
              <div className={"name"}>Released</div>
              <div className={"bar released"}>
                <div className={"bar-inner"} style={{width:`${releaseStore.treeStats.released/releaseStore.treeStats.total*100}%`}}></div>
                <div className={"bar-label"}>{releaseStore.treeStats.released} / {releaseStore.treeStats.total}</div>
              </div>
            </div>
            <div className={"stat"}>
              <div className={"name"}>Not released</div>
              <div className={"bar not-released"}>
                <div className={"bar-inner"} style={{width:`${releaseStore.treeStats.not_released/releaseStore.treeStats.total*100}%`}}></div>
                <div className={"bar-label"}>{releaseStore.treeStats.not_released} / {releaseStore.treeStats.total}</div>
              </div>
            </div>
            <div className={"stat"}>
              <div className={"name"}>Has changed</div>
              <div className={"bar has-changed"}>
                <div className={"bar-inner"} style={{width:`${releaseStore.treeStats.has_changed/releaseStore.treeStats.total*100}%`}}></div>
                <div className={"bar-label"}>{releaseStore.treeStats.has_changed} / {releaseStore.treeStats.total}</div>
              </div>
            </div>
          </div>

          <div className={"section"}>
            <h5>Preview state:</h5>
            <div className={"stat"}>
              <div className={"name"}>Released</div>
              <div className={"bar released"}>
                <div className={"bar-inner"} style={{width:`${releaseStore.treeStats.pending_released/releaseStore.treeStats.total*100}%`}}></div>
                <div className={"bar-label"}>{releaseStore.treeStats.pending_released} / {releaseStore.treeStats.total}</div>
              </div>
            </div>
            <div className={"stat"}>
              <div className={"name"}>Not released</div>
              <div className={"bar not-released"}>
                <div className={"bar-inner"} style={{width:`${releaseStore.treeStats.pending_not_released/releaseStore.treeStats.total*100}%`}}></div>
                <div className={"bar-label"}>{releaseStore.treeStats.pending_not_released} / {releaseStore.treeStats.total}</div>
              </div>
            </div>
            <div className={"stat"}>
              <div className={"name"}>Has changed</div>
              <div className={"bar has-changed"}>
                <div className={"bar-inner"} style={{width:`${releaseStore.treeStats.pending_has_changed/releaseStore.treeStats.total*100}%`}}></div>
                <div className={"bar-label"}>{releaseStore.treeStats.pending_has_changed} / {releaseStore.treeStats.total}</div>
              </div>
            </div>
          </div>
        </div>
      </React.Fragment>
    );
  }
}

@injectStyles(styles)
@observer
class ReleaseNodeToggle extends React.Component {

  handleChange = status => {
    const { node, releaseStore } = this.props;
    releaseStore.markNodeForChange(node, status);
  }

  handleStopClick = e => {
    e && e.stopPropagation();
  }

  render() {
    const { classes, node, releaseStore } = this.props;

    if (!node || !releaseStore) {
      return null;
    }

    return(
      <div className={`${classes.nodeActions} ${node.status==="RELEASED"?"no-release":""} ${node.status==="NOT_RELEASED"?"no-unrelease":""}`} onClick={this.handleStopClick}>
        <MultiToggle selectedValue={node.pending_status} onChange={this.handleChange}>
          {node.status !== "RELEASED" && <MultiToggle.Toggle color={"#3498db"} value={"RELEASED"} icon="check"/>}
          <MultiToggle.Toggle color={"#999"} value={node.status} icon="dot-circle" noscale/>
          {node.status !== "NOT_RELEASED" && <MultiToggle.Toggle color={"#e74c3c"} value={"NOT_RELEASED"} icon="unlink"/>}
        </MultiToggle>
      </div>
    );
  }
}

@injectStyles(styles)
@observer
class ReleaseNodeAndChildrenToggle extends React.Component {

  handleChange(status){
    const { node, releaseStore } = this.props;
    releaseStore.markAllNodeForChange(node, status);
  }

  render() {
    const { classes, node, releaseStore } = this.props;

    if (!node || !releaseStore) {
      return null;
    }

    return(
      <div className={classes.hlActions}>
        <ButtonGroup>
          <Button onClick={this.handleChange.bind(this, "RELEASED")} bsSize={"xsmall"}>
                Release
          </Button>
          <Button onClick={this.handleChange.bind(this, null )} bsSize={"xsmall"}>
                Do nothing
          </Button>
        </ButtonGroup>
      </div>
    );
  }
}

@injectStyles(styles)
@observer
class ReleaseNode extends React.Component {

  handleShowCompare(node, e){
    e && e.stopPropagation();
    instanceStore.setComparedWithReleasedVersionInstance(node);
  }

  handleHLNode(node, e){
    const { releaseStore } = this.props;
    e && e.stopPropagation();
    releaseStore.toggleHLNode(node);
  }

  render() {
    const { classes, node, prefix="", level=0, releaseStore } = this.props;

    if (!node || !releaseStore) {
      return null;
    }

    const statusClass = (node[prefix+"status"] === "NOT_RELEASED")? "not-released"
      :(node[prefix+"status"] === "HAS_CHANGED")? "has-changed"
        :"released";

    return(
      <div className={`node ${statusClass} ${releaseStore.hlNode === node?"highlighted":""}`}>
        <div className="node-content" onClick={this.handleHLNode.bind(this, node)}>
          <div className={"status-indicator"}>
            <ReleaseStatus key={`${node[prefix+"status"]}-${node[prefix+"childrenStatus"]}`} instanceStatus={node[prefix+"status"]} childrenStatus={node[prefix+"childrenStatus"]}/>
          </div>
          <span className={"node-type"}>
            ({node.type})
          </span>
          <span className={classes.label}>
            {node.label}
          </span>
          {prefix === "" && (
            <React.Fragment>
              <div  className={classes.compareButton}>
                <Button bsSize="small" onClick={this.handleShowCompare.bind(this, node)} title="compare the changes with released vesion"><FontAwesomeIcon icon="glasses"/></Button>
              </div>
              <ReleaseNodeToggle key={`${node.pending_status}-${node.pending_childrenStatus}-${node.pending_globalStatus}`} node={node} releaseStore={releaseStore} classes={classes} />
            </React.Fragment>
          )}
        </div>
        {node.children && node.children.length > 0 &&
          <div className={"children"}>
            {node.children.map(child => (
              <ReleaseNode key={`${level+1}-${child["@id"]}-${child[prefix+"status"]}`} node={child} prefix={prefix} level={level+1} releaseStore={releaseStore} classes={classes} />
            ))}
          </div>
        }
        {prefix === "" && releaseStore.hlNode === node && node.children && node.children.length > 0 && (
          <ReleaseNodeAndChildrenToggle key={`${node.pending_status}-${node.pending_childrenStatus}-${node.pending_globalStatus}`} node={node} releaseStore={releaseStore} classes={classes} />
        )}
      </div>
    );
  }
}

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

  handleShowCompare(node, e){
    e && e.stopPropagation();
    instanceStore.setComparedWithReleasedVersionInstance(node);
  }

  handleDismissSaveError = () => {
    this.releaseStore.dismissSaveError();
  }

  handleRetryFetching = () => {
    this.releaseStore.fetchReleaseData();
  }

  render(){
    const { classes } = this.props;

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
                    <ReleaseAction releaseStore={this.releaseStore} />
                  </div>
                  <div className={classes.releaseInfos}>
                    <h4>Preview state</h4>
                  </div>
                  <div className={classes.tree}>
                    <ReleaseNode key={`0-${this.releaseStore.instancesTree["@id"]}-${this.releaseStore.instancesTree.status}`} node={this.releaseStore.instancesTree} releaseStore={this.releaseStore} />
                  </div>
                  <div className={classes.tree}>
                    <ReleaseNode key={`0-${this.releaseStore.instancesTree["@id"]}-${this.releaseStore.instancesTree.pending_status}`} node={this.releaseStore.instancesTree} prefix={"pending_"} releaseStore={this.releaseStore} />
                  </div>
                  <SavingModal store={this.releaseStore}/>
                  {instanceStore.comparedWithReleasedVersionInstance && instanceStore.comparedWithReleasedVersionInstance.relativeUrl &&
                    <Modal show={true} dialogClassName={classes.compareModal} onHide={this.handleShowCompare.bind(this,null)}>
                      <Modal.Header closeButton>
                        Compare with the released version of <strong>{instanceStore.comparedWithReleasedVersionInstance.type}&nbsp;{instanceStore.comparedWithReleasedVersionInstance.label}</strong>
                      </Modal.Header>
                      <Modal.Body>
                        <Scrollbars autoHide>
                          <CompareWithReleasedVersionChanges instanceId={instanceStore.comparedWithReleasedVersionInstance.relativeUrl} status={instanceStore.comparedWithReleasedVersionInstance.status}/>
                        </Scrollbars>
                      </Modal.Body>
                      <Modal.Footer>
                        <Button bsSize="small" onClick={this.handleShowCompare.bind(this,null)}><FontAwesomeIcon icon="times"/>&nbsp;Close</Button>
                      </Modal.Footer>
                    </Modal>
                  }
                </div>
              }
            </Scrollbars>
        }
      </div>
    );
  }
}