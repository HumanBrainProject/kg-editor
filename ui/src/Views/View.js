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
import { observer } from "mobx-react-lite";
import { Route, Routes } from "react-router-dom";

import NotFound from "./NotFound";
import Home from "./Home";
import Help from "./Help";
import Browse from "./Browse";
import InstanceView from "./InstanceView";

const View = observer(() => {

  return (
    <Routes>
      <Route path="/instances/:id" element={<InstanceView mode="view" />} />
      <Route path="/instances/:id/create" element={<InstanceView mode="create" />} />
      <Route path="/instances/:id/edit" element={<InstanceView mode="edit" />} />
      <Route path="/instances/:id/graph" element={<InstanceView mode="graph" />} />
      <Route path="/instances/:id/release" element={<InstanceView mode="release" />} />
      <Route path="/instances/:id/manage"  element={<InstanceView mode="manage" />} />
      <Route path="/instances/:id/raw"  element={<InstanceView mode="raw" />} />

      <Route path="/browse" element={<Browse/>} />
      <Route path="/help/*" element={<Help/>} />
      <Route path="/" element={<Home/>} />
      <Route path="*" element={<NotFound/>} />
    </Routes>
  );
});
View.displayName = "View";

export default View;