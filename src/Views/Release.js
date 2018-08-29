import React from "react";
import ReleaseStore from "../Stores/ReleaseStore";
import { observer } from "mobx-react";
import FetchingLoader from "../Components/FetchingLoader";
import injectStyles from "react-jss";
import { Glyphicon, Button, ButtonGroup } from "react-bootstrap";
import { uniqueId, fill } from "lodash";
import Color from "color";
import ReleaseStatus from "./Instance/ReleaseStatus";
import MultiToggle from "../Components/MultiToggle";

const styles = {
  container: {
    position: "absolute",
    top: "80px",
    width: "100vw",
    height: "calc(100vh - 80px)",
    backgroundColor: "white",
    "@media screen and (min-width:576px)": {
      left: "50%",
      width: "calc(100vw - 40px)",
      height: "calc(100vh - 100px)",
      padding: "20px",
      borderRadius: "10px",
      transform: "translateX(-50%)"
    }
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
        outline:"3px dashed #2ecc71",
        background: new Color("#2ecc71").lighten(0.75).hex(),
        zIndex:"2",
        "& .node-content":{
          opacity:0.75
        },
        "& .node::before":{
          display:"block",
          content:"''",
          position:"absolute",
          width:"3px",
          height:"100%",
          background:"#2ecc71",
          top:0,
          left:"-14px"
        }
      }
    },
    "& .node-content":{
      padding: "8px",
      position:"relative",
      border:"5px solid white",
      transition:"background 0.25s ease",
      marginLeft:"-32px"
    },
    "& .node.released > .node-content":{
      backgroundColor:new Color("#3498db").lighten(0.6).hex()
    },
    "& .node.not-released > .node-content":{
      backgroundColor:new Color("#e74c3c").lighten(0.575).hex()
    },
    "& .node.has-changed > .node-content":{
      backgroundColor:new Color("#f1c40f").lighten(0.6).hex()
    },
    "& .status-indicator":{
      transform:"scale(0.8)",
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
      color:"#333",
      marginRight:"5px"
    }
  },
  releasePreview:{
    display:"grid",
    gridTemplateRows:"1fr",
    gridTemplateColumns:"1fr 240px 1fr",
  },
  label:{
    display:"inline-block",
    verticalAlign:"middle",
  },
  nodeActions:{
    position:"absolute",
    top:16,
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
    height:"60px",
    "& h4":{
      marginTop:"16px"
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
      backgroundColor:"#cccccc",
      top:"30px",
      left:"50%"
    }
  },
  releaseButton:{
    fontWeight:"bold",
    fontSize:"1.25em",
    position:"absolute",
    left:"50%",
    top:"50px",
    transform:"translateX(-50%)",
    borderRadius:"50%",
    width:"130px",
    height:"130px",
    outline:"none",
    "&:focus, &:active, &:focus:active, &:hover":{
      outline:"none",
      border:"15px solid white"
    },
    border:"15px solid white"
  },
  treeStats:{
    position:"absolute",
    top:"200px",
    width:"180px",
    left:"50%",
    marginLeft:"-90px",
    background:"white",
    border:"1px solid #ccc",
    borderRadius:"4px",
    overflow:"hidden",
    "& .section":{
      paddingBottom:"10px",
      "& h5":{
        fontSize:"0.75em",
        fontWeight:"bold",
        paddingLeft:"4px"
      },
      "& .stat":{
        display:"grid",
        gridTemplateColumns:"1fr 1fr",
        "&.pending":{
          gridTemplateColumns:"2fr 1fr",
          "& .pending-count":{
            fontSize:"0.75em",
            fontWeight:"bold",
            textAlign:"right",
            paddingRight:"4px"
          }
        },
        "& .name":{
          fontSize:"0.75em",
          paddingLeft:"4px",
          lineHeight:"16px"
        },
        "& .bar":{
          height:"16px",
          background:new Color("#3498db").lighten(0.75).hex(),
          position:"relative",
          "& .bar-inner":{
            height:"16px",
            width:"0%",
            background:"#3498db",
            transition:"width 0.25s ease"
          },
          "& .bar-label":{
            position:"absolute",
            top:1,
            left:"50%",
            transform:"translateX(-50%)",
            fontSize:"0.75em",
            fontWeight:"bold"
          },
          "&.not-released":{
            background:new Color("#e74c3c").lighten(0.68).hex(),
            "& .bar-inner":{
              background:"#e74c3c"
            }
          },
          "&.has-changed":{
            background:new Color("#f1c40f").lighten(0.75).hex(),
            "& .bar-inner":{
              background:"#f1c40f"
            }
          }
        }
      }
    }
  }
};

@injectStyles(styles)
@observer
export default class Release extends React.Component{
  constructor(props){
    super(props);
    this.releaseStore = new ReleaseStore(props.match.params.id);
    this.keyMap = new WeakMap();
  }

  UNSAFE_componentWillReceiveProps(newProps){
    this.releaseStore = new ReleaseStore(newProps.match.id);
  }

  generateKey(o){
    if(!this.keyMap.has(o)){
      this.keyMap.set(o, uniqueId("release-node"));
    }
    return this.keyMap.get(o);
  }

  handleNodeChange(node, status){
    this.releaseStore.markNodeForChange(node, status);
  }

  handleToggleChange(node, status){
    this.releaseStore.markNodeForChange(node, status);
  }

  handleAllNodeChange(status, node){
    this.releaseStore.markAllNodeForChange(status, node);
  }

  handleHLNode(node, e){
    if(e.target.matches(".node-content")){
      e.stopPropagation();
      this.releaseStore.toggleHLNode(node);
    }
  }

  renderNode(node, prefix = "", level = 0){
    const { classes } = this.props;
    let iterator = new Array(level);
    fill(iterator, 0);
    const statusClass = (node[prefix+"status"] === "NOT_RELEASED")? "not-released"
      :(node[prefix+"status"] === "HAS_CHANGED")? "has-changed"
        :"released";
    return(
      <div key={this.generateKey(node)} className={`node ${statusClass} ${this.releaseStore.hlNode === node?"highlighted":""}`} onClick={this.handleHLNode.bind(this, node)}>
        <div className="node-content">
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
            <div className={`${classes.nodeActions}${node.status==="NOT_RELEASED"?" no-unrelease":""}`}>
              <MultiToggle selectedValue={node.pending_status} onChange={this.handleToggleChange.bind(this, node)}>
                {node.status !== "RELEASED" && <MultiToggle.Toggle color={"#3498db"} value={"RELEASED"} icon="ok"/>}
                <MultiToggle.Toggle color={"#999"} value={node.status} icon="record" noscale/>
                {node.status !== "NOT_RELEASED" && <MultiToggle.Toggle color={"#e74c3c"} value={"NOT_RELEASED"} icon="ban-circle"/>}
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
              <Button onClick={this.handleAllNodeChange.bind(this, "RELEASED", node)} bsSize={"xsmall"}>
                Release
              </Button>
              <Button onClick={this.handleAllNodeChange.bind(this, null, node)} bsSize={"xsmall"}>
                Do nothing
              </Button>
              <Button onClick={this.handleAllNodeChange.bind(this, "NOT_RELEASED", node)} bsSize={"xsmall"}>
                Unrelease
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
        {this.releaseStore.isFetching?
          <FetchingLoader><span>Fetching release data...</span></FetchingLoader>
          :
          <div className={classes.releasePreview}>
            <div className={classes.globalActions}>
              <h4>Current state</h4>
              <div className={classes.nodeActions}>
                <span>
                  Select actions on all instances :&nbsp;
                </span>
                <ButtonGroup>
                  <Button onClick={this.handleAllNodeChange.bind(this, "RELEASED", null)} bsSize={"xsmall"}>
                    Release
                  </Button>
                  <Button onClick={this.handleAllNodeChange.bind(this, null, null)} bsSize={"xsmall"}>
                    Do nothing
                  </Button>
                  <Button onClick={this.handleAllNodeChange.bind(this, "NOT_RELEASED", null)} bsSize={"xsmall"}>
                    Unrelease
                  </Button>
                </ButtonGroup>
              </div>
            </div>
            <div className={classes.releaseActions}>
              <Button onClick={()=>{alert("Not implemented yet");}} bsClass={`${classes.releaseButton} btn btn-primary`} bsStyle={"primary"}>
                <Glyphicon glyph={"cloud-upload"}/>
                <div>Proceed</div>
              </Button>
              <div className={classes.treeStats}>
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
          </div>
        }
      </div>
    );
  }
}