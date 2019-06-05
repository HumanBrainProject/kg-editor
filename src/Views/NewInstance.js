import React from "react";
import { observer } from "mobx-react";
import { Scrollbars } from "react-custom-scrollbars";
import injectStyles from "react-jss";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Button } from "react-bootstrap";

import dataTypesStore from "../Stores/DataTypesStore";
import browseStore from "../Stores/BrowseStore";
import instanceStore from "../Stores/InstanceStore";
import routerStore from "../Stores/RouterStore";

import FetchingLoader from "../Components/FetchingLoader";
import BGMessage from "../Components/BGMessage";

const styles = {
  container: {
    height: "100%",
    "& > div": {
      height: "100%"
    },
    "& button": {
      margin: "0 10px"
    }
  },
  lists: {
    padding: "15px"
  },
  list: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gridGap: "10px"
  },
  type: {
    display: "grid",
    gridTemplateColumns: "auto 1fr",
    gridGap: "8px",
    position: "relative",
    padding: "10px",
    fontSize: "1.1em",
    fontWeight: "300",
    border: "1px solid #ccc",
    cursor: "pointer",
    wordBreak: "break-word",
    "&:hover": {
      background: "#f3f3f3"
    }
  },
  icon: {
    alignSelf: "center"
  }
};

@injectStyles(styles)
@observer
export default class NewInstance extends React.Component {
  componentDidMount() {
    if (!browseStore.isFetched.lists && !browseStore.isFetching.lists) {
      browseStore.fetchLists();
    }
  }

  handleFetchInstanceTypes = () => {
    browseStore.fetchLists();
  }

  async handleClickNewInstanceOfType(path) {
    let newInstanceId = await instanceStore.createNewInstance(path);
    instanceStore.toggleShowCreateModal();
    routerStore.history.push(`/instance/edit/${newInstanceId}`);
  }

  render() {
    const { classes, onCancel } = this.props;

    return (
      <div className={classes.container}>
        {browseStore.isFetching.lists ?
          <FetchingLoader>Fetching data types...</FetchingLoader>
          :
          browseStore.fetchError.lists ?
            <BGMessage icon={"ban"}>
              There was a network problem fetching data types.<br />
              If the problem persists, please contact the support.<br />
              <small>{browseStore.fetchError.lists}</small><br /><br />
              <div>
                {typeof onCancel === "function" && (
                  <Button onClick={onCancel}>
                    <FontAwesomeIcon icon={"times"} />&nbsp;&nbsp; Close
                  </Button>
                )}
                <Button bsStyle={"primary"} onClick={this.handleFetchInstanceTypes}>
                  <FontAwesomeIcon icon={"redo-alt"} />&nbsp;&nbsp; Retry
                </Button>
              </div>
            </BGMessage>
            :
            <Scrollbars autoHide>
              {browseStore.lists.map(folder => folder.folderType === "NODETYPE" && (
                <div className={classes.lists} key={folder.folderName}>
                  <h4>{folder.folderName}</h4>
                  <div className={classes.list}>
                    {folder.lists.map(list => {
                      const color = dataTypesStore.colorPalletteBySchema(list.id);
                      return (
                        <div key={list.id} className={classes.type} onClick={this.handleClickNewInstanceOfType.bind(this, list.id)}>
                          <div className={classes.icon} style={color ? { color: color } : {}}>
                            <FontAwesomeIcon fixedWidth icon="circle" />
                          </div>{list.name}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </Scrollbars>
        }
        {instanceStore.isCreatingNewInstance ?
          <div>
            {<div className={classes.overlay}></div>}
            {<FetchingLoader>Creating new instance...</FetchingLoader>}
          </div>:null}
      </div>
    );
  }
}