// import console from "../Services/Logger";
import { observable, computed, action, runInAction } from "mobx";
import API from "../Services/API";

const authLocalStorageKey = "hbp.kg-editor.auth";
const stateLocalStorageKey = "hbp.kg-editor.state";

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

const userKeys = {
  id: "@id",
  username: "http://schema.org/alternateName",
  email: "http://schema.org/email",
  displayName: "http://schema.org/name",
  givenName: "http://schema.org/givenName",
  familyName: "http://schema.org/familyName"
};

const mapUserProfile = data => {
  const user = {};
  if (data && data.data) {
    Object.entries(userKeys).forEach(([name, fullyQualifiedName]) => {
      if (data.data[fullyQualifiedName]) {
        user[name] = data.data[fullyQualifiedName];
      }
    });
    user.workspaces = ["minds", "uniminds"]; //TODO: remove hardcoded value;
  }
  return user;
};

class AuthStore {
  @observable session = null;
  @observable user = null;
  @observable isRetrievingUserProfile = false;
  @observable userProfileError = false;
  @observable currentWorkspace = null;
  expiredToken = false;

  constructor() {
    if (Storage === undefined) {
      throw "The browser must support WebStorage API";
    }
  }

  @computed
  get accessToken() {
    return this.hasExpired ? null : this.session.accessToken;
  }

  @computed
  get isAuthenticated() {
    return !this.hasExpired;
  }

  @computed
  get hasUserProfile() {
    return !!this.user;
  }

  @computed
  get hasWorkspaces() {
    return this.user && this.user.workspaces && !!this.user.workspaces.length;
  }

  @computed
  get workspaces() {
    return this.hasWorkspaces ? this.user.workspaces: [];
  }

  @computed
  get isFullyAuthenticated() {
    return this.isAuthenticated && this.hasUserProfile;
  }

  get hasExpired() {
    return this.session === null || (new Date() - this.session.expiryTimestamp) > 0;
  }

  @action
  setCurrentWorkspace(workspace) {
    localStorage.setItem("currentWorkspace", workspace);
    this.currentWorkspace = workspace;
  }

  @action
  logout() {
    // console.log("logout");
    this.session = null;
    this.expiredToken = true;
    this.user = null;
    if (typeof Storage !== "undefined") {
      localStorage.removeItem(authLocalStorageKey);
    }
  }

  @action
  async retrieveUserProfile() {
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
          this.user = mapUserProfile(data);
          this.retrieveUserWorkspace();
          this.isRetrievingUserProfile = false;
        });
      } catch (e) {
        runInAction(() => {
          this.userProfileError = e.message ? e.message : e;
          this.isRetrievingUserProfile = false;
        });
      }
    }
  }


  storeState = () => {
    const state = {
      hash: window.location.hash,
      search: window.location.search
    };
    localStorage.setItem(stateLocalStorageKey, JSON.stringify(state));
  }

  @action
  retrieveUserWorkspace = () => {
    //TODO: Get the options of spaces
    const savedWorkspace = localStorage.getItem("currentWorkspace");
    if (this.user.workspaces.includes(savedWorkspace)) {
      this.currentWorkspace = savedWorkspace;
    } else {
      if (this.user.workspaces.length) {
        if (this.user.workspaces.length > 1) {
          this.currentWorkspace = null;
        } else {
          localStorage.setItem("currentWorkspace", this.user.workspaces[0]);
        }
      }
    }
  }


  @action
  tryAuthenticate() {
    const hash = window.location.hash;
    const accessToken = getKey(hash, "access_token");
    const state = getKey(hash, "session_state");
    const expiresIn = getKey(hash, "expires_in");

    if (accessToken && state && expiresIn) {
      this.session = {
        accessToken: accessToken,
        expiryTimestamp: new Date().getTime() + 1000 * (Number(expiresIn) - 60)
      };

      // console.log ("retrieved auth from url: ", this.session);
      localStorage.setItem(authLocalStorageKey, JSON.stringify(this.session));

      const state = JSON.parse(localStorage.getItem(stateLocalStorageKey));
      let startHistory = window.location.protocol + "//" + window.location.host + window.location.pathname + state.search + state.hash;
      const historyState = window.history.state;
      window.history.replaceState(historyState, "Knowledge Graph Editor", startHistory);

      //TODO: change route to whatever it was before
      this.retrieveUserProfile();
    } else {
      const authStoredState = JSON.parse(localStorage.getItem(authLocalStorageKey));
      // console.log ("retrieved oid from localStorage: ", authStoredState);

      if (authStoredState && authStoredState.expiryTimestamp && new Date() < authStoredState.expiryTimestamp) {
        this.session = authStoredState;
        this.retrieveUserProfile();
      }
    }
  }
}
export default new AuthStore();