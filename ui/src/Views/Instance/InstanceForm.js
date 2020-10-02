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
import injectStyles from "react-jss";
import { observer } from "mobx-react";
import { Form } from "hbp-quickfire";
import Color from "color";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import appStore from "../../Stores/AppStore";
import routerStore from "../../Stores/RouterStore";
import typesStore from "../../Stores/TypesStore";
import instanceStore from "../../Stores/InstanceStore";

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

const styles = {
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
      border: "1px solid #ccc",
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
      backgroundColor: "#eff5fb",
      borderColor: "#337ab7"
    },
    "&:hover:not(.current).readMode": {
      color: "#337ab7"
    },
    "& > div:first-Child": {
      position: "relative"
    },
    "&:not(.current).highlight": {
      backgroundColor: "#a5c7e9",
      borderColor: "#337ab7",
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
      color: "#337ab7"
    },
    "&:not(.main) $panelHeader": {
      padding: "10px 10px 0 10px"
    },
    "&.current $panelHeader h6": {
      margin: "10px 0",
      color: "#333"
    },
    "&:not(.main) $panelSummary": {
      padding: "10px 10px 0 10px"
    },
    "&:not(.main) $panelBody": {
      padding: "0 10px"
    },
    "&:not(.main) $panelFooter": {
      padding: "0 10px"
    },
    "&.readMode .quickfire-empty-field": {
      display: "none"
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
};

@injectStyles(styles)
@observer
class InstanceForm extends React.Component {
  componentDidMount() {
    if (this.props.id) {
      this.fetchInstance();
    }
  }

  componentDidUpdate(prevProps) {
    if (this.props.id && this.props.id !== prevProps.id) {
      this.fetchInstance();
    }
  }

  fetchInstance(forceFetch = false) {
    if (this.props.id) {
      const instance = instanceStore.createInstanceOrGet(this.props.id);
      instance.fetch(forceFetch);
    }
  }

  handleListLoadRetry = () => typesStore.fetch();

  handleFocus = () => {
    if (this.props.view.currentInstanceId !== this.props.id) {
      this.props.view.setCurrentInstanceId(this.props.pane, this.props.id);
    }
  }

  handleOpenInstance = e => {
    if ((e.metaKey || e.ctrlKey)) {
      const instance = instanceStore.instances.get(this.props.id);
      appStore.openInstance(this.props.id, instance.name, instance.primaryType);
    } else {
      routerStore.history.push(`/instance/view/${this.props.id}`);
    }
  }

  handleChange = () => {
    instanceStore.instanceHasChanged(this.props.id);
  }

  handleLoad = () => {
    const instance = instanceStore.instances.get(this.props.id);
    instance && instance.memorizeInstanceInitialValues();
  }

  handleCancelEdit = e => {
    e && e.stopPropagation();
    const instance = instanceStore.instances.get(this.props.id);
    if (instance) {
      if (instance.hasChanged) {
        instanceStore.cancelInstanceChanges(this.props.id);
      } else {
        this.handleConfirmCancelEdit();
      }
    }
  }

  handleConfirmCancelEdit = e => {
    e && e.stopPropagation();
    const instance = instanceStore.instances.get(this.props.id);
    if (instance && instance.hasChanged) {
      instanceStore.confirmCancelInstanceChanges(this.props.id);
    }
  }

  handleContinueEditing = e => {
    e && e.stopPropagation();
    instanceStore.abortCancelInstanceChange(this.props.id);
  }

  handleSave = e => {
    e && e.stopPropagation();
    this.instance && appStore.saveInstance(this.instance);
  }

  handleCancelSave = e => {
    e && e.stopPropagation();
    const instance = instanceStore.instances.get(this.props.id);
    instance && instance.cancelSave();
  }

  render() {
    const { classes, view, id, provenance } = this.props;

    const instance = instanceStore.instances.get(this.props.id);
    if (!instance) {
      return null;
    }

    const mainInstanceId = view.instanceId;
    const isMainInstance = id === mainInstanceId;
    const isCurrentInstance = id === view.currentInstanceId;
    const highlight = view.instanceHighlight && view.instanceHighlight.instanceId === id && view.instanceHighlight.provenance === provenance;

    let className = `${classes.container} ${instance.isReadMode?"readMode":""} ${isCurrentInstance?"current":""} ${isMainInstance?"main":""} ${instance.hasChanged?"hasChanged":""} ${highlight?"highlight":""}`;

    const fields = [...instance.promotedFields, ...instance.nonPromotedFields];

    return (
      <div className={className} data-id={id}>
        {instance.hasFetchError?
          <FetchErrorPanel id={id} show={instance.hasFetchError} error={instance.fetchError} onRetry={this.fetchInstance.bind(this, true)} inline={!isMainInstance} />
          :
          instance.isFetching?
            <FetchingPanel id={id} show={instance.isFetching} inline={!isMainInstance} />
            :
            instance.isFetched?
              <React.Fragment>
                <div
                  onFocus={this.handleFocus}
                  onClick={this.handleFocus}
                  onDoubleClick={instance.isReadMode && !isMainInstance && (appStore.currentWorkspace.id === instance.workspace)? this.handleOpenInstance : undefined}
                  onChange={this.handleChange}
                  onLoad={this.handleLoad}
                >
                  <Form store={instance.form}>
                    <HeaderPanel
                      className={classes.panelHeader}
                      types={instance.types}
                      hasChanged={instance.hasChanged}
                      highlight={highlight} />

                    {instance.hasFieldErrors?
                      <GlobalFieldErrors instance={instance} />
                      :
                      <BodyPanel className={classes.panelBody} fields={fields} />
                    }
                    <FooterPanel
                      className={classes.panelFooter}
                      instance={instance}
                      showOpenActions={isCurrentInstance && !isMainInstance} />
                  </Form>
                  <ConfirmCancelEditPanel
                    show={instance.cancelChangesPending}
                    text={"There are some unsaved changes. Are you sure you want to cancel the changes of this instance?"}
                    onConfirm={this.handleConfirmCancelEdit}
                    onCancel={this.handleContinueEditing}
                    inline={!isMainInstance} />
                  <SavingPanel id={id} show={instance.isSaving} inline={!isMainInstance} />
                  <CreatingChildInstancePanel show={appStore.isCreatingNewInstance} />
                  <SaveErrorPanel show={instance.hasSaveError} error={instance.saveError} onCancel={this.handleCancelSave} onRetry={this.handleSave} inline={!isMainInstance} />
                </div>
                <FontAwesomeIcon className="highlightArrow" icon="arrow-right" />
              </React.Fragment>
              :
              null
        }
      </div>
    );
  }
}

export default InstanceForm;