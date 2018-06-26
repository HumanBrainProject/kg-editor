import React from "react";
import injectStyles from "react-jss";
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
export default class Menu extends React.Component{
  constructor(props){
    super(props);
  }

  render(){
    const {classes} =  this.props;

    const [view, organization, domain, schema, version, id] = (window.rootPath?location.pathname.substr(window.rootPath.length):location.pathname).replace(/\/(.*)\/?$/, "$1").split("/");
    return (
      <div className={classes.container}>
        <Navbar fluid={true} >
          <Nav>
            {view !== ""?
              <LinkContainer to={"/"}>
                <NavItem eventKey={1}><Glyphicon glyph="home" /></NavItem>
              </LinkContainer>
              :
              null
            }
            {schema?
              <LinkContainer to={"/search"}>
                <NavItem eventKey={2}><Glyphicon glyph="chevron-left" />Search</NavItem>
              </LinkContainer>
              :
              null
            }
            {id?
              <LinkContainer to={`/nodetype/${organization}/${domain}/${schema}/${version}`}>
                <NavItem eventKey={3}><Glyphicon glyph="chevron-left" />{schema}</NavItem>
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
            </NavDropdown>
          </Nav>
        </Navbar>
      </div>
    );
  }
}
