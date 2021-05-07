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

import Pane from "./Pane";
import InstanceForm from "./InstanceForm";

import { useStores } from "../../Hooks/UseStores";

const useStyles = createUseStyles({
  pane: {
    position: "relative"
  }
});

const Links = observer(({ instanceId }) => {

  const classes = useStyles();

  const { instanceStore, viewStore } = useStores();

  const instance = instanceStore.instances.get(instanceId);
  if (!instance) {
    return null;
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => fetchInstance(), [instanceId]);

  const fetchInstance = (forceFetch = false) => {
    if (instanceId) {
      const instance = instanceStore.createInstanceOrGet(instanceId);
      instance.fetch(forceFetch);
    }
  };

  const groups = instance.childrenIdsGroupedByField;
  if (!groups.length) {
    return null;
  }

  const view = viewStore.selectedView;
  const paneId = `ChildrenOf${instanceId}`;
  const path = view.instancePath;
  const index = path.findIndex(id => id === instanceId);
  const childInstanceId = (index >=0 && path.length>index+1)?path[index+1]:null;
  return (
    <>
      <Pane className={classes.pane} paneId={paneId}>
        {groups.map(group => (
          <div key={group.label} data-provenance={group.label}>
            <h4>{group.label}{group.pagination?
              <em style={{fontWeight:"lighter"}}>
                      (showing {group.pagination.count} out of {group.pagination.total})</em>:null}
            </h4>
            {group.ids.map(id => (
              <InstanceForm key={id} view={view} pane={paneId} id={id} provenance={group.label} />
            ))}
          </div>
        ))}
      </Pane>
      {childInstanceId && <DecoratedLinks instanceId={childInstanceId} />}
    </>
  );
});
Links.displayName = "Links";

const DecoratedLinks = Links;
export default DecoratedLinks;