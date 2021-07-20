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

const rootPath = window.rootPath || "";

const endpoint = window.location.origin === "https://kg-editor.humanbrainproject.eu" ?"https://iam.ebrains.eu/auth":"https://iam-dev.ebrains.eu/auth";
class AuthStore {
  @observable isUserAuthorized = false;
  @observable user = null;
  @observable isRetrievingUserProfile = false;
  @observable userProfileError = false;
  @observable authError = null;
  @observable authSuccess = false;
  @observable isTokenExpired = false;
  @observable isInitializing = true;
  @observable initializationError = null;
  @observable isLogout = false;
  @observable keycloak = null;

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

  get firstName() {
    const firstNameReg = /^([^ ]+) .*$/;
    if (this.hasUserProfile && this.user) {
      if (this.user.givenName) {
        return this.user.givenName;
      }
      if (this.user.name) {
        if (firstNameReg.test(this.user.name)) {
          return this.user.name.match(firstNameReg)[1];
        }
        return this.user.name;
      }
      if (this.user.username) {
        return this.user.username;
      }
    }
    return "";
  }

  @action
  logout() {
    this.authSuccess = false;
    this.isTokenExpired = true;
    this.isUserAuthorized = false;
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
        debugger;
        //throw {response: { status: 403}};
        runInAction(() => {
          this.isUserAuthorized = true;
          const user = (data && data.data)?data.data:null;
          this.user = user;
          this.isRetrievingUserProfile = false;
        });
      } catch (e) {
        runInAction(() => {
          if (e.response && e.response.status === 403) {
            this.isUserAuthorized = false;
            this.isRetrievingUserProfile = false;
          } else {
            this.isUserAuthorized = false;
            this.userProfileError = e.message ? e.message : e;
            this.isRetrievingUserProfile = false;
          }
        });
      }
    }
    return this.hasUserProfile;
  }


  initializeKeycloak(resolve, reject) {
    const keycloak = window.Keycloak({
      "realm": "hbp",
      "url":  endpoint,
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
      keycloak
        .updateToken(30)
        .catch(() => runInAction(() => {
          this.authSuccess = false;
          this.isTokenExpired = true;
        }));
    };
    keycloak.init({ onLoad: "login-required", pkceMethod: "S256" });
  }

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
      await new Promise((resolve, reject) => {
        const keycloakScript = document.createElement("script");
        keycloakScript.src = endpoint + "/js/keycloak.js";
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
    return this.authSuccess;
  }

}

export default new AuthStore();
