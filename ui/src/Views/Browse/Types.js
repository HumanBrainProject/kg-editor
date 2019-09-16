import React from "react";
import injectStyles from "react-jss";
import { observer } from "mobx-react";
import { Button } from "react-bootstrap";
import structureStore from "../../Stores/StructureStore";
import TypesSpace from "./TypesSpace";
import browseStore from "../../Stores/BrowseStore";
import FetchingLoader from "../../Components/FetchingLoader";

const styles = {
  folderName: {
    color: "var(--ft-color-quiet)",
    textTransform: "uppercase",
    fontWeight: "bold",
    fontSize: "0.9em",
    padding: "10px 10px 5px 10px",
    cursor: "pointer"
  },
  fetchErrorPanel: {
    textAlign: "center",
    fontSize: "0.9em",
    wordBreak: "break-all",
    padding: "40px 20px",
    "& .btn": {
      width: "100%",
      marginTop: "20px"
    },
    color: "var(--ft-color-error)"
  },
  noResultPanel: {
    extend: "fetchErrorPanel",
    color: "var(--ft-color-loud)"
  }
};

@injectStyles(styles)
@observer
export default class Types extends React.Component {
  render() {
    const {classes} = this.props;
    const list = structureStore.filteredList(browseStore.navigationFilter);
    return (
      !structureStore.fetchStuctureError ?
        !structureStore.isFetchingStructure ?
          list.map(space =><TypesSpace key={space.label} space={space} />)
          :
          <FetchingLoader>
            Fetching types
          </FetchingLoader>
        :
        <div className={classes.fetchErrorPanel}>
          <div>{structureStore.fetchStuctureError}</div>
          <Button bsStyle="primary" onClick={this.handleLoadRetry}>Retry</Button>
        </div>
    );
  }
}