/*
*   Copyright (c) 2020, EPFL/Human Brain Project PCO
*
*   Licensed under the Apache License, Version 2.0 (the "License");
*   you may not use this file except in compliance with the License.
*   You may obtain a copy of the License at
*
*       http://www.apache.org/licenses/LICENSE-2.0
*
*   Unless required by applicable law or agreed to in writing, software
*   distributed under the License is distributed on an "AS IS" BASIS,
*   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
*   See the License for the specific language governing permissions and
*   limitations under the License.
*/

import { observable, computed, action, runInAction } from "mobx";
import API from "../Services/API";

const oidConnectServerUri = "https://services.humanbrainproject.eu/oidc/authorize";
const oidClientId = "nexus-kg-search";
const oidLocalStorageKey = "hbp.kg-editor.oid";

const generateRandomKey = () => {
  let key = "";
  const chars = "ABCDEF0123456789";
  for (let i=0; i<4; i++) {
    if (key !== "") {
      key += "-";
    }
    for (let j=0; j<5; j++) {
      key += chars.charAt(Math.floor(Math.random() * chars.length));
    }
  }
  return key;
};

const getKey = (hash, key) => {
  if (typeof hash !== "string" || typeof key !== "string") {
    return null;
  }
  const patterns = [
    `^#${key}=([^&]+)&.+$`,
    `^.+&${key}=([^&]+)&.+$`,
    `^#${key}=([^&]+)$`,
    `^.+&${key}=([^&]+)$`
  ];
  let value = null;
  patterns.some(pattern => {
    const reg = new RegExp(pattern);
    const m = hash.match(reg);
    if (m && m.length === 2) {
      value = m[1];
      return true;
    }
    return false;
  });
  return value;
};

let rootPath = window.rootPath || "";
let redirectUri = `${window.location.protocol}//${window.location.host}${rootPath}/loginSuccess`;
let stateKey = btoa(redirectUri);
let sessionTimer = null;

class AuthStore {
  @observable session = null;
  @observable user = null;
  @observable isRetrievingUserProfile = false;
  @observable userProfileError = false;
  reloginResolve = null;
  reloginPromise = new Promise((resolve)=>{this.reloginResolve = resolve;});
  expiredToken = false;

  constructor(){
    if(Storage === undefined){
      throw "The browser must support WebStorage API";
    }

    window.addEventListener("storage", (e) => {
      if(e.key !== oidLocalStorageKey){
        return;
      }
      this.tryAuthenticate();
    });
  }

  @computed
  get accessToken() {
    return this.hasExpired? null: this.session.accessToken;
  }

  @computed
  get isOIDCAuthenticated() {
    return !this.hasExpired;
  }

  @computed
  get hasUserProfile() {
    return !!this.user;
  }

  @computed
  get isFullyAuthenticated() {
    return this.isOIDCAuthenticated && this.hasUserProfile;
  }

  get hasExpired() {
    return this.session === null || (new Date() - this.session.expiryTimestamp) > 0;
  }

  get loginUrl() {
    const nonceKey = generateRandomKey();
    const url = `${oidConnectServerUri}?response_type=id_token%20token&client_id=${oidClientId}&redirect_uri=${escape(redirectUri)}&scope=openid%20profile&state=${stateKey}&nonce=${nonceKey}`;
    return url;
  }

  startSessionTimer() {
    if (this.hasExpired) {
      return;
    }
    clearTimeout(sessionTimer);
    sessionTimer = setTimeout(() => {
      // console.log("session is expiring...");
      this.logout();
    }, this.session.expiryTimestamp -(new Date()).getTime());
  }

  @action
  logout() {
    // console.log("logout");
    clearTimeout(sessionTimer);
    this.session = null;
    this.expiredToken = true;
    this.user = null;
    if (typeof Storage !== "undefined" ) {
      localStorage.removeItem(oidLocalStorageKey);
    }
    return this.reloginPromise;
  }

  listenForLogin(){
    window.addEventListener("message", this.loginSuccessHandler);
  }

  @action
  loginSuccessHandler(e){
    if(e.data === "LOGIN_SUCCESS"){
      this.tryAuthenticate();
    }
    window.removeEventListener("message", this.loginSuccessHandler);
  }

  @action
  async retriveUserProfile() {
    if (!this.hasExpired && !this.user) {
      this.userProfileError = false;
      this.isRetrievingUserProfile = true;
      try {
        /* Uncomment to test error handling
        if ((Math.floor(Math.random() * 10) % 2) === 0) {
          throw "Error 501";
        }
        */
        const { data } = await API.axios.get(API.endpoints.user());
        runInAction(() => {
          this.user = data && data.data;
          this.isRetrievingUserProfile = false;
          this.reloginResolve();
          this.reloginPromise = new Promise((resolve)=>{this.reloginResolve = resolve;});
        });
      } catch (e) {
        runInAction(() => {
          this.userProfileError = e.message?e.message:e;
          this.isRetrievingUserProfile = false;
        });
      }
    }
  }

  @action
  async tryAuthenticate() {
    const hash = window.location.hash;
    const accessToken = getKey(hash, "access_token");
    const state = getKey(hash, "state");
    const expiresIn = getKey(hash, "expires_in");

    if (accessToken && state && expiresIn) {
      this.session = {
        accessToken: accessToken,
        expiryTimestamp: new Date().getTime() + 1000 * (Number(expiresIn) - 60)
      };
      this.startSessionTimer();

      // console.log ("retrieved oid from url: ", this.session);
      localStorage.setItem(oidLocalStorageKey, JSON.stringify(this.session));

      // const uri = atob(state);
      // console.log ("retrieved stateKey: ", uri);
    } else {
      const oidStoredState = JSON.parse(localStorage.getItem(oidLocalStorageKey));
      // console.log ("retrieved oid from localStorage: ", oidStoredState);

      if (oidStoredState && oidStoredState.expiryTimestamp && new Date() < oidStoredState.expiryTimestamp) {
        this.session = oidStoredState;
        this.startSessionTimer();
      } else if(this.session){
        this.logout();
      }

    }

    this.retriveUserProfile();

    return this.session? this.session.accessToken: null;
  }
}
export default new AuthStore();