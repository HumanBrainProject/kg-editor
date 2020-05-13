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
import ReactJson from "react-json-view";
import { observer } from "mobx-react";
import injectStyles from "react-jss";
import { Button } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import ThemeRJV from "./ThemeRJV";
import queryBuilderStore from "../../Stores/QueryBuilderStore";
import BGMessage from "../../Components/BGMessage";
import FetchingLoader from "../../Components/FetchingLoader";
import ResultOptions from "./ResultOptions";

const styles = {
  fetchingPanel: {
    width: "100%",
    height: "100%",
    zIndex: 10000,
    "& .fetchingPanel": {
      width: "auto",
      padding: "30px",
      border: "1px solid var(--border-color-ui-contrast1)",
      borderRadius: "4px",
      color: "var(--ft-color-loud)",
      background: "var(--list-bg-hover)"
    }
  }
};

@injectStyles(styles)
@observer
export default class Result extends React.Component{

  handlExecuteQuery = () => {
    queryBuilderStore.executeQuery();
  }

  handlClearError = () => {
    queryBuilderStore.runError = null;
  }

  render(){
    const { classes } = this.props;
    return(
      <div>
        <ResultOptions/>
        {queryBuilderStore.isRunning?
          <div className={classes.fetchingPanel}>
            <FetchingLoader>
              Fetching query...
            </FetchingLoader>
          </div>
          :
          queryBuilderStore.runError?
            <BGMessage icon={"ban"}>
              There was a network problem fetching the query.<br/>
              If the problem persists, please contact the support.<br/>
              <small>{queryBuilderStore.runError}</small><br/><br/>
              {queryBuilderStore.isQueryEmpty?
                <Button bsStyle={"primary"} onClick={this.handlClearError}>
                  <FontAwesomeIcon icon={"redo-alt"}/>&nbsp;&nbsp; OK
                </Button>
                :
                <Button bsStyle={"primary"} onClick={this.handlExecuteQuery}>
                  <FontAwesomeIcon icon={"redo-alt"}/>&nbsp;&nbsp; Retry
                </Button>
              }
            </BGMessage>
            :
            queryBuilderStore.result && (
              <ReactJson collapsed={1} name={false} theme={ThemeRJV} src={queryBuilderStore.result} />
            )
        }
      </div>
    );
  }
}