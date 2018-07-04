import React from "react";
import injectStyles from "react-jss";
import { observer, inject } from "mobx-react";
import { Panel, Row, Col, Button, Glyphicon } from "react-bootstrap";
import { Form, Field } from "hbp-spark";
import { Link } from "react-router-dom";
import ToggleButton from "./ToggleButton";

const generateRandomName = () => [...`${new Date().getTime()}`].reduce((r, c) => r + String.fromCharCode(65 + Number(c)), "");
const animationId = generateRandomName();

const styles = {
  panelHeader: {
    padding: "0",
    "& h6": {
      margin: 0,
      color: "gray",
      fontWeight: "bold"
    }
  },
  panelSummary: {
    padding: "10px 0 0 0"
  },
  panelBody: {
    border: "0",
    borderRadius: "0",
    boxShadow: "none",
    backgroundColor: "transparent",
    margin: "0",
    padding: "0",
    "& .panel-body": {
      padding: "0"
    }
  },
  panelFooter: {
    padding: "0"
  },
  readModeToggleContainer: {
    width: "40px",
    height: "34px",
    perspective: "600px"
  },
  readModeTogglePanel: {
    position: "relative",
    height: "100%",
    width: "100%",
    transition: "transform 1s",
    transformStyle: "preserve-3d"
  },
  readModeToggleButton: {
    position: "absolute",
    height: "100%",
    width: "100%",
    backfaceVisibility: "hidden"
  },
  editModeButton: {

  },
  readModeButton: {
    transform: "rotateY(180deg)"
  },
  panel: {
    transition: "all 0.25s linear",
    "&:not(.current)": {
      borderRadius: "10px",
      color: "#555",
      cursor:"pointer"
    },
    "&.main:not(.current)": {
      border: "1px solid transparent",
      padding: "10px"
    },
    "&:not(.main)" : {
      marginBottom: "10px",
      border: "1px solid #ccc",
      borderRadius: "10px"
    },
    "&:not(.main).current": {
      borderColor: "#adadad",
      backgroundColor: "white"
    },
    "&.hasChanged:not(.current):not(.readMode)": {
      background: "#ffe6e5"
    },
    "&:hover:not(.current)": {
      backgroundColor: "#eff5fb",
      borderColor: "#337ab7"
    },
    "&:hover:not(.current).readMode": {
      color: "#337ab7",
    },
    "&:not(.readMode) textarea": {
      minHeight: "200px"
    },
    "&:not(.readMode) $readModeTogglePanel": {
      transform: "rotateY(180deg)"
    },
    "&:not(.main) $panelHeader": {
      padding: "10px 10px 0 10px"
    },
    "&.current $panelHeader": {
      borderBottom: "1px solid #ccc",
      paddingBottom: "10px"
    },
    "&.current $panelHeader h6": {
      margin: "10px 0",
      color: "#333"
    },
    "&:not(.main) $panelSummary": {
      padding: "10px 10px 0 10px"
    },
    "&:not(.main) $panelBody": {
      padding: "0 10px"
    },
    "&.current $panelBody": {
      paddingBottom: "10px"
    },
    "&:not(.main) $panelFooter": {
      padding: "0 10px"
    },
    "&.current $panelFooter": {
      borderTop: "1px solid #ccc",
      paddingTop: "10px"
    },
    "&.current:not(.editMode) $panelFooter": {
      paddingBottom: "10px"
    },
    "& .spark-field-input-text.spark-readmode, & .spark-field-dropdown-select.spark-readmode": {
      marginBottom: "5px"
    },
    "& .spark-field-input-text.spark-readmode label.spark-label, & .spark-field-dropdown-select.spark-readmode label.spark-label": {
      marginBottom: "0"
    }
  },
  id:{
    paddingBottom: "10px",
    color:"grey",
    fontWeight:"300",
    fontSize:"0.7em",
    wordBreak: "break-all"
  },
  action:{
    "& .btn":{
      display:"block",
      width:"100%"
    }
  },
  fetchingPanel: {
    position: "relative",
    fontSize: "18px",
    fontWeight: "lighter",
    "@media screen and (max-width:576px)": {
      width: "220px",
      "&[active='false']": {
        width: "180px"
      }
    },
    "&[active='true']": {
      position: "absolute",
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)",
    },
    "& small": {
      display: "block",
      padding: "10px 0",
      color:"grey",
      fontWeight:"400",
      fontSize:"0.6em",
      fontStyle: "italic",
      whiteSpace: "nowrap",
      "@media screen and (max-width:576px)": {
        wordBreak: "break-all",
        wordWrap: "break-word",
        whiteSpace: "normal",
      }
    }
  },
  fetchingGlyphicon: {
    composes: "glyphicon glyphicon-refresh",
    animation: `${animationId} .7s infinite linear`
  },
  [`@keyframes ${animationId}`]: {
    "from": {
      transform: "scale(1) rotate(0deg)"
    },
    "to": {
      transform: "scale(1) rotate(360deg)"
    }
  },
  fetchingLabel: {
    paddingLeft: "6px"
  },
  fetchErrorPanel: {
    position: "absolute",
    top: "50%",
    left: "50%",
    padding: "20px",
    border: "1px solid gray",
    borderRadius: "5px",
    transform: "translate(-50%, -50%)",
    textAlign: "center",
    minWidth: "220px",
    "& h4": {
      paddingBottom: "10px",
      color: "red"
    },
    "& button + button, & a + button, & a + a": {
      marginLeft: "20px"
    }
  },
  inlineFetchErrorPanel: {
    "& h5": {
      marginTop: "0"
    },
    "& small": {
      display: "block",
      paddingBottom: "6px",
      color:"grey",
      fontWeight:"400",
      fontSize:"0.8em",
      fontStyle: "italic",
      whiteSpace: "nowrap",
      "@media screen and (max-width:576px)": {
        wordBreak: "break-all",
        wordWrap: "break-word",
        whiteSpace: "normal",
      }
    },
    "& button span + span": {
      marginLeft: "4px"
    }
  },
  hasChangedIndicator: {
    height: "9px",
    width: "9px",
    backgroundColor: "#FC3D3A",
    borderRadius: "50%",
    display: "inline-block"
  }
};

@injectStyles(styles)
@inject("instanceStore")
@observer
export default class InstanceForm extends React.Component{
  constructor(props){
    super(props);
    this.fetchInstance();
  }

  handleFocus = () => {
    if(this.props.instanceStore.currentInstanceId !== this.props.id){
      this.props.instanceStore.setCurrentInstanceId(this.props.id, this.props.level);
    }
  }

  handleEdit = () => {
    this.props.instanceStore.toggleReadMode(this.props.id, this.props.level, false);
  }

  handleChange = () => {
    this.props.instanceStore.instanceHasChanged(this.props.id);
  }

  handleLoad = () => {
    this.props.instanceStore.memorizeInstanceInitialValues(this.props.id);
  }

  handleCancel = () => {
    this.props.instanceStore.toggleReadMode(this.props.id, this.props.level, true);
    const instance = this.props.instanceStore.getInstance(this.props.id);
    if (instance.hasChanged) {
      this.props.instanceStore.cancelInstanceChanges(this.props.id);
    }
  }

  handleSave = () => {
    this.props.instanceStore.toggleReadMode(this.props.id, this.props.level, true);
    this.props.instanceStore.saveInstance(this.props.id);
  }

  fetchInstance = () => {
    this.props.instanceStore.fetchInstanceData(this.props.id);
  }

  renderReadModeField = (field) => {
    if (this.props.id !== this.props.instanceStore.currentInstanceId && this.props.level !== 0) {
      if (field && field.type === "TextArea") {
        if (field.value && field.value.length && field.value.length >= 200) {
          return field.value.substr(0,197) + "...";
        }
        return field.value;
      }
      return field.value;
    }
    return field.value;
  }

  render(){
    const { classes, level } = this.props;
    const instance = this.props.instanceStore.getInstance(this.props.id);

    const isReadMode = !instance.isFetched || (instance.form && instance.form.readMode);

    const [organization, domain, schema, version, ] = this.props.id.split("/");

    const nodeType = instance.isFetched && instance.data && instance.data.label || schema;

    const backLink = (organization && domain && schema && version)?`/nodetype/${organization}/${domain}/${schema}/${version}`:"/";

    let panelClassName = classes.panel;
    if (isReadMode) {
      panelClassName += " readMode";
    }
    if (this.props.id === this.props.instanceStore.currentInstanceId) {
      panelClassName += " current";
    }
    if (this.props.level === 0) {
      panelClassName += " main";
    }
    if (instance.hasChanged){
      panelClassName += " hasChanged";
    }

    return(
      (!instance.hasFetchError)?
        (!instance.isFetching)?
          <div
            onFocus={this.handleFocus}
            onClick={this.handleFocus}
            onChange={this.handleChange}
            onLoad={this.handleLoad}
            className={panelClassName}>
            <Form store={instance.form}>
              <div className={classes.panelHeader}>
                <Row>
                  <Col xs={10}>
                    <h6>{nodeType}</h6>
                  </Col>
                  <Col xs={2} >
                    <span className="pull-right">
                      {this.props.id === this.props.instanceStore.currentInstanceId?
                        <ToggleButton isOn={!isReadMode} onToggle={this.handleEdit} offToggle={this.handleCancel} onGlyph="pencil" offGlyph="eye-open" onTitle="edit" offTitle="cancel edition" />
                        :
                        null
                      }
                    </span>
                  </Col>
                </Row>
              </div>
              <div className={classes.panelSummary}>
                {(instance.data && instance.data.ui_info && instance.data.ui_info.summary)?
                  instance.data.ui_info.summary.map(key => {
                    const name = key.replace(/\//g, "%nexus-slash%");
                    return instance.data.fields[name]?<Field key={name} name={name} readModeRendering={this.renderReadModeField}/>:null;
                  })
                  :
                  null
                }
              </div>
              <Panel className={classes.panelBody} expanded={this.props.id === this.props.instanceStore.currentInstanceId || !isReadMode} onToggle={() => {}}>
                <Panel.Collapse>
                  <Panel.Body>
                    {Object.keys(instance.data.fields)
                      .filter(name => {
                        const key = name.replace(/%nexus-slash%/g, "/");
                        return instance.data && instance.data.ui_info && instance.data.ui_info.summary && !instance.data.ui_info.summary.includes(key);
                      })
                      .map(name => <Field key={name} name={name}/>)
                    }
                  </Panel.Body>
                </Panel.Collapse>
              </Panel>
              <div className={classes.panelFooter}>
                {isReadMode || this.props.id !== this.props.instanceStore.currentInstanceId?
                  <Row>
                    <Col xs={12}>
                      <div className={classes.id}>Nexus ID: {instance.data.fields.id.value.nexus_id}</div>
                    </Col>
                  </Row>
                  :
                  <Row>
                    <Col xs={12} md={8}>
                      <div className={classes.id}>Nexus ID: {instance.data.fields.id.value.nexus_id}</div>
                    </Col>
                    <Col xs={6} md={2} className={classes.action}>
                      <Button bsStyle={"default"} onClick={this.handleCancel}>Cancel</Button>
                    </Col>
                    <Col xs={6} md={2} className={classes.action}>
                      <Button disabled={!instance.hasChanged} bsStyle={"success"} onClick={this.handleSave}>Save</Button>
                    </Col>
                  </Row>
                }
              </div>
            </Form>
          </div>
          :
          <div className={classes.fetchingPanel} active={level===0?"true":"false"}>
            <span className={classes.fetchingGlyphicon}></span>
            <span className={classes.fetchingLabel}>Fetching instance...</span>
            <small>Nexus ID: {this.props.id}</small>
          </div>
        :
        (this.props.id === this.props.instanceStore.mainInstanceId)?
          <div className={classes.fetchErrorPanel}>
            <h4>{instance.fetchError}</h4>
            <div>
              <Link to={backLink} className="btn btn-default">Cancel</Link>
              <Button bsStyle="primary" onClick={this.fetchInstance}>Retry</Button>
            </div>
          </div>
          :
          <div className={classes.inlineFetchErrorPanel}>
            <h5>{instance.fetchError}</h5>
            <small>Nexus ID: {this.props.id}</small>
            <div>
              <Button onClick={this.fetchInstance}><Glyphicon glyph="refresh" /><span>Retry</span></Button>
            </div>
          </div>
    );
  }
}