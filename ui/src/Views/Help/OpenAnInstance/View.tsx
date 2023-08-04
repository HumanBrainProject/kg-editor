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

const View = () => (
  <div>
    <h1>View an instance</h1>
    <p>That feature is made of scrolling panels, flowing form left to right. Each panel represents a level of depth in the graph relations of the opened instance, this one being the first panel. </p>
    <p>
      <img className="screenshot" src={`${window.rootPath}/assets/Help/OpenAnInstance/View/panels.png`} alt="instance view" />
    </p>

    <p>You can hover a panel to have a look at it.click on it to bring it at the center. </p>
    <p>
      <img className="screenshot" src={`${window.rootPath}/assets/Help/OpenAnInstance/View/hover.png`} alt="instance overing" />
    </p>

    <p>If you click on an instance in that panel will then show a following panel containing the children instances of the clicked instance (given it has some). Clicking an instance will also reveal all the values of that instance and a button in the footer allowing you to open that instance in a new tab.</p>
    <p>
      <img className="screenshot" src={`${window.rootPath}/assets/Help/OpenAnInstance/View/linked-instances.png`} alt="linked instances" />
    </p>

    <p>Hovering a value of an instance that is a linked instance will highlight it in the next panel. Clicking on that value will bring the next panel in the center and automatically select that instance.</p>
    <p>
      <img className="screenshot" src={`${window.rootPath}/assets/Help/OpenAnInstance/View/value-hover.png`} alt="value hovering" />
    </p>
  </div>
);

export default View;