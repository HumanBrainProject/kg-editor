import React from "react";
import { observer } from "mobx-react";
import { Scrollbars } from "react-custom-scrollbars";
import injectStyles from "react-jss";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Button } from "react-bootstrap";

import typesStore from "../Stores/TypesStore";
import instanceStore from "../Stores/InstanceStore";
import routerStore from "../Stores/RouterStore";

import FetchingLoader from "../Components/FetchingLoader";
import BGMessage from "../Components/BGMessage";

const styles = {
  container: {
    position:"absolute",
    width:"50%",
    height:"calc(100% - 40px)",
    top:"20px",
    left:"25%",
    boxShadow: "0 2px 10px var(--pane-box-shadow)",
    background: "white",
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
    if (!typesStore.isFetched) {
      typesStore.fetch();
    }
  }

  handleFetchInstanceTypes = () => typesStore.fetch();

  handleClickNewInstanceOfType(type) {
    instanceStore.createNewInstance(type, this.props.id);
  }


  render() {
    const { classes, onCancel } = this.props;

    return (
      <div className={classes.container}>
        {typesStore.isFetching ?
          <FetchingLoader>Fetching data types...</FetchingLoader>
          :
          typesStore.fetchError ?
            <BGMessage icon={"ban"}>
              There was a network problem fetching data types.<br />
              If the problem persists, please contact the support.<br />
              <small>{typesStore.fetchError}</small><br /><br />
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
              <div className={classes.lists}>
                <div className={classes.list}>
                  {typesStore.types.map(type => (
                    <div key={type.label} className={classes.type} onClick={this.handleClickNewInstanceOfType.bind(this, type)}>
                      <div className={classes.icon} style={type.color ? { color: type.color } : {}}>
                        <FontAwesomeIcon fixedWidth icon="circle" />
                      </div>{type.label}
                    </div>
                  ))}
                </div>
              </div>
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