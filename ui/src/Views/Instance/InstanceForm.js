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

import React, { useEffect } from "react";
import { createUseStyles } from "react-jss";
import { observer } from "mobx-react-lite";
import Color from "color";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { useStores } from "../../Hooks/UseStores";

import HeaderPanel from "./InstanceForm/HeaderPanel";
import BodyPanel from "./InstanceForm/BodyPanel";
import FooterPanel from "./InstanceForm/FooterPanel";
import FetchErrorPanel from "./InstanceForm/FetchErrorPanel";
import SaveErrorPanel from "./InstanceForm/SaveErrorPanel";
import FetchingPanel from "./InstanceForm/FetchingPanel";
import SavingPanel from "./InstanceForm/SavingPanel";
import ConfirmCancelEditPanel from "./InstanceForm/ConfirmCancelEditPanel";
import CreatingChildInstancePanel from "./InstanceForm/CreatingChildInstancePanel";
import GlobalFieldErrors from "../../Components/GlobalFieldErrors";
import { useNavigate } from "react-router-dom";

const useStyles = createUseStyles({
  container: {
    transition: "all 0.25s linear",
    "&:not(.current)": {
      borderRadius: "10px",
      color: "#555",
      cursor: "pointer"
    },
    "&.main:not(.current)": {
      border: "1px solid transparent",
      padding: "10px"
    },
    "&:not(.main)": {
      position: "relative",
      marginBottom: "10px",
      border: "1px solid var(--border-color-ui-contrast2)",
      borderRadius: "10px"
    },
    "&:not(.main).current": {
      borderColor: "#666",
      backgroundColor: "white",
      boxShadow: "2px 2px 4px #a5a1a1"
    },
    "&:not(.main).hasChanged": {
      background: new Color("#f39c12").lighten(0.66).hex()
    },
    "&:hover:not(.current)": {
      backgroundColor: "var(--link-bg-color-hover-quiet)",
      borderColor: "var(--link-border-color-hover)"
    },
    "&:hover:not(.current).readMode": {
      color: "var(--link-ft-color-hover)"
    },
    "& > div:first-Child": {
      position: "relative"
    },
    "&:not(.current).highlight": {
      backgroundColor: "var(--link-bg-color-hover)",
      borderColor: "var(--link-border-color-hover)",
      color: "#143048"
    },
    "& .highlightArrow": {
      display: "none",
      position: "absolute",
      top: "50%",
      left: "-26px",
      color: "transparent",
      fontSize: "xx-large",
      transform: "translateY(-50%) scale(0.5,0.8)"
    },
    "&:not(.current) .highlightArrow": {
      display: "inline",
      position: "absolute",
      top: "50%",
      left: "-25px",
      color: "transparent",
      fontSize: "xx-large",
      transform: "translateY(-50%) scale(0.5,0.7)",
      transition: "color 0.25s ease-in-out"
    },
    "&:not(.current).highlight .highlightArrow": {
      color: "var(--link-ft-color-hover)"
    },
    "&:not(.main) $panelHeader": {
      padding: "10px 10px 0 10px"
    },
    "&.current $panelHeader h6": {
      margin: "10px 0",
      color: "#333"
    },
    "&:not(.main) $panelBody": {
      padding: "10px 10px 0 10px"
    },
    "&:not(.main) $panelFooter": {
      padding: "0 10px"
    }
  },
  panelHeader: {
    padding: "0"
  },
  panelBody: {
    padding: "10px 0 0 0"
  },
  panelFooter: {
    padding: "0"
  },
  hasChangedIndicator: {
    height: "9px",
    width: "9px",
    backgroundColor: "#FC3D3A",
    borderRadius: "50%",
    display: "inline-block"
  }
});

const InstanceForm = observer(({ id, view, pane, provenance }) => {

  const classes = useStyles();

  const { appStore, instanceStore } = useStores();
  const navigate = useNavigate();

  useEffect(() => {
    fetchInstance();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchInstance = (forceFetch = false) => {
    const inst = instanceStore.createInstanceOrGet(id);
    inst.fetch(forceFetch);
  };

  const instance = instanceStore.instances.get(id);
  if (!instance) {
    return null;
  }

  const handleRetry = () => fetchInstance(true);

  const handleFocus = () => {
    if (view.currentInstanceId !== id) {
      view.setCurrentInstanceId(pane, id);
      view.resetInstanceHighlight();
    }
  };

  const handleOpenInstance = e => {
    if ((e.metaKey || e.ctrlKey)) {
      appStore.openInstance(id, instance.name, instance.primaryType);
    } else {
      navigate(`/instances/${this.props.id}`);
    }
  };

  const handleConfirmCancelEdit = e => {
    e && e.stopPropagation();
    if (instance.hasChanged) {
      instanceStore.confirmCancelInstanceChanges(id);
    }
  };

  const handleContinueEditing = e => {
    e && e.stopPropagation();
    instanceStore.abortCancelInstanceChange(id);
  };

  const handleSave = e => {
    e && e.stopPropagation();
    instance && appStore.saveInstance(instance, navigate);
  };

  const handleCancelSave = e => {
    e && e.stopPropagation();
    instance.cancelSave();
  };

  const belongsToCurrentSpace = appStore.currentSpace && instance.space === appStore.currentSpace.id;

  const isReadMode = view.mode === "view" || !belongsToCurrentSpace;

  const mainInstanceId = view.instanceId;
  const isMainInstance = id === mainInstanceId;
  const isCurrentInstance = id === view.currentInstanceId;
  const highlight = view.instanceHighlight && view.instanceHighlight.pane === pane && view.instanceHighlight.instanceId === id && view.instanceHighlight.provenance === provenance;

  const className = `${classes.container} ${isReadMode?"readMode":""} ${isCurrentInstance?"current":""} ${isMainInstance?"main":""} ${instance.hasChanged?"hasChanged":""} ${highlight?"highlight":""}`;

  if (instance.hasFetchError) {
    return (
      <div className={className} data-id={id}>
        <FetchErrorPanel id={id} show={instance.hasFetchError} error={instance.fetchError} onRetry={handleRetry} inline={!isMainInstance} />
      </div>
    );
  }

  if (instance.isFetching) {
    return (
      <div className={className} data-id={id}>
        <FetchingPanel id={id} show={instance.isFetching} inline={!isMainInstance} />
      </div>
    );
  }

  if (instance.isFetched) {
    return (
      <div className={className} data-id={id}>
        <div
          onFocus={handleFocus}
          onClick={handleFocus}
          onDoubleClick={isReadMode && !isMainInstance && (appStore.currentSpace.id === instance.space)? handleOpenInstance : undefined}
        >
          <HeaderPanel
            className={classes.panelHeader}
            types={instance.types}
            hasChanged={instance.hasChanged}
            highlight={highlight} />

          {instance.hasFieldErrors?
            <GlobalFieldErrors instance={instance} />
            :
            <BodyPanel className={classes.panelBody} instance={instance} readMode={isReadMode} />
          }
          <FooterPanel
            className={classes.panelFooter}
            instance={instance}
            showOpenActions={isCurrentInstance && !isMainInstance} />
          <ConfirmCancelEditPanel
            show={instance.cancelChangesPending}
            text={"There are some unsaved changes. Are you sure you want to cancel the changes of this instance?"}
            onConfirm={handleConfirmCancelEdit}
            onCancel={handleContinueEditing}
            inline={!isMainInstance} />
          <SavingPanel id={id} show={instance.isSaving} inline={!isMainInstance} />
          <CreatingChildInstancePanel show={appStore.isCreatingNewInstance} />
          <SaveErrorPanel show={instance.hasSaveError} error={instance.saveError} onCancel={handleCancelSave} onRetry={handleSave} inline={!isMainInstance} />
        </div>
        <FontAwesomeIcon className="highlightArrow" icon="arrow-right" />
      </div>
    );
  }

  return null;
});
InstanceForm.displayName = "InstanceForm";

export default InstanceForm;