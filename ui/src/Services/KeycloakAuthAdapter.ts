/*  Copyright 2018 - 2021 Swiss Federal Institute of Technology Lausanne (EPFL)
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *  http://www.apache.org/licenses/LICENSE-2.0.
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 *
 *  This open source software code was developed in part or in whole in the
 *  Human Brain Project, funded from the European Union's Horizon 2020
 *  Framework Programme for Research and Innovation under
 *  Specific Grant Agreements No. 720270, No. 785907, and No. 945539
 *  (Human Brain Project SGA1, SGA2 and SGA3).
 *
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
 *
 */
import KeycloakAuthProvider from '../Views/KeycloakAuthProvider';
import KeyCloakTokenProvider from './KeycloakTokenProvider';
import UnauthorizedRequestResponseHandlerProvider from './UnauthorizedRequestResponseHandlerProvider';
import type AuthAdapter from './AuthAdapter';
import type Keycloak from 'keycloak-js';
import type { KeycloakConfig, KeycloakInitOptions, KeycloakOnLoad } from 'keycloak-js';

class KeycloakAuthAdapter implements AuthAdapter {
  private _tokenProvider: KeyCloakTokenProvider;
  private _unauthorizedRequestResponseHandlerProvider: UnauthorizedRequestResponseHandlerProvider;
  private _initOptions: KeycloakInitOptions | undefined;
  private _redirectUri: string | undefined;
  private _config: KeycloakConfig | undefined = undefined;
  private _keycloak: Keycloak | undefined = undefined; //NOSONAR, Keycloak is used as a type

  constructor(initOptions?: KeycloakInitOptions, redirectUri?: string) {
    this._tokenProvider = new KeyCloakTokenProvider();
    this._unauthorizedRequestResponseHandlerProvider = new UnauthorizedRequestResponseHandlerProvider;
    this._initOptions = initOptions;
    this._redirectUri = redirectUri;
  }

  get tokenProvider() {
    return this._tokenProvider;
  }

  get unauthorizedRequestResponseHandlerProvider() {
    return this._unauthorizedRequestResponseHandlerProvider;
  }

  get authProvider() {
    return KeycloakAuthProvider;
  }

  setOnLoad(onLoad: KeycloakOnLoad) {
    if (this._initOptions) {
      this._initOptions = {
        ...this._initOptions,
        onLoad: onLoad
      };
    } else {
      throw new Error('setOnLoad cannot be called when KeycloakAuthAdapter is not initialized with initOptions');
    }
  }

  get initOptions(): Record<string, unknown> | undefined {
    return this._initOptions?{...this._initOptions} as Record<string, unknown>:undefined;
  }

  get redirectUri(): string | undefined {
    return this._redirectUri;
  }

  get config(): KeycloakConfig | undefined {
    return this._config?{...this._config}:undefined;
  }

  setConfig(config: Record<string, unknown> | undefined) {
    if (config) {
      this._config = {...config} as unknown as KeycloakConfig;
    }
  }

  get keycloak(): Keycloak | undefined { //NOSONAR, Keycloak is used as a type
    return this._keycloak;
  }

  setKeycloak(keycloak: Keycloak) { //NOSONAR, Keycloak is used as a type
    this._tokenProvider.setKeycloak(keycloak);
    this._keycloak = keycloak;
  }
}

export default KeycloakAuthAdapter;