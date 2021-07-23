/*
 * Copyright 2018 - 2021 Swiss Federal Institute of Technology Lausanne (EPFL)
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0.
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * This open source software code was developed in part or in whole in the
 * Human Brain Project, funded from the European Union's Horizon 2020
 * Framework Programme for Research and Innovation under
 * Specific Grant Agreements No. 720270, No. 785907, and No. 945539
 * (Human Brain Project SGA1, SGA2 and SGA3).
 *
 */

import React from "react";
import { observer } from "mobx-react";
import injectStyles from "react-jss";
import { Overlay, Popover, Button } from "react-bootstrap";
import {uniqueId} from "lodash";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { CopyToClipboard } from "react-copy-to-clipboard";

import authStore from "../Stores/AuthStore";
import instanceStore from "../Stores/InstanceStore";

import Avatar from "../Components/Avatar";

let styles = {
  container: {
    position: "relative",
    display: "inline-block"
  },
  button: {
    position: "relative",
    width: "100%",
    margin: 0,
    padding: 0,
    border: 0,
    backgroundColor: "transparent",
    textAlign: "center",
    outline: 0,
    cursor:"pointer"
  },
  popOver: {
    maxWidth: "unset !important",
    margin: "0 !important",
    padding: "0 !important",
    transform: "translate(-5px, 5px)",
    background: "var(--list-bg-hover)",
    border: "1px solid var(--border-color-ui-contrast1)",
    borderRadius: 0,
    "& .arrow": {
      display: "none !important"
    },
    "& .popover-content": {
      padding: "0 !important"
    }
  },
  popOverContent: {
    display: "grid",
    gridTemplateRows: "1fr",
    gridTemplateColumns: "auto 1fr",
    gridGap: "20px",
    margin: "15px",
    color:"var(--ft-color-normal)"
  },
  popOverFooterBar: {
    display: "grid",
    gridTemplateRows: "1fr",
    gridTemplateColumns: "auto auto",
    gridGap: "20px",
    width: "100%",
    padding: "8px 15px",
    borderTop: "1px solid var(--border-color-ui-contrast1)",
    background: "var(--bg-color-blend-contrast1)",
    wordBreak: "keep-all",
    whiteSpace: "nowrap",
    "& > div": {
      textAlign: "left",
      "& + div": {
        textAlign: "right"
      }
    },
    "& button": {
      borderRadius: "2px"
    }
  },
  name: {
    color:"var(--ft-color-loud)"
  },
  email: {

  },
  accountBtn: {
    borderRadius: "2px",
    marginTop: "25px"
  },
  tokenCopiedBar: {
    width: "100%",
    height: 0,
    background: "var(--list-bg-hover)",
    overflow: "hidden",
    transition: "height .3s ease-in-out",
    "&.show": {
      height: "48px",
      "& $tokenCopied": {
        transform: "translateY(0)",
      }
    }
  },
  tokenCopied: {
    margin: "8px 15px",
    padding: "6px 0",
    color: "var(--release-color-highlight)",
    transition: "transform .3s ease-in-out",
    transform: "translateY(-48px)"
  }
};

const windowHeight = () => {
  const w = window,
    d = document,
    e = d.documentElement,
    g = d.getElementsByTagName("body")[0];
  return w.innerHeight || e.clientHeight || g.clientHeight;
  //return $(window).height();
};

class PopOverContent extends React.Component {
  constructor(props){
    super(props);
    this.ref = React.createRef();
  }
  componentDidMount() {
    this.handleSizeChange();
  }
  componentDidUpdate() {
    this.handleSizeChange();
  }
  handleSizeChange() {
    if (this.ref.current) {
      typeof this.props.onSizeChange === "function" && this.props.onSizeChange(this.ref.current.getBoundingClientRect());
    }
  }
  render() {
    return (
      <div ref={this.ref}>
        {this.props.children}
      </div>
    );
  }
}

@injectStyles(styles)
@observer
export default class UserProfileTab extends React.Component{
  constructor(props){
    super(props);
    this.state = { showPopOver: false, popOverPosition: "bottom", tokenCopied: null };
    this.popOverId = uniqueId("popover");
    this.buttonRef = React.createRef();
  }

  componentWillUnmount() {
    if (this.state.showPopOver) {
      this.handlePopOverClose();
    }
  }

  handlePopOverPosition = popOverRect => {
    if (!popOverRect) { return null; }
    const buttonRect = this.buttonRef.current.getBoundingClientRect();
    const position = (buttonRect.bottom + popOverRect.height + 5) >= windowHeight()?"top":"bottom";
    if (this.state.popOverPosition !== position) {
      this.setState({popOverPosition: position});
    }
  }

  handleButtonClick(event) {
    event.stopPropagation();
    this.setState(state => ({showPopOver: !state.showPopOver }));
  }

  handlePopOverClose = event => {
    event && event.stopPropagation();
    this.setState({showPopOver: false });
  }

  handleCopyToken = () => {
    clearTimeout(this.state.tokenCopied);
    const timer = setTimeout(() => this.setState({tokenCopied:null}), 2000);
    this.setState({tokenCopied: timer});
  }

  handleLogout = () => {
    if (!instanceStore.hasUnsavedChanges || confirm("You have unsaved changes pending. Are you sure you want to logout?")) {
      instanceStore.flushOpenedTabs();
      authStore.logout();
      document.querySelector("#root").style.display = "none";
    }
  }

  render(){
    if (!authStore.isAuthenticated || !authStore.hasUserProfile || !authStore.user) {
      return null;
    }
    const { classes, className, size=30 } = this.props;

    return(
      <div className={`${classes.container} ${className?className:""}`}>
        <button className={classes.button} onClick={this.handleButtonClick.bind(this)} title="Account" ref={this.buttonRef}>
          <Avatar userId={authStore.user.username} name={authStore.user.name} picture={authStore.user.picture} size={size} />
        </button>
        <Overlay
          show={this.state.showPopOver}
          target={this.buttonRef.current}
          placement={this.state.popOverPosition}
          outOfBoundaries={false}
          container={document.body}
          rootClose={true}
          onHide={this.handlePopOverClose}
        >
          <Popover id={this.popOverId} className={classes.popOver}>
            <PopOverContent onSizeChange={this.handlePopOverPosition.bind(this)}>
              <div className={classes.popOverContent}>
                <Avatar userId={authStore.user.username} name={authStore.user.name} picture={authStore.user.picture} size={100} />
                <div>
                  <div className={classes.name}>{authStore.user.name}</div>
                  <div className={classes.email}>{authStore.user.email}</div>
                  <Button bsStyle="primary" className={classes.accountBtn} href="https://iam.ebrains.eu/auth/realms/hbp/account/" title="https://iam.ebrains.eu/auth/realms/hbp/account/" rel="noopener noreferrer" target="_blank">Account</Button>
                </div>
              </div>
              <div className={classes.popOverFooterBar}>
                <div>
                  <CopyToClipboard text={authStore.accessToken} onCopy={this.handleCopyToken}>
                    <Button>Copy token to clipboard</Button>
                  </CopyToClipboard>
                </div>
                <div>
                  <Button onClick={this.handleLogout}>Logout</Button>
                </div>
              </div>
              <div className={`${classes.tokenCopiedBar} ${this.state.tokenCopied?"show":""}`}>
                <div className={classes.tokenCopied}><FontAwesomeIcon icon={"check"} />&nbsp;Token copied to clipboard!</div>
              </div>
            </PopOverContent>
          </Popover>
        </Overlay>
      </div>
    );
  }
}