import React from "react";
import injectStyles from "react-jss";
import { observer } from "mobx-react";
import structureStore from "../../Stores/StructureStore";
import TypesSpace from "./TypesSpace";
import browseStore from "../../Stores/BrowseStore";

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
  constructor(props) {
    super(props);
    this.state = {
      showBookmarks: true
    };
  }

  handleToggleType = () => this.setState((state) => ({ showBookmarks: !state.showBookmarks }));

  render() {
    const list = structureStore.filteredList(browseStore.navigationFilter);
    return (
      list.map(space =><TypesSpace key={space.label} space={space} />)
    );
  }
}