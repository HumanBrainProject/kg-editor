import React from "react";
import injectStyles from "react-jss";
import { observer, inject } from "mobx-react";
import { Panel, Row, Col, Button, Glyphicon } from "react-bootstrap";
import { uniqueId } from "lodash";
import { Form, Field } from "hbp-spark";
import { Link } from "react-router-dom";
import ToggleButton from "./ToggleButton";

const fetchAnimationId = uniqueId("animationId");
const saveAnimationId = uniqueId("animationId");

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
  savingContainer: {
    position: "absolute",
    top: "0",
    left: "0",
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0,0,0,0.25)",
    borderRadius: "9px",
    zIndex: "1200",
  },
  savingPanel: {
    display: "inline-block",
    position: "absolute",
    top: "50%",
    left: "50%",
    minWidth: "240px",
    transform: "translate(-50%, -50%)",
    fontSize: "18px",
    fontWeight: "lighter",
    background: "white",
    padding: "20px",
    borderRadius: "5px",
    boxShadow: "2px 2px 4px #7f7a7a",
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
  savingGlyphicon: {
    composes: "glyphicon glyphicon-record",
    color: "red",
    animation: `${saveAnimationId} 1.4s infinite linear`
  },
  [`@keyframes ${saveAnimationId}`]: {
    "0%": {
      transform: "scale(1)"
    },
    "50%": {
      transform: "scale(0.1)"
    },
    "100%": {
      transform: "scale(1)"
    }
  },
  savingLabel: {
    paddingLeft: "6px"
  },
  saveErrorContainer: {
    position: "absolute",
    top: "0",
    left: "0",
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0,0,0,0.25)",
    borderRadius: "9px",
    zIndex: "1200",
  },
  saveErrorPanel: {
    position: "absolute",
    top: "50%",
    left: "50%",
    minWidth: "220px",
    transform: "translate(-50%, -50%)",
    padding: "10px",
    borderRadius: "5px",
    background: "white",
    textAlign: "center",
    boxShadow: "2px 2px 4px #7f7a7a",
    "& h4": {
      margin: "0",
      paddingBottom: "10px",
      color: "red"
    },
    "& button + button, & a + button, & a + a": {
      marginLeft: "20px"
    }
  },
  confirmCancelContainer: {
    position: "absolute",
    top: "0",
    left: "0",
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0,0,0,0.25)",
    borderRadius: "9px",
    zIndex: "1200",
  },
  confirmCancelPanel: {
    position: "absolute",
    top: "50%",
    left: "50%",
    minWidth: "220px",
    transform: "translate(-50%, -50%)",
    padding: "10px",
    borderRadius: "5px",
    background: "white",
    textAlign: "center",
    boxShadow: "2px 2px 4px #7f7a7a",
    "& h4": {
      margin: "0",
      paddingBottom: "10px",
      color: "#333"
    },
    "& button, & a.btn": {
      minWidth: "80px"
    },
    "& button + button, & a + button, & a + a": {
      marginLeft: "20px"
    }
  },
  panel: {
    position: "relative",
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
      borderColor: "#666",
      backgroundColor: "white",
      boxShadow: "2px 2px 4px #a5a1a1"
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
    "&:not(.current).readMode[highlight='true'], & button.value-tag.spark-value-tag:hover, & button.value-tag.spark-value-tag:focus, & .spark-field-dropdown-select .spark-readmode-item button:hover, & .spark-field-dropdown-select .spark-readmode-item button:focus": {
      backgroundColor: "#a5c7e9",
      borderColor: "#337ab7",
      color: "#143048"
    },
    "& .hightlightArrow": {
      display: "none",
      position: "absolute",
      top: "50%",
      left: "-26px",
      color: "transparent",
      fontSize: "xx-large",
      transform: "translateY(-50%) scale(0.5,0.8)"
    },
    "&:not(.current).readMode .hightlightArrow": {
      display: "inline",
      position: "absolute",
      top: "50%",
      left: "-26px",
      color: "transparent",
      fontSize: "xx-large",
      transform: "translateY(-50%) scale(0.5,0.8)",
      transition: "color 0.25s ease-in-out",
    },
    "&:not(.current).readMode[highlight='true'] .hightlightArrow": {
      color: "#337ab7"
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
    "&.main $confirmCancelContainer": {
      top: "-10px",
      left: "-10px",
      width: "calc(100% + 20px)",
      height: "calc(100% + 20px)",
    },
    "&.main $saveErrorContainer": {
      top: "-10px",
      left: "-10px",
      width: "calc(100% + 20px)",
      height: "calc(100% + 20px)",
    },
    "&.main $savingContainer": {
      top: "-10px",
      left: "-10px",
      width: "calc(100% + 20px)",
      height: "calc(100% + 20px)"
    },
    "&.readMode .spark-empty-field": {
      display: "none"
    },
    "& .spark-field-input-text.spark-readmode, & .spark-field-dropdown-select.spark-readmode": {
      marginBottom: "5px"
    },
    "& .spark-field-input-text.spark-readmode label.spark-label, & .spark-field-dropdown-select.spark-readmode label.spark-label": {
      marginBottom: "0"
    },
    "& .spark-field-disabled.spark-empty-field, .spark-field-readonly.spark-empty-field": {
      display: "none"
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
    animation: `${fetchAnimationId} .7s infinite linear`
  },
  [`@keyframes ${fetchAnimationId}`]: {
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
@inject("paneStore")
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

  handleCancelEdit = () => {
    const instance = this.props.instanceStore.getInstance(this.props.id);
    if (instance.hasChanged) {
      this.props.instanceStore.cancelInstanceChanges(this.props.id);
    } else {
      this.handleConfirmCancelEdit();
    }
  }

  handleConfirmCancelEdit = () => {
    this.props.instanceStore.toggleReadMode(this.props.id, this.props.level, true);
    const instance = this.props.instanceStore.getInstance(this.props.id);
    if (instance.hasChanged) {
      this.props.instanceStore.confirmCancelInstanceChanges(this.props.id);
    }
  }

  handleContinueEditing = () => {
    this.props.instanceStore.abortCancelInstanceChange(this.props.id);
  }

  handleSave = () => {
    this.props.instanceStore.toggleReadMode(this.props.id, this.props.level, true);
    this.props.instanceStore.saveInstance(this.props.id);
  }

  handleCancelSave = () => {
    this.props.instanceStore.cancelSaveInstance(this.props.id);
    this.props.instanceStore.toggleReadMode(this.props.id, this.props.level, false);
  }

  handleFieldFocus = (field, value) => {
    if (field && field.type === "DropdownSelect" && value && value.id) {
      this.handleToggleOffFieldHighlight(field, value);
      setTimeout(() => {
        this.props.instanceStore.setCurrentInstanceId(value.id, this.props.level + 1);
        const target = document.querySelector(`[data-property="${field.label}"] [data-id="${value.id}"]`);
        if (target) {
          target.scrollIntoViewIfNeeded();
        }
        this.props.paneStore.selectNextPane();
      });
    }
  }

  handleToggleOnFieldHighlight = (field, value) => {
    if (field && field.type === "DropdownSelect" && value && value.id) {
      const target = document.querySelector(`[data-property="${field.label}"] [data-id="${value.id}"]`);
      if (target) {
        target.scrollIntoViewIfNeeded();
        target.setAttribute("highlight", "true");
      }
    }
  }

  handleToggleOffFieldHighlight = (field, value) => {
    if (field && field.type === "DropdownSelect" && value && value.id) {
      const target = document.querySelector(`[data-property="${field.label}"] [data-id="${value.id}"]`);
      if (target) {
        target.removeAttribute("highlight");
      }
    }
  }

  fetchInstance = () => {
    this.props.instanceStore.fetchInstanceData(this.props.id);
  }

  renderReadModeField = (field) => {
    if (field) {
      if (field.type === "TextArea") {
        if (this.props.id !== this.props.instanceStore.currentInstanceId && this.props.level !== 0) {
          if (field.value && field.value.length && field.value.length >= 200) {
            return field.value.substr(0,197) + "...";
          }
          return field.value;
        }
        return field.value;
      } else if (field.type === "DropdownSelect") {
        return <span className="spark-readmode-list">
          {field.value.map(value =>
            <span key={value.id} className="spark-readmode-item">
              <button className="btn btn-xs btn-default"  onClick={(event) => {event.preventDefault(); this.handleFieldFocus(field, value);}} onFocus={(event) => {event.preventDefault(); this.handleToggleOnFieldHighlight(field, value);}} onMouseEnter={(event) => {event.preventDefault(); this.handleToggleOnFieldHighlight(field, value);}} onBlur={(event) => {event.preventDefault(); this.handleToggleOffFieldHighlight(field, value);}} onMouseLeave={(event) => {event.preventDefault(); this.handleToggleOffFieldHighlight(field, value);}}>{value.label}</button>
            </span>)
          }
        </span>;
      }
      return field.value;
    }
    return field.value;
  }

  render(){
    const { classes, level } = this.props;
    const instance = this.props.instanceStore.getInstance(this.props.id);

    const isReadMode = !instance.isFetched || (instance.form && instance.form.readMode);

    const [organization, domain, schema, version,] = this.props.id.split("/");

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
            className={panelClassName}
            data-id={this.props.id}>
            <Form store={instance.form}>
              <div className={classes.panelHeader}>
                <Row>
                  <Col xs={10}>
                    <h6>{nodeType}</h6>
                  </Col>
                  <Col xs={2} >
                    <span className="pull-right">
                      {!instance.isNew && this.props.id === this.props.instanceStore.currentInstanceId && !instance.isSaving && !instance.hasSaveError && !instance.confirmCancel?
                        <ToggleButton isOn={!isReadMode} onToggle={this.handleEdit} offToggle={this.handleCancelEdit} onGlyph="pencil" offGlyph="eye-open" onTitle="edit" offTitle="cancel edition" />
                        :
                        null
                      }
                    </span>
                  </Col>
                </Row>
              </div>
              <div className={classes.panelSummary}>
                {(instance.data && instance.data.ui_info && instance.data.ui_info.summary)?
                  instance.data.ui_info.summary.map(key => key.replace(/\//g, "%nexus-slash%")).map(name => {
                    const field = instance.data.fields[name];
                    if (field) {
                      if (field.type === "TextArea")  {
                        return <Field key={name} name={name} readModeRendering={this.renderReadModeField}/>;
                      }
                      if (field.type === "DropdownSelect" && field.isLink) {
                        return <Field key={name} name={name} onValueClick={this.handleFieldFocus} onValueFocus={this.handleToggleOnFieldHighlight} onValueMouseEnter={this.handleToggleOnFieldHighlight} onValueBlur={this.handleToggleOffFieldHighlight} onValueMouseLeave={this.handleToggleOffFieldHighlight} readModeRendering={this.renderReadModeField}/>;
                      }
                      return <Field key={name} name={name} />;
                    }
                    return null;
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
                      .map(name => {
                        const field = instance.data.fields[name];
                        if (field.type === "DropdownSelect" && field.isLink) {
                          return <Field key={name} name={name} onValueClick={this.handleFieldFocus} onValueFocus={this.handleToggleOnFieldHighlight} onValueMouseEnter={this.handleToggleOnFieldHighlight} onValueBlur={this.handleToggleOffFieldHighlight} onValueMouseLeave={this.handleToggleOffFieldHighlight} readModeRendering={this.renderReadModeField}/>;
                        }
                        return <Field key={name} name={name} />;
                      })
                    }
                  </Panel.Body>
                </Panel.Collapse>
              </Panel>
              <div className={classes.panelFooter}>
                {isReadMode || this.props.id !== this.props.instanceStore.currentInstanceId || instance.isSaving || instance.hasSaveError || instance.confirmCancel?
                  <Row>
                    <Col xs={12}>
                      <div className={classes.id}>Nexus ID: {instance.data.fields.id?instance.data.fields.id.value.nexus_id:"<new>"}</div>
                    </Col>
                  </Row>
                  :
                  <Row>
                    <Col xs={12} md={8}>
                      <div className={classes.id}>Nexus ID: {instance.data.fields.id?instance.data.fields.id.value.nexus_id:"<new>"}</div>
                    </Col>
                    <Col xs={6} md={2} className={classes.action}>
                      {!instance.isNew || instance.hasChanged?
                        <Button bsStyle="default" onClick={this.handleCancelEdit}>Cancel</Button>
                        :
                        <Link to={backLink} className="btn btn-default">Cancel</Link>
                      }
                    </Col>
                    <Col xs={6} md={2} className={classes.action}>
                      <Button disabled={!instance.hasChanged} bsStyle={"success"} onClick={this.handleSave}>Save</Button>
                    </Col>
                  </Row>
                }
              </div>
            </Form>
            <Glyphicon glyph="arrow-right" className="hightlightArrow" />
            {instance.isSaving &&
                <div className={classes.savingContainer} >
                  <div className={classes.savingPanel} >
                    <span className={classes.savingGlyphicon}></span>
                    <span className={classes.savingLabel}>Saving instance...</span>
                    <small>Nexus ID: {this.props.id}</small>
                  </div>
                </div>
            }
            {instance.hasSaveError &&
                <div className={classes.saveErrorContainer} >
                  <div className={classes.saveErrorPanel}>
                    <h4>{instance.saveError}</h4>
                    <div>
                      <Button bsStyle="default" onClick={this.handleCancelSave}>Cancel</Button>
                      <Button bsStyle="primary" onClick={this.handleSave}>Retry</Button>
                    </div>
                  </div>
                </div>
            }
            {instance.confirmCancel &&
              <div className={classes.confirmCancelContainer} >
                <div className={classes.confirmCancelPanel}>
                  <h4>There are some unsaved changes. {instance.isNew?"Are you sure you want to cancel the creation of this instance?":"Are you sure you want to cancel the changes of this instance?"}</h4>
                  <div>
                    {!instance.isNew || this.props.id !== this.props.instanceStore.mainInstanceId?
                      <Button bsStyle="default" onClick={this.handleConfirmCancelEdit}>Yes</Button>
                      :
                      <Link to={backLink} className="btn btn-default">Yes</Link>
                    }
                    <Button bsStyle="danger" onClick={this.handleContinueEditing}>No</Button>
                  </div>
                </div>
              </div>
            }
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