import React from "react";
import injectStyles from "react-jss";
import { Form, Field } from "hbp-spark";
import { observer, inject } from "mobx-react";
import { Row, Col, Button, Glyphicon } from "react-bootstrap";
import { Link } from "react-router-dom";

const generateRandomName = () => [...`${new Date().getTime()}`].reduce((r, c) => r + String.fromCharCode(65 + Number(c)), "");
const animationId = generateRandomName();

const styles = {
  id:{
    paddingBottom: "10px",
    color:"grey",
    fontWeight:"300",
    fontSize:"0.7em",
    wordBreak: "break-all"
  },
  writeMode: {
    "& textarea": {
      minHeight: "200px"
    }
  },
  readMode:{
    cursor:"pointer"
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
    "&[active=true]": {
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

  handleChange = () => {
    this.props.instanceStore.instanceHasChanged(this.props.id);
  }

  handleLoad = () => {
    this.props.instanceStore.memorizeInstanceInitialValues(this.props.id);
  }

  handleCancel = () => {
    this.props.instanceStore.cancelInstanceChanges(this.props.id);
  }

  handleSave = () => {
    this.props.instanceStore.saveInstance(this.props.id);
  }

  fetchInstance = () => {
    this.props.instanceStore.fetchInstanceData(this.props.id);
  }

  render(){
    const { classes, level } = this.props;
    const instance = this.props.instanceStore.getInstance(this.props.id);
    const isReadMode = !instance.isFetched || (instance.form && instance.form.readMode);
    return(
      (!instance.hasFetchError)?
        (!instance.isFetching)?
          <div
            onFocus={this.handleFocus}
            onClick={this.handleFocus}
            onChange={this.handleChange}
            onLoad={this.handleLoad}
            className={`${isReadMode?classes.readMode:classes.writeMode}`}>
            <Form store={instance.form}>
              {Object.keys(instance.data.fields).map(key => {
                return (
                  <Field key={key} name={key}/>
                );
              })}
              {!isReadMode &&
              <Row>
                <Col xs={12} md={8}>
                  <div className={classes.id}>Nexus ID: {instance.data.fields.id.value.nexus_id}</div>
                </Col>
                <Col xs={6} md={2} className={classes.action}>
                  {instance.hasChanged && <Button bsStyle={"default"} onClick={this.handleCancel}>Cancel</Button>}
                </Col>
                <Col xs={6} md={2} className={classes.action}>
                  <Button disabled={!instance.hasChanged} bsStyle={"success"} onClick={this.handleSave}>Save</Button>
                </Col>
              </Row>
              }
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
              <Link to={"/"} className="btn btn-default">Cancel</Link>
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