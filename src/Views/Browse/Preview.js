import React from "react";
import { observer } from "mobx-react";
import injectStyles from "react-jss";
import { Form, Field } from "hbp-quickfire";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Button } from "react-bootstrap";
import { Scrollbars } from "react-custom-scrollbars";

import browseStore from "../../Stores/BrowseStore";
import instanceStore from "../../Stores/InstanceStore";
import routerStore from "../../Stores/RouterStore";

import FetchingLoader from "../../Components/FetchingLoader";
import BGMessage from "../../Components/BGMessage";
import Status from "../Instance/Status";
import BookmarkStatus from "../Instance/BookmarkStatus";
import RenderMarkdownField from "../../Components/Markdown";

const styles = {
  container:{
    padding:"10px"
  },
  content: {
    "& .popover-popup": {
      display: "none !important"
    },
    "&:hover .popover-popup": {
      display: "block !important"
    }
  },
  actions:{
    display:"grid",
    gridTemplateColumns:"repeat(5, 1fr)",
    gridGap:"10px",
    marginBottom:"20px"
  },
  action:{
    height:"34px",
    cursor:"pointer",
    overflow:"hidden",
    lineHeight:"34px",
    textAlign:"center",
    borderRadius:"2px",
    backgroundColor: "var(--bg-color-blend-contrast1)",
    color:"var(--ft-color-normal)",
    "&:hover":{
      color:"var(--ft-color-loud)"
    }
  },
  status:{
    position:"absolute",
    top:"65px",
    right:"25px",
    fontSize:"25px"
  },
  bookmarkStatus: {
    marginRight: "5px",
    fontSize: "1em"
  },
  titlePanel:{
    width:"calc(100% - 70px)"
  },
  title:{
    fontSize:"1.5em",
    fontWeight:"300"
  },
  metadataTitle: {
    display: "inline-block",
    marginBottom: "10px"
  },
  id:{
    fontSize:"0.75em",
    color:"var(--ft-color-normal)",
    marginTop:"20px",
    marginBottom:"20px"
  },
  field:{
    marginBottom:"10px",
    wordBreak:"break-word"
  },
  duplicate:{
    extend:"action"
  }
};

@injectStyles(styles)
@observer
export default class Preview extends React.Component{
  constructor(props){
    super(props);
    instanceStore.setReadMode(true);
  }

  handleOpenInstance(mode, event){
    if(event.metaKey || event.ctrlKey){
      instanceStore.openInstance(browseStore.selectedInstance.id, mode);
    } else {
      routerStore.history.push(`/instance/${mode}/${browseStore.selectedInstance.id}`);
    }
  }

  handleRetry = () => {
    instanceStore.fetchInstanceData(browseStore.selectedInstance.id);
  }

  markdownDescriptionRendering = field => <RenderMarkdownField value={field.getValue()}/>

  render(){
    const { classes } = this.props;
    let selectedInstance = instanceStore.getInstance(browseStore.selectedInstance.id);

    const promotedFields = selectedInstance.promotedFields;
    const promotedFieldsWithMarkdown = selectedInstance.promotedFieldsWithMarkdown;
    const nonPromotedFields = selectedInstance.nonPromotedFields;
    const metadata = selectedInstance.metadata;

    return(
      <Scrollbars autoHide>
        <div className={classes.container}>
          {selectedInstance.isFetching?
            <FetchingLoader>
              <span>Fetching instance information...</span>
            </FetchingLoader>
            :!selectedInstance.hasFetchError?
              <div className={classes.content}>
                <div className={classes.actions}>
                  <div className={classes.action} onClick={this.handleOpenInstance.bind(this, "view")}>
                    <FontAwesomeIcon icon="eye"/>&nbsp;&nbsp;Open
                  </div>
                  <div className={classes.action} onClick={this.handleOpenInstance.bind(this, "edit")}>
                    <FontAwesomeIcon icon="pencil-alt"/>&nbsp;&nbsp;Edit
                  </div>
                  <div className={classes.action} onClick={this.handleOpenInstance.bind(this, "invite")}>
                    <FontAwesomeIcon icon="user-edit"/>&nbsp;&nbsp;Invite
                  </div>
                  <div className={classes.action} onClick={this.handleOpenInstance.bind(this, "graph")}>
                    <FontAwesomeIcon icon="project-diagram"/>&nbsp;&nbsp;Explore
                  </div>
                  <div className={classes.action} onClick={this.handleOpenInstance.bind(this, "release")}>
                    <FontAwesomeIcon icon="cloud-upload-alt"/>&nbsp;&nbsp;Release
                  </div>
                  <div className={classes.action} onClick={this.handleOpenInstance.bind(this, "manage")}>
                    <FontAwesomeIcon icon="cog"/>&nbsp;&nbsp;Manage
                  </div>
                </div>
                <div className={classes.titlePanel}>
                  <BookmarkStatus id={browseStore.selectedInstance.id} className={classes.bookmarkStatus} />
                  <span className={classes.title}>
                    {browseStore.selectedInstance.name}
                  </span>
                </div>
                <div className={classes.id}>
                  Nexus ID: {browseStore.selectedInstance.id}
                </div>
                <Form store={selectedInstance.form} key={browseStore.selectedInstance.id}>
                  {promotedFields.map(fieldKey => {
                    return(
                      <div key={browseStore.selectedInstanceId+fieldKey} className={classes.field}>
                        {promotedFieldsWithMarkdown.includes(fieldKey) ?
                          <Field name={fieldKey} readModeRendering={this.markdownDescriptionRendering}/>:
                          <Field name={fieldKey}/>
                        }
                      </div>
                    );
                  })}
                  {nonPromotedFields.map(fieldKey => {
                    return(
                      <div key={browseStore.selectedInstance.id+fieldKey} className={classes.field}>
                        <Field name={fieldKey}/>
                      </div>
                    );
                  })}
                  {metadata.length > 0 ?
                    <div className={classes.content}>
                      <hr />
                      <span className={`${classes.title} ${classes.metadataTitle}`}> Metadata </span>
                      {metadata.map(field =>
                        <div key={browseStore.selectedInstance.id+field.label} className={classes.field}>
                          <label>{field.label}: </label> {field.value}
                        </div>
                      )}
                    </div>:null}
                  <div className={`${classes.status}`}>
                    <div className={"release-status"}>
                      <Status darkmode={true} id={browseStore.selectedInstance.id} />
                    </div>
                  </div>
                </Form>
              </div>
              :
              <BGMessage icon={"ban"}>
                There was a network problem fetching the instance.<br/>
                If the problem persists, please contact the support.<br/>
                <small>{selectedInstance.fetchError}</small><br/><br/>
                <Button bsStyle={"primary"} onClick={this.handleRetry}>
                  <FontAwesomeIcon icon={"redo-alt"}/> &nbsp; Retry
                </Button>
              </BGMessage>
          }
        </div>
      </Scrollbars>
    );
  }
}
