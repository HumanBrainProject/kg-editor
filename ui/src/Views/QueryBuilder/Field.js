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
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Button } from "react-bootstrap";

import Fields from "./Fields";
import queryBuilderStore from "../../Stores/QueryBuilderStore";
import structureStore from "../../Stores/StructureStore";

let styles = {
  container: {
    position: "relative",
    "&::before": {
      display: "block",
      content: "''",
      position: "absolute",
      left: "10px",
      width: "0",
      height: "calc(100% - 20px)",
      borderLeft: "1px dashed #ccc"
    },
    "&::after": {
      display: "block",
      content: "''",
      position: "absolute",
      left: "-9px",
      top: "20px",
      width: "10px",
      height: "0",
      borderTop: "1px dashed #ccc"
    },
    "&.has-flattened-parent::after": {
      borderTop: "3px solid #40a9f3"
    },
    "&.parent-is-root-merge": {
      "&::before": {
        marginLeft: "10px"
      },
      "& > $label": {
        marginLeft: "10px"
      },
      "& > $subFields": {
        marginLeft: "10px"
      }
    }
  },
  verticalLineExtraPath: {
    display: "block",
    content: "''",
    position: "absolute",
    top: "-1px",
    left: "-11px",
    width: "0",
    height: "24px",
    borderLeft: "3px solid #40a9f3"
  },
  label: {
    padding: "10px",
    margin: "1px",
    backgroundColor: "var(--bg-color-ui-contrast1)",
    position: "relative",
    zIndex: 2,
    cursor: "pointer",
    "&:hover": {
      backgroundColor: "var(--bg-color-ui-contrast4)",
      "& $optionsButton": {
        opacity: 1
      }
    },
    "&.selected": {
      backgroundColor: "var(--bg-color-ui-contrast4)",
      "& $optionsButton": {
        opacity: 1
      }
    },
    "&.is-unknown": {
      backgroundColor: "var(--bg-color-warn-quiet)",
      "&&.selected": {
        backgroundColor: "var(--bg-color-warn-normal)"
      },
      "&:hover, &.selected:hover": {
        backgroundColor: "var(--bg-color-warn-loud)"
      }
    },
    "&.is-invalid, &.is-unknown.is-invalid": {
      backgroundColor: "var(--bg-color-error-quiet)",
      "&&.selected": {
        backgroundColor: "var(--bg-color-error-normal)"
      },
      "&:hover, &.selected:hover": {
        backgroundColor: "var(--bg-color-error-loud)"
      }
    }
  },
  merge: {
    color: "greenyellow",
    "& svg": {
      transform: "scale(2) rotateZ(90deg)"
    }
  },
  parentIsRootMerge: {
    position: "absolute",
    width: "6px",
    height: "6px",
    marginTop: "7px",
    marginLeft: "-16px",
    background: "greenyellow",
    color: "greenyellow",
    "& svg": {
      transform: "scaleX(1.1) translate(-12px, -7px)rotateZ(180deg)"
    }
  },
  required: {
    color: "var(--ft-color-louder)"
  },
  rename: {
    color: "var(--ft-color-louder)",
    fontWeight: "bold"
  },
  defaultname: {
    color: "var(--ft-color-normal)",
    fontStyle: "italic"
  },
  subFields: {
    paddingLeft: "20px"
  },
  optionsButton: {
    position: "absolute",
    right: "10px",
    top: "9px",
    opacity: 0.25
  }
};

@injectStyles(styles)
@observer
export default class Field extends React.Component {
  handleSelectField = () => {
    queryBuilderStore.selectField(this.props.field);
  }

  handleRemoveField = (e) => {
    e.stopPropagation();
    queryBuilderStore.removeField(this.props.field);
  }

  render() {
    const { classes, field } = this.props;

    const isFlattened = field.isFlattened;
    const hasFlattenedParent = field.parent && field.parent.isFlattened;

    return (
      <div className={`${classes.container} ${field.isMerge ? "is-merge" : ""} ${field.isRootMerge ? "is-root-merge" : ""} ${field.isMerge && !field.isRootMerge ? "is-child-merge" : ""} ${(field.isMerge && field.parentIsRootMerge) ? "parent-is-root-merge" : ""} ${isFlattened ? "flattened" : ""} ${hasFlattenedParent ? "has-flattened-parent" : ""}`}>
        {hasFlattenedParent &&
          <div className={classes.verticalLineExtraPath}></div>
        }
        <div className={`${classes.label} ${field.isUnknown ? "is-unknown" : ""} ${(field.isInvalid || field.aliasError) ? "is-invalid" : ""} ${field === queryBuilderStore.currentField ? "selected" : ""}`} onClick={this.handleSelectField}>
          {field.isMerge && field.parentIsRootMerge && (
            <div className={classes.parentIsRootMerge}>
              <FontAwesomeIcon icon="long-arrow-alt-right" />
            </div>
          )}
          {field.isFlattened && (!field.isMerge || (field.fields && !!field.fields.length)) && (
            <span className={classes.required}>
              <FontAwesomeIcon transform="flip-h" icon="level-down-alt" />&nbsp;&nbsp;
            </span>
          )}
          {field.getOption("required") && (
            <span className={classes.required}>
              <FontAwesomeIcon transform="shrink-8" icon="asterisk" />&nbsp;&nbsp;
            </span>
          )}
          {field.isRootMerge ?
            <React.Fragment>
              <span className={classes.merge} title="merge">
                <FontAwesomeIcon transform="shrink-8" icon="sitemap" />
              </span>
              {!field.parent && (
                <React.Fragment>
                  &nbsp;&nbsp;{field.schema.label}&nbsp;
                  {field.schema.canBe && !!field.schema.canBe.length && (
                    <span className={classes.canBe}>
                      ( {field.schema.canBe.map(schemaId => {
                        const schema = structureStore.findSchemaById(schemaId);
                        return (
                          <React.Fragment key={schemaId}>
                            <span title={schemaId}>{(schema && schema.label) || schemaId}</span>&nbsp;
                          </React.Fragment>
                        );
                      })} )
                    </span>
                  )}
                </React.Fragment>
              )}
            </React.Fragment>
            :
            field.isUnknown ?
              field.schema.simpleAttributeName ?
                <React.Fragment>
                  {field.schema.simpleAttributeName}&nbsp;
                  <span className={classes.canBe} title={field.schema.attribute}>( {field.schema.attributeNamespace ? field.schema.attributeNamespace : field.schema.attribute} )</span>
                </React.Fragment>
                :
                field.schema.attribute
              :
              <React.Fragment>
                {field.schema.label}&nbsp;
                {!field.isRootMerge && field.schema.canBe && !!field.schema.canBe.length && (
                  <span className={classes.canBe}>
                    ( {field.schema.canBe.map(schemaId => {
                      const schema = structureStore.findSchemaById(schemaId);
                      return (
                        <React.Fragment key={schemaId}>
                          <span title={schemaId}>{(schema && schema.label) || schemaId}</span>&nbsp;
                        </React.Fragment>
                      );
                    })} )
                  </span>
                )}
              </React.Fragment>
          }
          {field.parent && !field.parent.isFlattened && (!field.isMerge || field.isRootMerge) && (
            field.alias ?
              <span className={classes.rename}>
                &nbsp;&nbsp;<FontAwesomeIcon icon="long-arrow-alt-right" />&nbsp;&nbsp;
                {field.alias}
              </span>
              :
              <span className={classes.defaultname}>
                &nbsp;&nbsp;<FontAwesomeIcon icon="long-arrow-alt-right" />&nbsp;&nbsp;
                {field.getDefaultAlias()}
              </span>
          )}
          <div className={classes.optionsButton}>
            <Button bsSize={"xsmall"} bsStyle={"primary"} onClick={this.handleRemoveField}>
              <FontAwesomeIcon icon="times" />
            </Button>
          </div>
        </div>
        <div className={classes.subFields}>
          <Fields field={field} />
        </div>
      </div>
    );
  }
}