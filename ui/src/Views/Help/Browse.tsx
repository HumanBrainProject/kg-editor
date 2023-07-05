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

import React from 'react';

const Browse = () => (
  <div>
    <h1>Browse the Knowledge Graph</h1>
    <p>One of the key features of the KG Editor is to allow its users to find any instance they need.</p>
    <h2>Access the feature</h2>
    <p>To access the <code>Browse</code> feature, you can use either the always present tab at the top of the window, or the quick access button on the dashboard.</p>
    <p>
      <img className="screenshot" src={`${window.rootPath}/assets/Help/Browse/access.png`} alt="browse"/>
    </p>
  </div>
);

export default Browse;