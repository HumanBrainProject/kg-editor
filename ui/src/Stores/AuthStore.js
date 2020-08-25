import { observable, computed, action, runInAction } from "mobx";
import API from "../Services/API";

const rootPath = window.rootPath || "";

// TODO: Move this logic to kg-editor-service
const userKeys = {
  id: "https://schema.hbp.eu/users/nativeId",
  username: "http://schema.org/alternateName",
  email: "http://schema.org/email",
  displayName: "http://schema.org/name",
  givenName: "http://schema.org/givenName",
  familyName: "http://schema.org/familyName",
  workspaces: "https://core.kg.ebrains.eu/vocab/meta/workspaces"
};

const mapUserProfile = data => {
  const user = {};
  if (data && data.data) {
    Object.entries(userKeys).forEach(([name, fullyQualifiedName]) => {
      if (data.data[fullyQualifiedName]) {
        user[name] = data.data[fullyQualifiedName];
      }
    });
  }
  return user;
};

class AuthStore {
  @observable user = null;
  @observable isRetrievingUserProfile = false;
  @observable userProfileError = false;
  @observable authError = null;
  @observable authSuccess = false;
  @observable isTokenExpired = false;
  @observable isInitializing = true;
  @observable initializationError = null;
  @observable isLogout = false;
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
    return this.user && this.user.workspaces instanceof Array && !!this.user.workspaces.length;
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
  logout() {
    this.authSuccess = false;
    this.isTokenExpired = true;
    this.user = null;
    this.keycloak.logout({redirectUri: `${window.location.protocol}//${window.location.host}${rootPath}/logout`});
    this.isLogout = true;
  }

  @action
  async retrieveUserProfile() {
    if (this.isAuthenticated && !this.user) {
      this.userProfileError = false;
      this.isRetrievingUserProfile = true;
      try {
        const { data } = await API.axios.get(API.endpoints.user());
        runInAction(() => {
          this.user = mapUserProfile(data);
          this.isRetrievingUserProfile = false;
        });
      } catch (e) {
        runInAction(() => {
          this.userProfileError = e.message ? e.message : e;
          this.isRetrievingUserProfile = false;
        });
      }
    }
    return this.hasUserProfile;
  }

  @action
  initializeKeycloak(resolve, reject) {
    const keycloak = window.Keycloak({
      "realm": "hbp",
      "url":  this.endpoint,
      "clientId": "kg"
    });
    runInAction(() => this.keycloak = keycloak);
    keycloak.onAuthSuccess = () => {
      runInAction(() => {
        this.authSuccess = true;
        this.isInitializing = false;
      });
      resolve(true);
    };
    keycloak.onAuthError = error => {
      runInAction(() => {
        this.authError = error.error_description;
      });
      reject(error.error_description);
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
  async authenticate() {
    this.isLogout = false;
    this.isInitializing = true;
    this.authError = null;
    try {
      const { data } = await API.axios.get(API.endpoints.auth());
      runInAction(() => {
        this.endpoint =  data && data.data? data.data.endpoint :null;
      });
      if(this.endpoint) {
        try {
          await new Promise((resolve, reject) => {
            const keycloakScript = document.createElement("script");
            keycloakScript.src = this.endpoint + "/js/keycloak.js";
            keycloakScript.async = true;

            document.head.appendChild(keycloakScript);
            keycloakScript.onload = () => {
              this.initializeKeycloak(resolve, reject);
            };
            keycloakScript.onerror = () => {
              document.head.removeChild(keycloakScript);
              runInAction(() => {
                this.isInitializing = false;
                this.authError = `Failed to load resource! (${keycloakScript.src})`;
              });
              reject(this.authError);
            };
          });
        } catch (e) {
          // error are already set in the store so no need to do anything here
          // window.console.log(e);
        }
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
    return this.authSuccess;
  }
}

export default new AuthStore();