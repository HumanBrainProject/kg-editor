import React from "react";
import injectStyles from "react-jss";
import { observer, inject } from "mobx-react";
import { Button } from "react-bootstrap";
import { Link } from "react-router-dom";
import NodeTypeStore from "../Stores/NodeTypeStore";

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
    "& h3 strong": {
      textTransform: "capitalize",
      fontWeight: "500"
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
      "@media screen and (min-width:1024px)": {
        gridTemplateColumns: "repeat(2, 1fr)",
      },
      "@media screen and (min-width:1400px)": {
        gridTemplateColumns: "repeat(3, 1fr)",
      },
      "@media screen and (min-width:1800px)": {
        gridTemplateColumns: "repeat(4, 1fr)",
      },
      "@media screen and (min-width:2400px)": {
        gridTemplateColumns: "repeat(5, 1fr)",
      },
      "@media screen and (min-width:2700px)": {
        gridTemplateColumns: "repeat(6, 1fr)",
      },
      "@media screen and (min-width:3092px)": {
        gridTemplateColumns: "repeat(7, 1fr)",
      }
    },
    "& li": {
      display: "inline-block",
      margin: "0"
    },
    "& li > a": {
      display: "inline-block",
      position: "relative",
      width: "100%",
      padding: "10px",
      border: "1px solid #ccc",
      backgroundColor: "#fff",
      color: "#333",
      textAlign: "left",
      transition: "backgroundColor .2s ease-in, borderColor .2s ease-in",
      "@media screen and (min-width:576px)": {
        padding: "10px 10px 40px 10px",
      },
      "@media screen and (min-width:1024px)": {
        padding: "20px 20px 40px 20px",
        minHeight: "350px"
      }
    },
    "& li > a:hover, & li > a:focus": {
      backgroundColor: "#eff5fb",
      borderColor: "#337ab7",
      color: "#337ab7",
      textDecoration: "none"
    },
    "& li > a h6": {
      marginTop: "0",
      textTransform: "capitalize",
      fontWeight: "bold"
    },
    "& li > a h4": {
      marginBottom: "30px",
      color: "#337ab7",
      fontSize: "20px"
    },
    "& li > a label": {
      display: "block",
      color: "#333",
      fontSize: "12px",
      fontWeight: "bold"
    },
    "& li > a span": {
      color: "#333",
      fontSize: "14px"
    },
    "& li > a small": {
      display: "inline-block",
      marginTop: "10px",
      bottom: "10px",
      left: "10px",
      color: "grey",
      fontSize: "0.7em",
      fontWeight: "300",
      "@media screen and (min-width:576px)": {
        position: "absolute"
      }
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
    },
    "& button + button, & a + button, & a + a": {
      marginLeft: "20px"
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
    },
    "& button + button, & a + button, & a + a": {
      marginLeft: "20px"
    }
  }
};

@injectStyles(styles)
@inject("navigationStore")
@observer
export default class NodeType extends React.Component {
  constructor(props){
    super(props);
    this.nodeTypeStore = new NodeTypeStore(this.props.match.params.id);
    this.props.navigationStore.setNodeTypeStore(this.nodeTypeStore);
  }
  fetchInstances = () => {
    this.nodeTypeStore.fetchInstances();
  }
  handleFilterChange = event => {
    this.nodeTypeStore.filterInstances(event.target.value);
  }
  handleClose = () => {
    this.nodeTypeStore.clearNodeType();
  }
  componentDidUpdate = () => {
    this.nameInput && this.nameInput.focus();
  }
  componentDidMount = () => {
    this.nameInput && this.nameInput.focus();
  }
  componentWillUnmount() {
    this.props.navigationStore.setNodeTypeStore(null);
  }

  render = () => {
    const {classes} = this.props;
    return(
      <div className={classes.container}>
        {!this.nodeTypeStore.hasError?
          !this.nodeTypeStore.isFetching?
            this.nodeTypeStore.instances.length?
              <React.Fragment>
                <div className={classes.header}>
                  <div>
                    <h3><strong>{this.nodeTypeStore.nodeTypeLabel}</strong> selection:</h3>
                  </div>
                  <form className="navbar-form" role="search">
                    <div className="input-group">
                      <input ref={(input) => { this.nameInput = input; }} className="form-control" placeholder="Search" name="filter-term" id="filter-term" type="text" value={this.nodeTypeStore.instanceFilter} onChange={this.handleFilterChange}/>
                    </div>
                  </form>
                </div>
                <div className={classes.body}>
                  {this.nodeTypeStore.filteredInstances.length?
                    <ul>
                      {this.nodeTypeStore.filteredInstances.map(instance => (
                        <li key={instance.id}>
                          <Link to={ `/instance/${instance.id}` }>
                            <h6>{this.nodeTypeStore.nodeTypeLabel}</h6>
                            <h4>{instance.label}</h4>
                            {instance.description?
                              <React.Fragment>
                                <label>Description:</label>
                                <span title={instance.description}>{instance.description.length > 400?instance.description.substring(0,397) + "...":instance.description}</span>
                              </React.Fragment>
                              :null
                            }
                            <small>Nexus ID: {instance.id}</small>
                          </Link>
                        </li>
                      ))}
                    </ul>
                    :
                    <div className={classes.noFilterResult}>No instances matches your search. Please refine it.</div>
                  }
                </div>
              </React.Fragment>
              :
              <div className={classes.noResultPanel}>
                <h4>No instance of type &quot;{this.nodeTypeStore.nodeTypeId}&quot; available.</h4>
                <div>
                  <Link to={"/search"} className="btn btn-default">Cancel</Link>
                  <Button bsStyle="primary" onClick={this.fetchInstances}>Retry</Button>
                </div>
              </div>
            :
            <div className={classes.fetchingPanel}>
              <span className={classes.fetchingGlyphicon}></span>
              <span className={classes.fetchingLabel}>Fetching instances...</span>
            </div>
          :
          <div className={classes.fetchErrorPanel}>
            <h4>{this.nodeTypeStore.error}</h4>
            <div>
              <Link to={"/search"} className="btn btn-default">Cancel</Link>
              <Button bsStyle="primary" onClick={this.fetchInstances}>Retry</Button>
            </div>
          </div>
        }
      </div>
    );
  }
}