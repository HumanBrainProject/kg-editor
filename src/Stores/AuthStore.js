import console from "../Services/Logger";
import { observable, computed, action } from "mobx";

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
let redirectUri = `${window.location.protocol}//${window.location.host}${rootPath}/home`;
let stateKey = btoa(redirectUri);
let sessionTimer = null;

class AuthStore {
  @observable session = null;

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
  get isAuthenticated() {
    return !this.hasExpired;
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
      console.log("session is expiring...");
      this.logout();
    }, this.session.expiryTimestamp -(new Date()).getTime());
  }

  logout() {
    console.log("logout");
    clearTimeout(sessionTimer);
    this.session = null;
    if (typeof Storage !== "undefined" ) {
      localStorage.removeItem(oidLocalStorageKey);
    }
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
  tryAuthenticate() {
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

      console.log ("retrieved oid from url: ", this.session);
      localStorage.setItem(oidLocalStorageKey, JSON.stringify(this.session));

      const uri = atob(state);
      console.log ("retrieved stateKey: ", uri);
    } else {
      const oidStoredState = JSON.parse(localStorage.getItem(oidLocalStorageKey));
      console.log ("retrieved oid from localStorage: ", oidStoredState);

      if (oidStoredState && oidStoredState.expiryTimestamp && new Date() < oidStoredState.expiryTimestamp) {
        this.session = oidStoredState;
        this.startSessionTimer();
      } else {
        this.logout();
      }

    }
    return this.session? this.session.accessToken: null;
  }
}
export default new AuthStore();