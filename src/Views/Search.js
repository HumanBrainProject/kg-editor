import React from "react";
import injectStyles from "react-jss";
import { observer } from "mobx-react";
import { Button } from "react-bootstrap";
import { Link } from "react-router-dom";
import SearchStore from "../Stores/SearchStore";

const generateRandomName = () => [...`${new Date().getTime()}`].reduce((r, c) => r + String.fromCharCode(65 + Number(c)), "");

const animationId = generateRandomName();

const styles = {
  container: {
    position: "absolute",
    top: "80px",
    width: "100vw",
    height: "calc(100vh - 80px)",
    backgroundColor: "white",
    "@media screen and (min-width:576px)": {
      left: "50%",
      width: "calc(100vw - 40px)",
      height: "calc(100vh - 100px)",
      padding: "20px",
      borderRadius: "10px",
      transform: "translateX(-50%)",
    }
  },
  header: {
    padding: "20px 20px 0 20px",
    "@media screen and (min-width:576px)": {
      padding: "0",
    },
    "& h3": {
      color: "#333",
      marginTop: 0
    },
    "& form[role='search']": {
      margin: "8px 0",
      padding: "0",
      "@media screen and (min-width:576px)": {
        padding: "0",
      }
    },
    "& form[role='search'] .input-group": {
      width: "100%"
    }
  },
  body: {
    width: "100%",
    height: "calc(100% - 92px)",
    border: "0",
    "@media screen and (min-width:576px)": {
      height: "calc(100% - 70px)",
      border: "1px solid #ccc",
    },
    "& ul": {
      listStyleType: "none",
      display: "grid",
      gridTemplateColumns: "1fr",
      columnGap: "20px",
      rowGap: "20px",
      position: "relative",
      maxHeight: "100%",
      margin: 0,
      padding: "20px",
      overflowY: "auto",
      "@media screen and (min-width:576px)": {
        gridTemplateColumns: "repeat(2, 1fr)",
      },
      "@media screen and (min-width:1024px)": {
        gridTemplateColumns: "repeat(3, 1fr)",
      },
      "@media screen and (min-width:1400px)": {
        gridTemplateColumns: "repeat(4, 1fr)",
      },
      "@media screen and (min-width:1600px)": {
        gridTemplateColumns: "repeat(5, 1fr)",
      },
      "@media screen and (min-width:2048px)": {
        gridTemplateColumns: "repeat(6, 1fr)",
      },
      "@media screen and (min-width:2400px)": {
        gridTemplateColumns: "repeat(7, 1fr)",
      },
      "@media screen and (min-width:2700px)": {
        gridTemplateColumns: "repeat(8, 1fr)",
      },
      "@media screen and (min-width:3092px)": {
        gridTemplateColumns: "repeat(9, 1fr)",
      }
    },
    "& li": {
      display: "inline-block",
      margin: "0"
    },
    "& li > a": {
      display: "inline-block",
      width: "100%",
      padding: "20px 10px",
      border: "1px solid #ccc",
      backgroundColor: "#fff",
      color: "#337ab7",
      fontSize: "20px",
      transition: "backgroundColor .2s ease-in, borderColor .2s ease-in",
      textAlign: "center",
      verticalAlign: "middle",
      "@media screen and (min-width:576px)": {
        padding: "20px"
      }
    },
    "& li > a:hover, & li > a:focus": {
      backgroundColor: "#eff5fb",
      borderColor: "#337ab7",
      color: "#337ab7",
      textDecoration: "none"
    },
    "& li > a h3": {
      marginTop: "10px"
    }
  },
  noResultPanel: {
    position: "absolute",
    top: "50%",
    left: "50%",
    padding: "20px",
    border: "1px solid gray",
    borderRadius: "5px",
    backgroundColor: "white",
    transform: "translate(-50%, -50%)",
    textAlign: "center",
    minWidth: "220px",
    "& h4": {
      paddingBottom: "10px"
    }
  },
  noFilterResult: {
    padding: "20px"
  },
  fetchingPanel: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    fontSize: "18px",
    fontWeight: "lighter",
    minWidth: "220px"
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
    backgroundColor: "white",
    transform: "translate(-50%, -50%)",
    textAlign: "center",
    minWidth: "220px",
    "& h4": {
      paddingBottom: "10px",
      color: "red"
    }
  }
};

@injectStyles(styles)
@observer
export default class Search extends React.Component{
  constructor(props){
    super(props);
    this.searchStore = new SearchStore();
  }
  fetchNodesTypes = () => {
    this.searchStore.fetchNodeTypes();
  }
  handleFilterChange = event => {
    this.searchStore.filterNodeTypes(event.target.value);
  }
  componentDidUpdate = () => {
    this.nameInput && this.nameInput.focus();
  }
  componentDidMount = () => {
    this.nameInput && this.nameInput.focus();
  }
  render = () => {
    const {classes} = this.props;
    return(
      <div className={classes.container}>
        {!this.searchStore.hasError?
          !this.searchStore.isFetching?
            this.searchStore.nodeTypes.length?
              <React.Fragment>
                <div className={classes.header}>
                  <h3>Node type selection:</h3>
                  <form className="navbar-form" role="search">
                    <div className="input-group">
                      <input ref={(input) => { this.nameInput = input; }} className="form-control" placeholder="Search" name="filter-term" id="filter-term" type="text" value={this.searchStore.nodeTypesFilter} onChange={this.handleFilterChange}/>
                    </div>
                  </form>
                </div>
                <div className={classes.body}>
                  {this.searchStore.filteredNodeTypes.length?
                    <ul>
                      {this.searchStore.filteredNodeTypes.map(nodeType => {
                        const [organisation, domain, schema, version] = nodeType.path.split("/");
                        return (
                          <li key={nodeType.path}>
                            <Link to={ `/nodetype/${nodeType.path}` }>
                              <h6>{organisation + "/" + domain}</h6>
                              <h3>{nodeType.label?nodeType.label:schema}</h3>
                              <h5>{version}</h5>
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                    :
                    <div className={classes.noFilterResult}>No node type matches your search. Please refine it.</div>
                  }
                </div>
              </React.Fragment>
              :
              <div className={classes.noResultPanel}>
                <h4>No node types available. Please retry in a moment.</h4>
                <Button bsStyle="primary" onClick={this.fetchNodesTypes}>Retry</Button>
              </div>
            :
            <div className={classes.fetchingPanel}>
              <span className={classes.fetchingGlyphicon}></span>
              <span className={classes.fetchingLabel}>Fetching node types...</span>
            </div>
          :
          <div className={classes.fetchErrorPanel}>
            <h4>{this.searchStore.error}</h4>
            <Button bsStyle="primary" onClick={this.fetchNodesTypes}>Retry</Button>
          </div>
        }
      </div>
    );
  }
}