import React from "react";
import injectStyles from "react-jss";
import { observer, inject } from "mobx-react";
import { Navbar, Nav, NavItem, NavDropdown, MenuItem, Glyphicon } from "react-bootstrap";
import { LinkContainer } from "react-router-bootstrap";

const styles = {
  container: {
    "& > nav": {
      "@media screen and (max-width:750px)": {
        margin: "0",
        border: "0",
        backgroundColor: "transparent",
      }
    },
    "& > nav > .container-fluid ": {
      "@media screen and (max-width:750px)": {
        margin: "0",
        padding: "0"
      }
    },
    "& > nav > .container-fluid": {
      "@media screen and (min-width:750px)": {
        padding: "0"
      }
    },
    "& > nav > .container-fluid > ul": {
      "@media screen and (max-width:750px)": {
        margin: "0"
      }
    },
    "& > nav > .container-fluid > ul > li": {
      "@media screen and (max-width:750px)": {
        display: "none"
      }
    },
    "& > nav > .container-fluid > ul > li[class^='dropdown']": {
      "@media screen and (max-width:750px)": {
        display: "block"
      }
    },
    "& > nav > .container-fluid > ul > li > a": {
      textTransform: "capitalize",
      textAlign: "right",
      color: "white",
      "@media screen and (min-width:750px)": {
        textAlign: "left",
        color: "#777",
        borderRadius: "5px"
      }
    },
    "& > nav > .container-fluid > ul > li[class^='dropdown'] > a.dropdown-toggle": {
      "@media screen and (max-width:750px)": {
        padding: "0"
      }
    },
    "& > nav > .container-fluid > ul > li > a:focus, & > nav > .container-fluid > ul > li > a:hover": {
      "@media screen and (max-width:750px)": {
        color: "white"
      }
    },
    "& > nav > .container-fluid > ul > li[class^='dropdown'] > a > div": {
      "@media screen and (max-width:750px)": {
        position: "absolute",
        top: "-50px",
        right: "10px",
        color: "white"
      }
    },
    "& > nav > .container-fluid > ul > li[class^='dropdown'] > ul": {
      "@media screen and (max-width:750px)": {
        backgroundColor: "white",
        border: "1px solid gray",
        boxShadow: "2px 2px 4px#cbc9c9"
      }
    }
  }
};

@injectStyles(styles)
@inject("navigationStore")
@observer
export default class Menu extends React.Component{
  constructor(props){
    super(props);
  }

  selectHandler = (eventKey) => {

    let env = "";
    if (/.+-dev\.[^.]+\.[a-zA-Z\-_]{2,3}/.test(location.host) || /localhost/.test(location.host)) {
      env = "-dev";
    } else if (/.+-int\.[^.]+\.[a-zA-Z\-_]{2,3}/.test(location.host)) {
      env = "-int";
    }
    switch (eventKey) {
    case 4.2:
      location.href = "mailto:kg-team@humanbrainproject.eu";
      break;
    case 4.3:
      window.open(`https://nexus-admin${env}.humanbrainproject.org`);
      break;
    case 4.4:
      window.open(`https://kg${env}.humanbrainproject.org/webapp/`);
      break;
    }
  }

  render(){
    const {classes, navigationStore} =  this.props;

    return (
      <div className={classes.container}>
        <Navbar fluid={true} onSelect={this.selectHandler}	>
          <Nav>
            {navigationStore.showHomeLink?
              <LinkContainer to={"/"} exact={true}>
                <NavItem eventKey={1}><Glyphicon glyph="home" /></NavItem>
              </LinkContainer>
              :
              null
            }
            {navigationStore.showSearchLink?
              <LinkContainer to={"/search"}>
                <NavItem eventKey={2}><Glyphicon glyph="chevron-left" />Search</NavItem>
              </LinkContainer>
              :
              null
            }
            {navigationStore.showNodeTypeLink?
              <LinkContainer to={`/nodetype/${navigationStore.nodeTypeId}`}>
                <NavItem eventKey={3}><Glyphicon glyph="chevron-left" />{navigationStore.nodeTypeLabel}</NavItem>
              </LinkContainer>
              :
              null
            }
            <NavDropdown
              eventKey={4}
              title={
                <div style={{ display: "inline-block" }}>
                  <Glyphicon glyph="menu-hamburger" />
                </div>
              }
              id="basic-nav-dropdown"
              noCaret={true}
              pullRight={true}
            >
              <LinkContainer to={"/help"}>
                <MenuItem eventKey={4.1}>Help</MenuItem>
              </LinkContainer>
              <MenuItem eventKey={4.2}>Contact</MenuItem>
              <MenuItem eventKey={4.3}>Statistics</MenuItem>
              <MenuItem eventKey={4.4}>Search</MenuItem>
            </NavDropdown>
          </Nav>
        </Navbar>
      </div>
    );
  }
}
