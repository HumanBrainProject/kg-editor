import React from "react";
import injectStyles from "react-jss";
import { observer } from "mobx-react";
import { Form } from "hbp-quickfire";
import Color from "color";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import instanceStore from "../../Stores/InstanceStore";
import graphStore from "../../Stores/GraphStore";
import HeaderPanel from "./InstanceForm/HeaderPanel";
import SummaryPanel from "./InstanceForm/SummaryPanel";
import BodyPanel from "./InstanceForm/BodyPanel";
import FooterPanel from "./InstanceForm/FooterPanel";
import FetchErrorPanel from "./InstanceForm/FetchErrorPanel";
import SaveErrorPanel from "./InstanceForm/SaveErrorPanel";
import FetchingPanel from "./InstanceForm/FetchingPanel";
import SavingPanel from "./InstanceForm/SavingPanel";
import ConfirmCancelEditPanel from "./InstanceForm/ConfirmCancelEditPanel";
import CreatingChildInstancePanel from "./InstanceForm/CreatingChildInstancePanel";
import routerStore from "../../Stores/RouterStore";

const styles = {
  panelHeader: {
    padding: "0"
  },
  panelSummary: {
    padding: "10px 0 0 0"
  },
  panelBody: {
    padding: "0"
  },
  panelFooter: {
    padding: "0"
  },
  panel: {
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
export default class InstanceForm extends React.Component {
  constructor(props) {
    super(props);
    this.fetchInstance();
  }

  fetchInstance(forceFetch = false){
    instanceStore.getInstance(this.props.id, forceFetch);
  }

  handleFocus = () => {
    if (instanceStore.getCurrentInstanceId(this.props.mainInstanceId) !== this.props.id) {
      instanceStore.setCurrentInstanceId(this.props.mainInstanceId, this.props.id, this.props.level);
    }
  }

  handleOpenInstance = (e) => {
    if((e.metaKey || e.ctrlKey)){
      instanceStore.openInstance(this.props.id);
    } else {
      routerStore.history.push(`/instance/view/${this.props.id}`);
    }
  }

  handleChange = () => {
    instanceStore.instanceHasChanged(this.props.id);
  }

  handleLoad = () => {
    instanceStore.memorizeInstanceInitialValues(this.props.id);
  }

  handleCancelEdit = (e) => {
    e && e.stopPropagation();
    const instance = instanceStore.getInstance(this.props.id);
    if (instance.hasChanged) {
      instanceStore.cancelInstanceChanges(this.props.id);
    } else {
      this.handleConfirmCancelEdit();
    }
  }

  handleConfirmCancelEdit = (e) => {
    e && e.stopPropagation();
    const instance = instanceStore.getInstance(this.props.id);
    instanceStore.toggleReadMode(this.props.mainInstanceId, this.props.id, this.props.level, true);
    if (instance.hasChanged) {
      instanceStore.confirmCancelInstanceChanges(this.props.id);
    }
  }

  handleContinueEditing = (e) => {
    e && e.stopPropagation();
    instanceStore.abortCancelInstanceChange(this.props.id);
  }

  handleSave = (e) => {
    e && e.stopPropagation();
    instanceStore.saveInstance(this.props.id);
  }

  handleCancelSave = (e) => {
    e && e.stopPropagation();
    instanceStore.cancelSaveInstance(this.props.id);
    instanceStore.toggleReadMode(this.props.mainInstanceId, this.props.id, this.props.level, false);
  }

  render() {
    const { classes, mainInstanceId, id } = this.props;

    const instance = instanceStore.getInstance(id);

    const isReadMode = !instance.isFetched || (instance.form && instance.form.readMode);

    const [, , schema, ,] = id.split("/");

    const nodeType = instance.isFetched && instance.data && instance.data.label || schema;

    const isMainInstance = id === mainInstanceId;
    const isCurrentInstance = id === instanceStore.getCurrentInstanceId(mainInstanceId);

    const panelClassName = () => {
      let className = classes.panel;
      if (isReadMode) {
        className += " readMode";
      }
      if (isCurrentInstance) {
        className += " current";
      }
      if (isMainInstance) {
        className += " main";
      }
      if (instance.hasChanged) {
        className += " hasChanged";
      }
      if (instance.highlight === this.props.provenence) {
        className += " highlight";
      }
      return className;
    };

    const promotedFields = instanceStore.getPromotedFields(instance);
    const nonPromotedFields = instanceStore.getNonPromotedFields(instance);

    return (
      <div className={panelClassName()} data-id={this.props.id}>
        {!instance.hasFetchError && !instance.isFetching &&
        <div
          onFocus={this.handleFocus}
          onClick={this.handleFocus}
          onDoubleClick={isReadMode && !isMainInstance?this.handleOpenInstance:undefined}
          onChange={this.handleChange}
          onLoad={this.handleLoad}
        >
          <Form store={instance.form} key={mainInstanceId}>
            <HeaderPanel
              className={classes.panelHeader}
              nodeType={nodeType}
              color={graphStore.colorScheme[instanceStore.nodeTypeMapping[nodeType]]}
              hasChanged={instance.hasChanged}/>

            <SummaryPanel className={classes.panelSummary} level={this.props.level} id={this.props.id} mainInstanceId={mainInstanceId} instance={instance} fields={promotedFields} />
            <BodyPanel className={classes.panelBody} level={this.props.level} id={this.props.id} mainInstanceId={mainInstanceId} instance={instance} fields={nonPromotedFields} show={isMainInstance || isCurrentInstance || !isReadMode} />

            <FooterPanel
              className={classes.panelFooter}
              nexusId={instance.data.fields.id?instance.data.fields.id.nexus_id:"<new>"}
              id={id}
              showOpenActions={isCurrentInstance && !isMainInstance}/>
          </Form>
          <ConfirmCancelEditPanel
            show={instance.cancelChangesPending}
            text={"There are some unsaved changes. Are you sure you want to cancel the changes of this instance?"}
            onConfirm={this.handleConfirmCancelEdit}
            onCancel={this.handleContinueEditing}
            inline={!isMainInstance} />
          <SavingPanel id={this.props.id} show={instance.isSaving} inline={!isMainInstance} />
          <CreatingChildInstancePanel show={instanceStore.isCreatingNewInstance}/>
          <SaveErrorPanel show={instance.hasSaveError} error={instance.saveError} onCancel={this.handleCancelSave} onRetry={this.handleSave} inline={!isMainInstance} />
        </div>
        }
        <FontAwesomeIcon className="highlightArrow"  icon="arrow-right"/>
        <FetchingPanel id={this.props.id} show={instance.isFetching} inline={!isMainInstance} />
        <FetchErrorPanel id={this.props.id} show={instance.hasFetchError} error={instance.fetchError} onRetry={this.fetchInstance.bind(this, true)} inline={!isMainInstance} />
      </div>
    );
  }
}