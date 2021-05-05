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

import React from "react";
import queryBuilderStore from "../../Stores/QueryBuilderStore";
import structureStore from "../../Stores/StructureStore";
import { observer } from "mobx-react";
import MultiToggle from "../../Components/MultiToggle";
import injectStyles from "react-jss";
import { FormControl, Button } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import ReactJson from "react-json-view";
import ThemeRJV from "./ThemeRJV";

const style = {
  container: {
    color: "var(--ft-color-normal)",
    "& input": {
      color: "black"
    },
    "& hr": {
      margin: "30px auto",
      maxWidth: "500px",
      borderTopColor: "var(--bg-color-ui-contrast4)"
    }
  },

  fields: {
    color: "var(--ft-color-loud)",
    "& h3": {
      fontSize: "1.7em",
      marginBottom: "10px",
      marginLeft: "10px",
      "& small": {
        color: "var(--ft-color-quiet)",
        fontStyle: "italic"
      }
    },
    "& .merge": {
      "& h3": {
        "& strong": {
          color: "greenyellow"
        }
      }
    }
  },

  property: {
    color: "var(--ft-color-loud)",
    fontWeight: "normal",
    cursor: "pointer",
    padding: "10px",
    margin: "1px",
    background: "var(--bg-color-ui-contrast1)",
    "& small": {
      color: "var(--ft-color-quiet)",
      fontStyle: "italic"
    },
    "&:hover": {
      background: "var(--bg-color-ui-contrast4)",
    }
  },

  fieldOptions: {
    background: "var(--bg-color-ui-contrast3)",
    margin: "-10px -10px 30px -10px",
    padding: "10px",
    position: "relative",
    "&::after": {
      display: "block",
      content: "''",
      position: "absolute",
      bottom: "-10px",
      left: "50%",
      marginLeft: "-10px",
      width: "20px",
      height: "20px",
      background: "var(--bg-color-ui-contrast3)",
      transform: "rotate(45deg)"
    }
  },

  option: {
    marginBottom: "20px",
    "&:last-child": {
      marginBottom: 0
    },
    "&.unsupported": {
      display: "flex",
      "& button": {
        alignSelf: "flex-start",
        display: "inline-block",
        margin: "0 5px 0 0",
        background: "var(--bg-color-ui-contrast1)",
        color: "var(--ft-color-loud)",
        borderColor: "var(--bg-color-ui-contrast1)",
        "&:hover": {
          background: "var(--bg-color-ui-contrast1)",
          color: "var(--ft-color-louder)",
          borderColor: "var(--bg-color-ui-contrast1)"
        }
      },
      "& $optionLabel": {
        alignSelf: "flex-start",
        display: "inline"
      },
      "& strong": {
        flex: 1,
        display: "inline-block",
        fontWeight: "normal",
        color: "var(--ft-color-loud)",
        "& .react-json-view": {
          backgroundColor: "transparent !important"
        }
      }
    }
  },
  optionLabel: {
    fontWeight: "bold",
    marginBottom: "5px",
    "& small": {
      fontWeight: "normal",
      fontStyle: "italic"
    },
    "& strong": {
      color: "var(--ft-color-loud)"
    }
  },
  stringValue: {
    color: "rgb(253, 151, 31)"
  },
  boolValue: {
    color: "rgb(174, 129, 255)"
  },
  intValue: {
    color: "rgb(204, 102, 51)"
  },
  floatValue: {
    color: "rgb(84, 159, 61)"
  },
  dateValue: {
    color: "rgb(45, 89, 168)"
  },
  typeValue: {
    fontSize: "11px",
    marginRight: "4px",
    opacity: "0.8"
  },
  aliasError: {
    marginTop: "6px",
    color: "var(--ft-color-error)"
  }
};

@injectStyles(style)
@observer
export default class Options extends React.Component {
  handleAddField(schema, e) {
    //Don't got to newly chosen field options if ctrl is pressed (or cmd)
    queryBuilderStore.addField(schema, queryBuilderStore.currentField, !e.ctrlKey && !e.metaKey);
  }

  handleAddMergeField(e) {
    //Don't got to newly chosen field options if ctrl is pressed (or cmd)
    queryBuilderStore.addMergeField(queryBuilderStore.currentField, !e.ctrlKey && !e.metaKey);
  }

  handleAddMergeChildField(schema, e) {
    //Don't got to newly chosen field options if ctrl is pressed (or cmd)
    queryBuilderStore.addMergeChildField(schema, queryBuilderStore.currentField, !e.ctrlKey && !e.metaKey);
  }

  handleChangeFlatten = value => {
    queryBuilderStore.currentField.isFlattened = !!value;
  }

  handleChangeName = e => {
    queryBuilderStore.currentField.setAlias(e.target.value);
  }

  handleChangeOption = (name, value) => {
    queryBuilderStore.currentField.setOption(name, value);
  }

  render() {
    const { classes } = this.props;

    return (
      <div className={classes.container}>
        <div className={classes.fieldOptions}>
          {queryBuilderStore.currentField !== queryBuilderStore.rootField
            && !queryBuilderStore.currentField.parent.isFlattened
            && (!queryBuilderStore.currentField.isMerge || queryBuilderStore.currentField.isRootMerge)
            && (
              <div className={classes.option}>
                {queryBuilderStore.currentField.isRootMerge ?
                  <div className={classes.optionLabel}>
                    <strong><FontAwesomeIcon transform="shrink-8" icon="asterisk" /></strong>Merge name
                  </div>
                  :
                  <div className={classes.optionLabel}>
                    Target name <small>(only applicable if parent field is not flattened)</small>
                  </div>
                }
                <div className={classes.optionInput}>
                  <FormControl type="text"
                    onChange={this.handleChangeName}
                    required={queryBuilderStore.currentField.isRootMerge}
                    value={queryBuilderStore.currentField.alias || ""}
                    placeholder={queryBuilderStore.currentField.getDefaultAlias()} />
                  {queryBuilderStore.currentField.aliasError && (
                    <div className={classes.aliasError}>
                      <FontAwesomeIcon icon="exclamation-triangle" />&nbsp;Empty value is not accepted
                    </div>
                  )}
                </div>
              </div>
            )
          }

          {queryBuilderStore.currentField.options.map(({ name, value }) => {
            if (name === "required") {
              return queryBuilderStore.currentField !== queryBuilderStore.rootField
                && !queryBuilderStore.currentField.parent.isFlattened
                && (!queryBuilderStore.currentField.isMerge || queryBuilderStore.currentField.isRootMerge)
                && (
                  <div key={name} className={classes.option}>
                    <div className={classes.optionLabel}>
                      Required <small>(only applicable if parent field is not flattened)</small>
                    </div>
                    <div className={classes.optionInput}>
                      <MultiToggle selectedValue={value} onChange={this.handleChangeOption.bind(this, name)}>
                        <MultiToggle.Toggle color={"var(--ft-color-loud)"} icon={"check"} value={true} />
                        <MultiToggle.Toggle color={"var(--ft-color-loud)"} icon={"times"} value={undefined} />
                      </MultiToggle>
                    </div>
                  </div>
                );
            } else if (name === "sort") {
              return queryBuilderStore.currentField !== queryBuilderStore.rootField
                && !(queryBuilderStore.currentFieldLookupsLinks && !!queryBuilderStore.currentFieldLookupsLinks.length)
                && !queryBuilderStore.currentField.isMerge
                && (
                  <div key={name} className={classes.option}>
                    <div className={classes.optionLabel}>
                      Sort <small>(enabling sort on this field will disable sort on other fields)</small>
                    </div>
                    <div className={classes.optionInput}>
                      <MultiToggle selectedValue={value} onChange={this.handleChangeOption.bind(this, name)}>
                        <MultiToggle.Toggle color={"var(--ft-color-loud)"} icon={"check"} value={true} />
                        <MultiToggle.Toggle color={"var(--ft-color-loud)"} icon={"times"} value={undefined} />
                      </MultiToggle>
                    </div>
                  </div>
                );
            } else if (name === "ensure_order") {
              return queryBuilderStore.currentField !== queryBuilderStore.rootField
                && (queryBuilderStore.currentFieldLookupsLinks && !!queryBuilderStore.currentFieldLookupsLinks.length)
                && !queryBuilderStore.currentField.parent.isFlattened
                && (!queryBuilderStore.currentField.isMerge || queryBuilderStore.currentField.isRootMerge)
                && (
                  <div key={name} className={classes.option}>
                    <div className={classes.optionLabel}>
                      Ensure original order <small>(only applicable if parent field is not flattened)</small>
                    </div>
                    <div className={classes.optionInput}>
                      <MultiToggle selectedValue={value} onChange={this.handleChangeOption.bind(this, name)}>
                        <MultiToggle.Toggle color={"var(--ft-color-loud)"} icon={"check"} value={true} />
                        <MultiToggle.Toggle color={"var(--ft-color-loud)"} icon={"times"} value={undefined} />
                      </MultiToggle>
                    </div>
                  </div>
                );
            } else if (value !== undefined && (!queryBuilderStore.currentField.isMerge || queryBuilderStore.currentField.isRootMerge)) {
              return (
                <div key={name} className={`${classes.option} unsupported`}>
                  <Button bsSize="xsmall" bsStyle="default" onClick={this.handleChangeOption.bind(this, name, undefined)} title={name === "merge" ? `"${name}" property cannot be deleted` : `delete property "${name}"`} disabled={name === "merge"} >
                    <FontAwesomeIcon icon="times" />
                  </Button>
                  <div className={classes.optionLabel}>{name}:&nbsp;</div>
                  <strong>
                    {typeof value === "string" ?
                      <div className={classes.stringValue}><span className={classes.typeValue}>string</span>&quot;{value}&quot;</div>
                      :
                      typeof value === "boolean" ?
                        <div className={classes.boolValue}><span className={classes.typeValue}>bool</span>{value ? "true" : "false"}</div>
                        :
                        typeof value === "number" ?
                          Number.isInteger(value) ?
                            <div className={classes.intValue}><span className={classes.typeValue}>int</span>{value}</div>
                            :
                            <div className={classes.floatValue}><span className={classes.typeValue}>float</span>{value}</div>
                          :
                          <ReactJson collapsed={true} name={false} theme={ThemeRJV} src={value} enableClipboard={false} />
                    }
                  </strong>
                </div>
              );
            } else {
              return null;
            }
          })}

          {queryBuilderStore.currentField !== queryBuilderStore.rootField
            && (queryBuilderStore.currentFieldLookupsLinks && !!queryBuilderStore.currentFieldLookupsLinks.length)
            && queryBuilderStore.currentField.fields.length === 1
            && !queryBuilderStore.currentField.isMerge
            && (
              <div className={classes.option}>
                <div className={classes.optionLabel}>
                  Flatten <small>(only applicable if this field has only one child field)</small>
                </div>
                <div className={classes.optionInput}>
                  <MultiToggle selectedValue={queryBuilderStore.currentField.isFlattened} onChange={this.handleChangeFlatten}>
                    <MultiToggle.Toggle color={"var(--ft-color-loud)"} icon={"check"} value={true} />
                    <MultiToggle.Toggle color={"var(--ft-color-loud)"} icon={"times"} value={false} />
                  </MultiToggle>
                </div>
              </div>
            )}
        </div>

        {!queryBuilderStore.currentField.isMerge
          && queryBuilderStore.currentField !== queryBuilderStore.rootFields
          && (queryBuilderStore.currentFieldLookupsLinks && !!queryBuilderStore.currentFieldLookupsLinks.length)
          && (
            <div className={classes.option}>
              <div className={classes.optionLabel}>
                <Button onClick={this.handleAddMergeField.bind(this)}>Add a merge field</Button>
              </div>
            </div>
          )}

        {queryBuilderStore.currentField.isRootMerge
          && queryBuilderStore.currentField !== queryBuilderStore.rootField
          && (
            <div className={classes.fields}>
              {queryBuilderStore.currentFieldParentLookupsAttributes.map(({ id, label, properties }) => (
                <div className="merge" key={id}>
                  <h3><strong>Merge</strong> attributes valid for {label} <small> - {id}</small></h3>
                  {properties.map(propSchema => (
                    <div className={classes.property} key={propSchema.attribute + (propSchema.reverse ? "reverse" : "")} onClick={this.handleAddMergeChildField.bind(this, propSchema)}>
                      {propSchema.label} - <small>{propSchema.attribute}</small>
                    </div>
                  ))}
                </div>
              ))}

              {queryBuilderStore.currentFieldParentLookupsLinks.map(({ id, label, properties }) => (
                <div className="merge" key={id}>
                  <h3><strong>Merge</strong> links valid for {label} <small> - {id}</small></h3>
                  {properties.map(propSchema => (
                    <div className={classes.property} key={propSchema.attribute + (propSchema.reverse ? "reverse" : "")} onClick={this.handleAddMergeChildField.bind(this, propSchema)}>
                      {propSchema.label} - <small>{propSchema.attribute}</small>
                      &nbsp;&nbsp;( can be: {propSchema.canBe.map(schemaId => structureStore.findSchemaById(schemaId).label).join(", ")} )
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )
        }

        {(!queryBuilderStore.currentField.isFlattened
          || (queryBuilderStore.currentField.isMerge
            && (queryBuilderStore.currentField.isRootMerge
              || (!queryBuilderStore.currentField.isRootMerge && (!queryBuilderStore.currentField.fields || !queryBuilderStore.currentField.fields.length))
            )
          )
        ) && (
          <div className={classes.fields}>
            {queryBuilderStore.currentFieldLookupsAttributes.map(({ id, label, properties }) => (
              <div key={id}>
                <h3>Attributes valid for {label} <small> - {id}</small></h3>
                {properties.map(propSchema => (
                  <div className={classes.property} key={propSchema.attribute + (propSchema.reverse ? "reverse" : "")} onClick={this.handleAddField.bind(this, propSchema)}>
                    {propSchema.label} - <small>{propSchema.attribute}</small>
                  </div>
                ))}
              </div>
            ))}

            {queryBuilderStore.currentFieldLookupsLinks.map(({ id, label, properties }) => (
              <div key={id}>
                <h3>Links valid for {label} <small> - {id}</small></h3>
                {properties.map(propSchema => (
                  <div className={classes.property} key={propSchema.attribute + (propSchema.reverse ? "reverse" : "")} onClick={this.handleAddField.bind(this, propSchema)}>
                    {propSchema.label} - <small>{propSchema.attribute}</small>
                    &nbsp;&nbsp;( can be: {propSchema.canBe.map(schemaId => structureStore.findSchemaById(schemaId).label).join(", ")} )
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }
}