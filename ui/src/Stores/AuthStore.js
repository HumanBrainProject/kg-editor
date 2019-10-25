import { observable, computed, action, runInAction } from "mobx";
import API from "../Services/API";

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
    user.workspaces = ["simpsons"]; //TODO: remove hardcoded value;
  }
  return user;
};

class AuthStore {
  @observable user = null;
  @observable isRetrievingUserProfile = false;
  @observable userProfileError = false;
  @observable authError = null;
  @observable authSuccess = false;
  @observable currentWorkspace = null;
  @observable isTokenExpired = false;
  @observable isInitializing = true;
  @observable initializationError = null;
  keycloak = null;
  endpoint = null;

  constructor() {
    if (Storage === undefined) {
      throw "The browser must support WebStorage API";
    }
  }

  @computed
  get accessToken() {
    return this.isAuthenticated ? this.keycloak.token: "";
  }

  @computed
  get isAuthenticated() {
    return this.authSuccess;
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

  @action
  setCurrentWorkspace(workspace) {
    localStorage.setItem("currentWorkspace", workspace);
    this.currentWorkspace = workspace;
  }

  @action
  logout() {
    this.authSuccess = false;
    this.isTokenExpired = true;
    this.user = null;
    this.keycloak.logout();
  }

  @action
  async retrieveUserProfile() {
    if (this.isAuthenticated && !this.user) {
      this.userProfileError = false;
      this.isRetrievingUserProfile = true;
      try {
        // setTimeout(() => {
        //   runInAction(() => {
        //     this.user = {
        //       id: "asdfasdfasdfsd",
        //       workspaces: ["simpsons"] //TODO: Remove hardcoded values
        //     };
        //     this.retrieveUserWorkspace();
        //     this.isRetrievingUserProfile = false;
        //   });
        // }, 1000);
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
  initializeKeycloak() {
    const keycloak = window.Keycloak({
      "realm": "hbp",
      "url":  this.endpoint,
      "clientId": "kg-editor"
    });
    runInAction(() => this.keycloak = keycloak);
    keycloak.onAuthSuccess = () => {
      runInAction(() => {
        this.authSuccess = true;
        this.isInitializing = false;
      });
      this.retrieveUserProfile();
    };
    keycloak.onAuthError = error => {
      runInAction(() => {
        this.authError = error.error_description;
      });
    };
    keycloak.onTokenExpired = () => {
      runInAction(() => {
        this.authSuccess = false;
        this.isTokenExpired = true;
      });
    };
    keycloak.init({ onLoad: "login-required", flow: "implicit" });
  }

  @action
  login() {
    if(!this.isAuthenticated && this.keycloak) {
      this.keycloak.login();
    }
  }

  @action
  async initiliazeAuthenticate() {
    this.isInitializing = true;
    this.authError = null;
    try {
      const { data } = await API.axios.get(API.endpoints.auth());
      runInAction(() => {
        this.endpoint =  data && data.data? data.data.endpoint :null;
      });
      if(this.endpoint) {
        const keycloakScript = document.createElement("script");
        keycloakScript.src = this.endpoint + "/js/keycloak.js";
        keycloakScript.async = true;

        document.head.appendChild(keycloakScript);
        keycloakScript.onload = () => {
          this.initializeKeycloak();
        };
        keycloakScript.onerror = () => {
          document.head.removeChild(keycloakScript);
          runInAction(() => {
            this.isInitializing = false;
            this.authError = `Failed to load resource! (${keycloakScript.src})`;
          });
        };
      } else {
        runInAction(() => {
          this.isInitializing = false;
          this.authError = "service endpoints configuration is not correctly set";
        });
      }
    } catch (e) {
      runInAction(() => {
        this.isInitializing = false;
        this.authError = `Failed to load service endpoints configuration (${e && e.message?e.message:e})`;
      });
    }
  }
}

export default new AuthStore();