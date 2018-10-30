import React from "react";
import injectStyles from "react-jss";
import { observer } from "mobx-react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { ButtonGroup, Button } from "react-bootstrap";

import searchStore from "../../Stores/SearchStore";
import instanceStore from "../../Stores/InstanceStore";
import routerStore from "../../Stores/RouterStore";


const styles = {
  container:{
    padding:"5px 5px 5px 30px",
    borderLeft:"2px solid transparent",
    color:"var(--ft-color-normal)",
    cursor:"pointer",
    position:"relative",
    "&:hover":{
      background:"var(--list-bg-hover)",
      borderColor:"var(--list-border-hover)",
      color:"var(--ft-color-loud)",
      "& $actions":{
        opacity:0.75
      },
      "& $createInstance":{
        position:"absolute",
        top:"0",
        right:"0",
        height:"100%",
        padding:"5px 10px",
        display:"block",
        color:"var(--ft-color-normal)",
        "&:hover":{
          color:"var(--ft-color-loud)",
        }
      },
      "& $savingBookmark":{
        position:"absolute",
        top:"0",
        right:"0",
        height:"100%",
        padding:"5px 10px",
        display:"block",
        color:"var(--ft-color-normal)",
        "&:hover":{
          color:"var(--ft-color-loud)",
        }
      }
    },
    "&.selected":{
      background:"var(--list-bg-selected)",
      borderColor:"var(--list-border-selected)",
      color:"var(--ft-color-loud)"
    },
    "&.edited": {
      padding: "0 5px 0 30px"
    }
  },
  icon: {
    position: "absolute",
    top: "8px",
    "& + span": {
      display: "inline-block",
      marginLeft: "22px"
    }
  },
  bookmarkIcon: {
    color: "var(--favorite-on-color)",
    "& + span": {
      maxWidth: "190px"
    }
  },
  nodetypeIcon: {
    color:"var(--ft-color-normal)",
    transform: "rotate(90deg)",
    "& + span": {
      maxWidth: "205px"
    }
  },
  smartlistIcon: {
    color: "var(--favorite-on-color)"
  },
  editBookmark: {
    display: "flex",
    width: "calc(100% - 19px)",
    marginLeft: "19px",
    "& .btn-group": {
      marginLeft: "6px"
    }
  },
  editBookmarkName: {
    flex: "1",
    width:"calc(100% - 20px)",
    height: "30px",
    margin: 0,
    padding: "0 2px",
    border:"1px solid transparent",
    borderRadius: "2px",
    backgroundColor: "var(--bg-color-blend-contrast1)",
    color: "var(--ft-color-loud)",
    "&:focus":{
      borderColor: "rgba(64, 169, 243, 0.5)"
    }
  },
  cancelRenameButton: {
    marginLeft: "10px",
    padding: "2px 8px",
    backgroundColor: "#fff",
    borderRadius: "4px",
    color: "var(--bg-color-ui-contrast4)",
    "&:hover":{
      color:"var(--bg-color-ui-contrast1)"
    }
  },
  renameButton: {
    marginLeft: "10px",
    padding: "2px 8px",
    backgroundColor: "#337ab7",
    borderRadius: "4px",
    color:"var(--ft-color-loud)",
    "&:hover":{
      color:"var(--ft-color-louder)"
    }
  },
  createInstance:{
    display:"none",
    cursor:"pointer"
  },
  savingBookmark:{
    display:"none",
    cursor:"pointer"
  },
  actions:{
    position:"absolute",
    top:"2px",
    right:"10px",
    display:"grid",
    opacity:0,
    "&:hover":{
      opacity:"1 !important"
    },
    "&.is-bookmark": {
      width:"50px",
      gridTemplateColumns:"repeat(2, 1fr)"
    },
    "&.is-nodetype": {
      width:"25px",
      gridTemplateColumns:"repeat(1, 1fr)"
    }
  },
  action:{
    fontSize:"0.9em",
    lineHeight:"27px",
    textAlign:"center",
    backgroundColor: "var(--bg-color-ui-contrast2)",
    color:"var(--ft-color-normal)",
    "&:hover":{
      color:"var(--ft-color-loud)"
    },
    "&:first-child":{
      borderRadius:"4px 0 0 4px"
    },
    "&:last-child":{
      borderRadius:"0 4px 4px 0"
    },
    "&:first-child:last-child":{
      borderRadius:"4px"
    }
  },
  deleteBookmarkDialog: {
    position: "absolute",
    top: 0,
    right: "-200px",
    transition: "right .2s ease",
    "&.show": {
      right: "5px"
    }
  }
};

@injectStyles(styles)
@observer
export default class List extends React.Component{
  constructor(props){
    super(props);
    this.editBookmarkNameRef = React.createRef();
    this.state = {showDeleteBookmarkDialog: false};
  }

  handleSelect(list){
    if (!searchStore.isBookmarksListEdited(this.props.list.id) && !this.state.showDeleteBookmarkDialog) {
      searchStore.selectList(list);
    }
  }
  handelCancelActions() {
    this.setState({ showDeleteBookmarkDialog: false });
  }

  handleEditBookmark(event) {
    event.stopPropagation();
    searchStore.editBookmarksList(this.props.list.id);
  }

  handleCancelEditBookmark(event) {
    event && event.stopPropagation();
    searchStore.cancelEditBookmarksList(this.props.list.id);
  }

  handleRenameBookmark(event) {
    event && event.stopPropagation();
    searchStore.renameBookmark(this.props.list.id, this.editBookmarkNameRef.current.value.trim());
  }

  handleBookmarkNameKeyUp(event) {
    event.stopPropagation();
    if (event.keyCode === 27) {
      this.handleCancelEditBookmark();
    } else if (event.keyCode === 13) {
      this.handleRenameBookmark();
    }
  }

  handleConfirmDeleteBookmark(event) {
    event.stopPropagation();
    this.setState({ showDeleteBookmarkDialog: true });
  }

  async handleDeleteBookmark(event) {
    event.stopPropagation();
    this.setState({ showDeleteBookmarkDialog: false });
    searchStore.deleteBookmark(this.props.list.id);
  }

  async handleCreateInstance(path, event){
    event.stopPropagation();
    let newInstanceId = await instanceStore.createNewInstance(path);
    routerStore.history.push(`/instance/edit/${newInstanceId}`);
  }

  render(){
    const {classes, list} = this.props;
    const selected = searchStore.selectedList === list;
    const edited = searchStore.isBookmarksListEdited(list.id);
    if (list.type === "bookmark") {
      return (
        <div key={list.id} className={`${classes.container} ${selected?"selected":""} ${edited?"edited":""}`} onClick={this.handleSelect.bind(this, list)} onMouseLeave={this.handelCancelActions.bind(this)} >
          <React.Fragment>
            <FontAwesomeIcon icon={"star"} className={`${classes.icon} ${classes.bookmarkIcon}`} />
            {edited?
              <div className={classes.editBookmark}>
                <input type="text" className={`form-control ${classes.editBookmarkName}`} defaultValue={list.name} autoFocus={true} onKeyUp={this.handleBookmarkNameKeyUp.bind(this)} ref={this.editBookmarkNameRef}/>
                <ButtonGroup>
                  <Button bsStyle="primary" bsSize="small" onClick={this.handleRenameBookmark.bind(this)} title="confirm rename"><FontAwesomeIcon icon="check"/></Button>
                  <Button bsSize="small" onClick={this.handleCancelEditBookmark.bind(this)} title="cancel rename"><FontAwesomeIcon icon="undo"/></Button>
                </ButtonGroup>
              </div>
              :
              <React.Fragment>
                <span>{list.name}</span>
                {searchStore.isSavingBookmark?
                  <div className={classes.savingBookmark}>
                    <FontAwesomeIcon icon={"circle-notch"} spin/>
                  </div>
                  :
                  <React.Fragment>
                    <div className={`${classes.actions} is-bookmark`}>
                      <div className={classes.action} onClick={this.handleEditBookmark.bind(this)} title="rename">
                        <FontAwesomeIcon icon="pencil-alt"/>
                      </div>
                      <div className={classes.action} onClick={this.handleConfirmDeleteBookmark.bind(this)} title="delete">
                        <FontAwesomeIcon icon="trash-alt"/>
                      </div>
                    </div>
                    <div className={`${classes.deleteBookmarkDialog} ${this.state.showDeleteBookmarkDialog?"show":""}`}>
                      <Button bsStyle="danger" bsSize="small" onClick={this.handleDeleteBookmark.bind(this)}><FontAwesomeIcon icon="trash-alt"/>&nbsp;Delete</Button>
                    </div>
                  </React.Fragment>
                }
              </React.Fragment>
            }
          </React.Fragment>
        </div>
      );
    } else if (list.type === "nodetype") {
      return (
        <div key={list.id} className={`${classes.container} ${selected?"selected":""}`} onClick={this.handleSelect.bind(this, list)} title={list.relatedNodeType}>
          <React.Fragment>
            <FontAwesomeIcon icon={"code-branch"} className={`${classes.icon} ${classes.nodetypeIcon}`} />
            <span>{list.name}</span>
            {instanceStore.isCreatingNewInstance?
              <div className={classes.createInstance}>
                <FontAwesomeIcon icon={"circle-notch"} spin/>
              </div>
              :
              <div className={`${classes.actions} is-nodetype`}>
                <div className={classes.action} onClick={this.handleCreateInstance.bind(this, list.relatedNodeType)} title={`create a new ${list.name}`}>
                  <FontAwesomeIcon icon={"plus"}/>
                </div>
              </div>
            }
          </React.Fragment>
        </div>
      );
    } else  { // smartlist
      return (
        <div key={list.id} className={`${classes.container} ${selected?"selected":""}`} onClick={this.handleSelect.bind(this, list)} title={list.relatedNodeType}>
          <FontAwesomeIcon icon={"lightbulb"} className={`${classes.icon} ${classes.smartlistIcon}`} />
          <span>{list.name}</span>
        </div>
      );
    }
  }
}