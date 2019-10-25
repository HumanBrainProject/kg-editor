import React from "react";
import injectStyles from "react-jss";
import { observer } from "mobx-react";
import { Button } from "react-bootstrap";
import typesStore from "../../Stores/TypesStore";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import browseStore from "../../Stores/BrowseStore";
import FetchingLoader from "../../Components/FetchingLoader";
import TypesItem from "./TypesItem";

const styles = {
  folder: {
    "& .fetchingPanel": {
      position: "unset !important",
      top: "unset",
      left: "unset",
      transform: "unset",
      width: "auto",
      margin: "0 33px",
      padding: "3px 6px",
      borderRadius: "3px",
      background: "rgba(255,255,255, 0.05)",
      color: "var(--ft-color-quiet)",
      fontSize: "1em",
      textAlign: "left"
    }
  },
  folderName: {
    color: "var(--ft-color-quiet)",
    textTransform: "uppercase",
    fontWeight: "bold",
    fontSize: "0.9em",
    padding: "10px 10px 5px 10px",
    cursor: "pointer"
  },
  fetchErrorPanel: {
    margin: "0 34px",
    padding: "3px",
    borderRadius: "4px",
    backgroundColor: "rgba(255,255,255,0.05)",
    textAlign: "center",
    fontSize: "0.9em",
    wordBreak: "break-all",
    "& .btn": {
      width: "100px",
      margin: "10px 6px 6px 6px"
    },
    color: "var(--ft-color-error)"
  }
};

@injectStyles(styles)
@observer
export default class Types extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showTypes: true
    };
  }

  componentDidMount() {
    typesStore.fetch();
  }

  handleLoadRetry = () => typesStore.fetch();

  handleToggleType = () => this.setState((state) => ({ showTypes: !state.showTypes }));

  render() {
    const { classes } = this.props;
    const list = typesStore.filteredList(browseStore.navigationFilter);
    if (!typesStore.fetchError && !typesStore.isFetching && !list.length) {
      return null;
    }
    return (
      <div className={classes.folder}>
        <div className={classes.folderName} onClick={this.handleToggleType}>
          <FontAwesomeIcon fixedWidth icon={this.state.showTypes ? "caret-down" : "caret-right"} /> &nbsp;Types
        </div>
        {!typesStore.fetchError ?
          !typesStore.isFetching ?
            this.state.showTypes && list.map(type =>
              <TypesItem key={type.label} type={type}/>
            )
            :
            <FetchingLoader>fetching...</FetchingLoader>
          :
          <div className={classes.fetchErrorPanel}>
            <div>{typesStore.fetchError}</div>
            <Button bsStyle="primary" onClick={this.handleLoadRetry}>Retry</Button>
          </div>
        }
      </div>
    );
  }
}