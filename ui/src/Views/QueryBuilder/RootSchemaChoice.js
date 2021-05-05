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
import injectStyles from "react-jss";

let style = {
  container: {
    color: "var(--ft-color-loud)"
  },
  schemaSelectGroup: {
    fontSize: "1.25em",
    fontWeight: "bold",
    marginBottom: "10px",
    "& h3": {
      paddingLeft: "10px"
    }
  },
  schemaSelectSchema: {
    fontSize: "0.8em",
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
};

@observer
@injectStyles(style)
export default class RootSchemaChoice extends React.Component {
  handleSelectRootSchema = (schema) => {
    queryBuilderStore.selectRootSchema(schema);
  }

  render() {
    const { classes } = this.props;
    return (
      <div className={classes.container}>
        {structureStore.sortedGroupedSchemas.map(group => {
          return (
            <div className={classes.schemaSelectGroup} key={group}>
              <h3>{group}</h3>
              <div>
                {structureStore.getSortedSchemasByGroup(group).map(schema => {
                  return (
                    <div className={classes.schemaSelectSchema} key={schema.id} onClick={this.handleSelectRootSchema.bind(this, schema)}>
                      {schema.label} - <small>{schema.id}</small>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    );
  }
}