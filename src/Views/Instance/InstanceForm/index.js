import React from "react";
import injectStyles from "react-jss";
import { observer, inject } from "mobx-react";
import { Glyphicon } from "react-bootstrap";
import { Form } from "hbp-quickfire";
import HeaderPanel from "./HeaderPanel";
import SummaryPanel from "./SummaryPanel";
import BodyPanel from "./BodyPanel";
import FooterPanel from "./FooterPanel";
import FetchErrorPanel from "./FetchErrorPanel";
import SaveErrorPanel from "./SaveErrorPanel";
import FetchingPanel from "./FetchingPanel";
import SavingPanel from "./SavingPanel";
import ConfirmCancelEditPanel from "./ConfirmCancelEditPanel";

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
      cursor:"pointer"
    },
    "&.main:not(.current)": {
      border: "1px solid transparent",
      padding: "10px"
    },
    "&:not(.main)" : {
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
    "&.hasChanged:not(.current):not(.readMode)": {
      background: "#ffe6e5"
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
    "&:not(.current).readMode.highlight": {
      backgroundColor: "#a5c7e9",
      borderColor: "#337ab7",
      color: "#143048"
    },
    "& .hightlightArrow": {
      display: "none",
      position: "absolute",
      top: "50%",
      left: "-26px",
      color: "transparent",
      fontSize: "xx-large",
      transform: "translateY(-50%) scale(0.5,0.8)"
    },
    "&:not(.current).readMode .hightlightArrow": {
      display: "inline",
      position: "absolute",
      top: "50%",
      left: "-26px",
      color: "transparent",
      fontSize: "xx-large",
      transform: "translateY(-50%) scale(0.5,0.8)",
      transition: "color 0.25s ease-in-out"
    },
    "&:not(.current).readMode.highlight .hightlightArrow": {
      color: "#337ab7"
    },
    "&:not(.main) $panelHeader": {
      padding: "10px 10px 0 10px"
    },
    "&.current $panelHeader": {
      borderBottom: "1px solid #ccc",
      paddingBottom: "10px"
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
    "&.current $panelBody": {
      paddingBottom: "10px"
    },
    "&:not(.main) $panelFooter": {
      padding: "0 10px"
    },
    "&.current $panelFooter": {
      borderTop: "1px solid #ccc",
      paddingTop: "10px"
    },
    "&.current:not(.editMode) $panelFooter": {
      paddingBottom: "10px"
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
@inject("instanceStore")
@observer
export default class InstanceForm extends React.Component{
  constructor(props){
    super(props);
    this.fetchInstance();
  }

  fetchInstance = () => {
    this.props.instanceStore.fetchInstanceData(this.props.id);
  }

  handleFocus = () => {
    if(this.props.instanceStore.currentInstanceId !== this.props.id){
      this.props.instanceStore.setCurrentInstanceId(this.props.id, this.props.level);
    }
  }

  handleEdit = (e) => {
    e && e.stopPropagation();
    this.props.instanceStore.toggleReadMode(this.props.id, this.props.level, false);
  }

  handleChange = () => {
    this.props.instanceStore.instanceHasChanged(this.props.id);
  }

  handleLoad = () => {
    this.props.instanceStore.memorizeInstanceInitialValues(this.props.id);
  }

  handleCancelEdit = (e) => {
    e && e.stopPropagation();
    const instance = this.props.instanceStore.getInstance(this.props.id);
    if (instance.hasChanged) {
      this.props.instanceStore.requestCancelInstanceChanges(this.props.id);
    } else {
      this.handleConfirmCancelEdit();
    }
  }

  handleConfirmCancelEdit = (e) => {
    e && e.stopPropagation();
    const instance = this.props.instanceStore.getInstance(this.props.id);
    if (instance.isNew) {
      this.props.instanceStore.confirmCancelInstanceChanges(this.props.id);
    } else {
      this.props.instanceStore.toggleReadMode(this.props.id, this.props.level, true);
      if (instance.hasChanged) {
        this.props.instanceStore.confirmCancelInstanceChanges(this.props.id);
      }
    }
  }

  handleContinueEditing = (e) => {
    e && e.stopPropagation();
    this.props.instanceStore.abortCancelInstanceChange(this.props.id);
  }

  handleSave = (e) => {
    e && e.stopPropagation();
    this.props.instanceStore.toggleReadMode(this.props.id, this.props.level, true);
    this.props.instanceStore.saveInstance(this.props.id);
  }

  handleCancelSave = (e) => {
    e && e.stopPropagation();
    this.props.instanceStore.cancelSaveInstance(this.props.id);
    this.props.instanceStore.toggleReadMode(this.props.id, this.props.level, false);
  }

  render(){
    const { classes, instanceStore } = this.props;

    const instance = instanceStore.getInstance(this.props.id);

    const isReadMode = !instance.isFetched || (instance.form && instance.form.readMode);

    const [organization, domain, schema, version,] = this.props.id.split("/");

    const nodeType = instance.isFetched && instance.data && instance.data.label || schema;

    const isMainInstance = this.props.id === instanceStore.mainInstanceId;
    const isCurrentInstance = this.props.id === instanceStore.currentInstanceId;

    const backLink = (instance.isFetched && instance.data && instance.data.instancesPath)?
      instance.data.instancesPath
      :
      (organization && domain && schema && version)?
        `/nodetype/${organization}/${domain}/${schema}/${version}`
        :
        "/";

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
      if (instance.hasChanged){
        className += " hasChanged";
      }
      if (instance.highlight === this.props.provenence) {
        className += " highlight";
      }
      return className;
    };

    const getSummaryFields = instance => {
      if (instance && instance.data && instance.data.fields && instance.data.ui_info && instance.data.ui_info.promotedFields) {
        return instance.data.ui_info.promotedFields
          .map(key => key.replace(/\//g, "%nexus-slash%"))
          .filter(name => instance.data.fields[name]);
      }
      return [];
    };

    const getBodyFields = instance => {
      if (instance && instance.data && instance.data.fields) {
        return Object.keys(instance.data.fields)
          .filter(name => {
            const key = name.replace(/%nexus-slash%/g, "/");
            return !instance.data.ui_info || !instance.data.ui_info.promotedFields || !instance.data.ui_info.promotedFields.includes(key);
          });
      }
      return [];
    };

    return(
      <div className={panelClassName()} data-id={this.props.id}>
        {!instance.hasFetchError && !instance.isFetching &&
        <div
          onFocus={this.handleFocus}
          onClick={this.handleFocus}
          onChange={this.handleChange}
          onLoad={this.handleLoad}
        >
          <Form store={instance.form}>
            <HeaderPanel
              className={classes.panelHeader}
              title={nodeType}
              isReadMode={isReadMode}
              onEdit={this.handleEdit}
              onReadMode={this.handleCancelEdit}
              showButtons={!instance.isNew && isCurrentInstance && !instance.isSaving && !instance.hasSaveError && !instance.confirmCancel} />
            <SummaryPanel className={classes.panelSummary} level={this.props.level} id={this.props.id} instance={instance} fields={getSummaryFields(instance)} />
            <BodyPanel className={classes.panelBody} level={this.props.level} id={this.props.id} instance={instance} fields={getBodyFields(instance)} show={isMainInstance || isCurrentInstance || !isReadMode} />
            <FooterPanel
              className={classes.panelFooter}
              id={instance.data.fields.id?instance.data.fields.id.value.nexus_id:"<new>"}
              onSave={this.handleSave}
              onCancel={this.handleCancelEdit}
              onCancelBackLink={backLink}
              useCancelBackLink={instance.isNew && !instance.hasChanged}
              showEditButtons={isCurrentInstance && !isReadMode && !instance.isSaving && !instance.hasSaveError && !instance.confirmCancel}
              disableSaveButton={!instance.hasChanged} />
          </Form>
          <ConfirmCancelEditPanel
            show={instance.cancelRequest}
            text={`There are some unsaved changes. ${instance.isNew?"Are you sure you want to cancel the creation of this instance?":"Are you sure you want to cancel the changes of this instance?"}`}
            onConfirm={this.handleConfirmCancelEdit}
            onCancel={this.handleContinueEditing}
            onConfirmBackLink={backLink}
            useConfirmBackLink={instance.isNew && isMainInstance}
            inline={!isMainInstance} />
          <SavingPanel id={this.props.id} show={instance.isSaving} inline={!isMainInstance} />
          <SaveErrorPanel show={instance.hasSaveError} error={instance.saveError} onCancel={this.handleCancelSave} onRetry={this.handleSave} inline={!isMainInstance} />
        </div>
        }
        <Glyphicon glyph="arrow-right" className="hightlightArrow" />
        <FetchingPanel id={this.props.id} show={instance.isFetching} inline={!isMainInstance} />
        <FetchErrorPanel id={this.props.id} show={instance.hasFetchError} error={instance.fetchError} onCancelBackLink={backLink} onRetry={this.fetchInstance} inline={!isMainInstance} />
      </div>
    );
  }
}