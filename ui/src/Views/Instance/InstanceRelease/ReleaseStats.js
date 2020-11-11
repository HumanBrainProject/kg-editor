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
import { observer } from "mobx-react-lite";
import { createUseStyles } from "react-jss";

import { useStores } from "../../../Hooks/UseStores";

const useStyles = createUseStyles({
  container: {
    width: "100%",
    padding: "10px",
    background: "var(--bg-color-ui-contrast3)",
    border: "1px solid var(--border-color-ui-contrast1)",
    fontSize: "large",
    overflow: "hidden",
    "& .section": {
      paddingBottom: "10px",
      "& h5": {
        fontSize: "0.8em",
        fontWeight: "bold"
      },
      "& .stat": {
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        "&.pending": {
          gridTemplateColumns: "2fr 1fr",
          "& .pending-count": {
            fontSize: "0.8em",
            fontWeight: "bold",
            textAlign: "right",
            paddingRight: "4px"
          }
        },
        "& .name": {
          fontSize: "0.8em",
          paddingLeft: "4px",
          lineHeight: "16px"
        },
        "& .bar": {
          height: "16px",
          background: "var(--release-bg-released)",
          position: "relative",
          "& .bar-inner": {
            height: "16px",
            width: "0%",
            background: "var(--release-color-released)",
            transition: "width 0.25s ease"
          },
          "& .bar-label": {
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            textAlign: "center",
            fontSize: "0.7em",
            fontWeight: "bold",
            color: "var(--ft-color-loud)"
          },
          "&.not-released": {
            background: "var(--release-bg-not-released)",
            "& .bar-inner": {
              background: "var(--release-color-not-released)"
            }
          },
          "&.has-changed": {
            background: "var(--release-bg-has-changed)",
            "& .bar-inner": {
              background: "var(--release-color-has-changed)"
            }
          }
        }
      }
    }
  }
});

const ReleaseStats = observer(() => {

  const classes = useStyles();

  const { releaseStore } = useStores();

  if (!releaseStore.treeStats) {
    return null;
  }

  return (
    <div className={classes.container}>
      <div className={"section"}>
        <h5>Pending changes:</h5>
        <div className={"stat pending"}>
          <div className={"name"}>Instances released</div>
          <div className={"pending-count"}>
            {releaseStore.treeStats.proceed_release}
          </div>
        </div>
        <div className={"stat pending"}>
          <div className={"name"}>Instances unreleased</div>
          <div className={"pending-count"}>
            {releaseStore.treeStats.proceed_unrelease}
          </div>
        </div>
      </div>

      <div className={"section"}>
        <h5>Current state:</h5>
        <div className={"stat"}>
          <div className={"name"}>Released</div>
          <div className={"bar released"}>
            <div
              className={"bar-inner"}
              style={{
                width: `${(releaseStore.treeStats.released /
                      releaseStore.treeStats.total) *
                      100}%`
              }}
            />
            <div className={"bar-label"}>
              {releaseStore.treeStats.released} /{" "}
              {releaseStore.treeStats.total}
            </div>
          </div>
        </div>
        <div className={"stat"}>
          <div className={"name"}>Not released</div>
          <div className={"bar not-released"}>
            <div
              className={"bar-inner"}
              style={{
                width: `${(releaseStore.treeStats.not_released /
                      releaseStore.treeStats.total) *
                      100}%`
              }}
            />
            <div className={"bar-label"}>
              {releaseStore.treeStats.not_released} /{" "}
              {releaseStore.treeStats.total}
            </div>
          </div>
        </div>
        <div className={"stat"}>
          <div className={"name"}>Has changed</div>
          <div className={"bar has-changed"}>
            <div
              className={"bar-inner"}
              style={{
                width: `${(releaseStore.treeStats.has_changed /
                      releaseStore.treeStats.total) *
                      100}%`
              }}
            />
            <div className={"bar-label"}>
              {releaseStore.treeStats.has_changed} /{" "}
              {releaseStore.treeStats.total}
            </div>
          </div>
        </div>
      </div>

      <div className={"section"}>
        <h5>State after precessing:</h5>
        <div className={"stat"}>
          <div className={"name"}>Released</div>
          <div className={"bar released"}>
            <div
              className={"bar-inner"}
              style={{
                width: `${(releaseStore.treeStats.pending_released /
                      releaseStore.treeStats.total) *
                      100}%`
              }}
            />
            <div className={"bar-label"}>
              {releaseStore.treeStats.pending_released} /{" "}
              {releaseStore.treeStats.total}
            </div>
          </div>
        </div>
        <div className={"stat"}>
          <div className={"name"}>Not released</div>
          <div className={"bar not-released"}>
            <div
              className={"bar-inner"}
              style={{
                width: `${(releaseStore.treeStats.pending_not_released /
                      releaseStore.treeStats.total) *
                      100}%`
              }}
            />
            <div className={"bar-label"}>
              {releaseStore.treeStats.pending_not_released} /{" "}
              {releaseStore.treeStats.total}
            </div>
          </div>
        </div>
        <div className={"stat"}>
          <div className={"name"}>Has changed</div>
          <div className={"bar has-changed"}>
            <div
              className={"bar-inner"}
              style={{
                width: `${(releaseStore.treeStats.pending_has_changed /
                      releaseStore.treeStats.total) *
                      100}%`
              }}
            />
            <div className={"bar-label"}>
              {releaseStore.treeStats.pending_has_changed} /{" "}
              {releaseStore.treeStats.total}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

export default ReleaseStats;