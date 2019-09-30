import React from "react";
import injectStyles from "react-jss";
import { observer } from "mobx-react";
import { Button } from "react-bootstrap";
import TypesStore from "../../Stores/TypesStore";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import browseStore from "../../Stores/BrowseStore";
import FetchingLoader from "../../Components/FetchingLoader";
import TypesItem from "./TypesItem";

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
      showTypes: true
    };
  }

  handleLoadRetry = () => TypesStore.fetch();
  handleToggleType = () => this.setState((state) => ({ showTypes: !state.showTypes }));

  render() {
    const { classes } = this.props;
    const list = TypesStore.filteredList(browseStore.navigationFilter);
    return (
      !TypesStore.fetchError ?
        !TypesStore.isFetching ?
          list.length ?
            (<div className={classes.folder}>
              <div className={classes.folderName} onClick={this.handleToggleType}>
                <FontAwesomeIcon fixedWidth icon={this.state.showTypes ? "caret-down" : "caret-right"} /> &nbsp;
                Types
              </div>
              {this.state.showTypes && list.map(type => <TypesItem key={type.label} type={type} />)}
            </div>) : null
          :
          <FetchingLoader>
            Fetching types
          </FetchingLoader>
        :
        <div className={classes.fetchErrorPanel}>
          <div>{TypesStore.fetchError}</div>
          <Button bsStyle="primary" onClick={this.handleLoadRetry}>Retry</Button>
        </div>
    );
  }
}