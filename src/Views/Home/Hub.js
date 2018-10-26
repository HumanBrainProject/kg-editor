import React from "react";
import injectStyles from "react-jss";
import {observer} from "mobx-react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Modal } from "react-bootstrap";

import routerStore from "../../Stores/RouterStore";
import searchStore from "../../Stores/SearchStore";
import instanceStore from "../../Stores/InstanceStore";
import FetchingLoader from "../../Components/FetchingLoader";
import ThemeSwitcher from "./ThemeSwitcher";

const styles = {
  container:{
  },
  action:{
    textAlign:"center",
    padding:"10px",
    borderBottom:"1px solid var(--border-color-ui-contrast1)",
    color:"var(--ft-color-normal)",
    cursor:"pointer",
    "&:hover":{
      color:"var(--ft-color-loud)"
    }
  },
  actionIcon:{
    fontSize:"3em"
  },
  actionText:{
    fontSize:"0.9em",
    textTransform:"uppercase",
    fontWeight:"bold"
  },
  newInstances:{
    display:"grid",
    gridTemplateColumns:"repeat(4, 1fr)",
    textAlign:"center",
    gridGap:"10px"
  },
  newInstance:{
    fontSize:"1.1em",
    fontWeight:"300",
    lineHeight:"3em",
    border:"1px solid #ccc",
    cursor:"pointer",
    "&:hover":{
      background:"#f3f3f3"
    }
  },
  overlay:{
    position:"absolute",
    top:0,
    left:0,
    width:"100%",
    height:"100%",
    background:"rgba(255,255,255,0.75)"
  }
};

@injectStyles(styles)
@observer
export default class Hub extends React.Component{
  constructor(props){
    super(props);
    this.state = {
      showCreateModal:false
    };
  }

  handleCreateInstance = () => {
    if(!searchStore.isFetched.lists && !searchStore.isFetching.list){
      searchStore.fetchLists();
    }
    this.setState({showCreateModal: true});
  }

  handleHideCreateModal = () => {
    this.setState({showCreateModal: false});
  }

  async handleClickNewInstanceOfType(path){
    let newInstanceId = await instanceStore.createNewInstance(path);
    routerStore.history.push(`/instance/edit/${newInstanceId}`);
  }

  render(){
    const { classes } = this.props;
    return(
      <div className={`${classes.container} widget`}>
        <div className={classes.action} onClick={()=>routerStore.history.push("/search")}>
          <div className={classes.actionIcon}>
            <FontAwesomeIcon icon={"search"}/>
          </div>
          <div className={classes.actionText}>
            Search instances
          </div>
        </div>


        <div className={classes.action} onClick={this.handleCreateInstance}>
          <div className={classes.actionIcon}>
            <FontAwesomeIcon icon={searchStore.isFetching.lists?"circle-notch":"file"} spin={searchStore.isFetching.lists}/>
          </div>
          <div className={classes.actionText}>
            New instance
          </div>
        </div>

        <div className={classes.action} onClick={()=>routerStore.history.push("/kg-stats")}>
          <div className={classes.actionIcon}>
            <FontAwesomeIcon icon={"chart-bar"}/>
          </div>
          <div className={classes.actionText}>
            KG Statistics
          </div>
        </div>

        <div className={classes.action} onClick={()=>routerStore.history.push("/help")}>
          <div className={classes.actionIcon}>
            <FontAwesomeIcon icon={"question-circle"}/>
          </div>
          <div className={classes.actionText}>
            Help
          </div>
        </div>

        <div className={classes.action}>
          <ThemeSwitcher/>
        </div>

        {this.state.showCreateModal && searchStore.allLists && !searchStore.isFetching.lists &&
          <Modal show={true} onHide={this.handleHideCreateModal}>
            <Modal.Header closeButton>
              New Instance
            </Modal.Header>
            <Modal.Body>
              <div className={classes.newInstances}>
                {searchStore.allLists.map(list => {
                  return(
                    <div key={list.path} className={classes.newInstance} onClick={this.handleClickNewInstanceOfType.bind(this, list.path)}>
                      {list.label}
                    </div>
                  );
                })}
                <div>
                  {instanceStore.isCreatingNewInstance && <div className={classes.overlay}></div>}
                  {instanceStore.isCreatingNewInstance && <FetchingLoader>Creating new instance...</FetchingLoader>}
                </div>
              </div>
            </Modal.Body>
          </Modal>
        }
      </div>
    );
  }
}