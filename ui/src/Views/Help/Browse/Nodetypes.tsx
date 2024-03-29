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

const Nodetypes = () => (
  <div>
    <h1>Browse by node type</h1>

    <p>In the search screen, you can browse the Knowledge Graph instances by node types. All of them are regrouped in two folders. </p>

    <h3>Common node types</h3>
    <p>In the “common node types”, you will find the most frequently used node types (e.g. : the “Dataset” node type). </p>
    <p>
      <img className="screenshot" src={`${window.rootPath}/assets/Help/Browse/Nodetypes/common-types.png`} alt="common"/>
    </p>

    <h3>Other node types</h3>
    <p>The “other node types” folder contains node types that most of the time, you won’t probably want to create or edit directly.</p>
    <p>
      <img className="screenshot" src={`${window.rootPath}/assets/Help/Browse/Nodetypes/other-types.png`} alt="other types"/>
    </p>

    <h3>Create a new instance of a node type</h3>
    <p>This screen also lets you create an instance of a node type. When you hover a node type in the lists, a “+” button will appear. Click on it, and it will create a new instance of that datatype and open it in edit mode (See the “Open an instance” section for information about the different modes of opening instances).</p>

    <h2>Instances list</h2>
    <p>When you select a node type, it will show the list of corresponding instances. Scroll down this panel to load more items to the list.</p>
    <p>
      <img className="screenshot" src={`${window.rootPath}/assets/Help/Browse/Nodetypes/instances.png`} alt="instances"/>
    </p>

    <p>You can filter the results on their name by using the filter input.</p>
    <p>
      <img className="screenshot" src={`${window.rootPath}/assets/Help/Browse/Nodetypes/filter.png`} alt="filter"/>
    </p>

    <h2>Instance preview</h2>
    <p>Clicking on an item of the instances list will show you a preview of this instance content. From there you can open instances in different modes (see the “Open an instance” section of this help to learn more about this feature)</p>
    <p>
      <img className="screenshot" src={`${window.rootPath}/assets/Help/Browse/Nodetypes/preview.png`} alt="preview"/>
    </p>

    <p>If you need to access frequently the same instances, you can create your own bookmark lists. Please consult the corresponding help section to learn more about the bookmarks feature.</p>
  </div>
);

export default Nodetypes;