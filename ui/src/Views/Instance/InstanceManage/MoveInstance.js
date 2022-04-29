/*
 * Copyright 2018 - 2021 Swiss Federal Institute of Technology Lausanne (EPFL)
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0.
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * This open source software code was developed in part or in whole in the
 * Human Brain Project, funded from the European Union's Horizon 2020
 * Framework Programme for Research and Innovation under
 * Specific Grant Agreements No. 720270, No. 785907, and No. 945539
 * (Human Brain Project SGA1, SGA2 and SGA3).
 *
 */

import React, { useState, useEffect } from "react";
import { observer } from "mobx-react-lite";
import { createUseStyles } from "react-jss";
import ReactPiwik from "react-piwik";
import Button from "react-bootstrap/Button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { useStores } from "../../../Hooks/UseStores";

import ErrorModal from "../../../Components/ErrorModal";
import SpinnerModal from "../../../Components/SpinnerModal";
import { useNavigate, useLocation } from "react-router-dom";

const useStyles = createUseStyles({
  title: {
    display: "inline",
  },
  selector: {
    display: "inline-block",
    position: "relative",
    margin: "0 4px 12px 10px",
    background: "var(--bg-color-ui-contrast4)",
    "& select": {
      background: "transparent",
      border: 0,
      margin: 0,
      padding: "4px 25px 4px 6px",
      lineHeight: "1.2",
      fontSize: "1.5rem",
      "-webkit-appearance": "none",
      cursor: "pointer",
      color: "inherit",
      "&[disabled]": {
        cursor: "not-allowed",
      },
    },
    "&:before": {
      content: '" "',
      display: "block",
      position: "absolute",
      top: "50%",
      right: "10px",
      transform: "translateY(-3px)",
      width: 0,
      height: 0,
      borderLeft: "6px solid transparent",
      borderRight: "6px solid transparent",
      borderTop: "6px solid var(--ft-color-normal)",
      cursor: "pointer",
      pointerEvents: "none",
    },
  },
  error: {
    color: "var(--ft-color-error)",
  },
  btn: {
    "&[disabled]": {
      cursor: "not-allowed",
    },
  },
});

const Status = ({
  status,
  fetchStatus,
  onClick,
  classes,
  variant,
  isDisabled,
}) => {
  if (status && status.hasFetchError) {
    return (
      <div className={classes.error}>
        <FontAwesomeIcon icon={"exclamation-triangle"} />
        &nbsp;&nbsp;{status.fetchError}&nbsp;&nbsp;
        <Button variant="primary" onClick={fetchStatus}>
          <FontAwesomeIcon icon="redo-alt" />
          &nbsp;Retry
        </Button>
      </div>
    );
  }
  if (!status || !status.isFetched) {
    return (
      <>
        <FontAwesomeIcon icon={"circle-notch"} spin />
        &nbsp;&nbsp;Fetching instance release status
      </>
    );
  }
  return (
    <>
      {status.data !== "UNRELEASED" && (
        <ul>
          <li>
            This instance has been released and therefore cannot be moved.
          </li>
          <li>If you still want to move it you first have to unrelease it.</li>
        </ul>
      )}
      <Button
        variant={variant}
        disabled={isDisabled}
        className={classes.btn}
        onClick={onClick}
      >
        <FontAwesomeIcon icon={"angle-double-right"} /> &nbsp; Move this
        instance
      </Button>
    </>
  );
};

const MoveInstance = observer(({ instance, className }) => {
  const classes = useStyles();

  const { appStore, statusStore, authStore } = useStores();
  const navigate = useNavigate();
  const location = useLocation();

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => fetchStatus(), [instance]);

  const fetchStatus = () => statusStore.fetchStatus(instance.id);

  const [spaceId, setSpaceId] = useState(appStore.currentSpace.id);

  const permissions = instance.permissions;
  const status = statusStore.getInstance(instance.id);

  const spaces = authStore.spaces.filter((s) => {
    if (s.id === appStore.currentSpace.id) {
      return true;
    }
    if (
      !s.id.startsWith("private-") ||
      appStore.currentSpace.id.startsWith("private-")
    ) {
      // only instance in a private space can be moved to another private space
      return s.permissions.canCreate;
    }
    return false;
  });

  const handleSetSpaceId = (e) => {
    setSpaceId(e.target.value);
  };

  const handleMoveInstance = () => {
    ReactPiwik.push(["trackEvent", "Instance", "Move", instance.id]);
    appStore.moveInstance(instance.id, spaceId, location, navigate);
  };

  const handleCancelMoveInstance = () =>
    appStore.retryMoveInstance(location, navigate);

  const handleRetryMoveInstance = () => appStore.cancelMoveInstance();
  const variant =
    spaceId === appStore.currentSpace.id ? "secondary" : "warning";
  const isDisabled =
    status.data !== "UNRELEASED" || spaceId === appStore.currentSpace.id;
  return (
    <>
      {permissions.canDelete && spaces.length > 1 && (
        <div className={className}>
          <div>
            <h4 className={classes.title}>Move this instance to space</h4>
            <div className={classes.selector}>
              <select
                value={spaceId}
                onChange={handleSetSpaceId}
                disabled={!status || status.data !== "UNRELEASED"}
              >
                {spaces.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name || s.id}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <Status
            status={status}
            fetchStatus={fetchStatus}
            onClick={handleMoveInstance}
            classes={classes}
            variant={variant}
            isDisabled={isDisabled}
          />
        </div>
      )}
      {appStore.instanceMovingError && (
        <ErrorModal
          message={appStore.instanceMovingError}
          onCancel={handleCancelMoveInstance}
          onRetry={handleRetryMoveInstance}
        />
      )}
      {!appStore.instanceMovingError && appStore.isMovingInstance && (
        <SpinnerModal
          text={`Moving instance "${appStore.instanceToMove.id}" to space "${appStore.instanceToMove.space}" ...`}
        />
      )}
    </>
  );
});

export default MoveInstance;
