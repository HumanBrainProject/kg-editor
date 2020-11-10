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

import React from "react";
import * as Sentry from "@sentry/browser";
import Cookies from "universal-cookie";

import { useStores } from "../Hooks/UseStores";

class ErrorBoundaryComponent extends React.Component {

  componentDidMount() {
    const cookies = new Cookies();
    const sentryUrl = cookies.get("sentry_url");
    if (sentryUrl) {
      Sentry.init({
        dsn: sentryUrl
      });
    }
  }

  static getDerivedStateFromError() {
    return null;
  }

  componentDidCatch(error, info) {
    const { stores:{ appStore } } = this.props;
    appStore.setGlobalError(error, info);
  }

  render() {
    const { children } = this.props;
    return children;
  }
}

const ErrorBoundary = ({ children }) => {

  const stores = useStores();

  return (
    <ErrorBoundaryComponent stores={stores} >
      {children}
    </ErrorBoundaryComponent>
  );
};

export default ErrorBoundary;