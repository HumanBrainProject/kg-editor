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

const Save = () => (
  <div>
    <h1>Saving instances</h1>
    <p>When you have made modifications on instances, these will be listed in the “Unsaved instances” panel on the right of the screen, visible on any of the view mode of an instance, or accessible through the corresponding button in the bottom right corner of the application on any other feature.</p>
    <p>If unsaved modifications exist, the application will try to prevent any unwanted loss of your current work by showing a confirmation box if you or your browser try to leave or reload the application.</p>
    <p>
      <img className="screenshot" src={`${window.rootPath}/assets/Help/OpenAnInstance/Edit/Save/unsaved-instances.png`} alt="unsaved instances"/>
    </p>

    <h2>Save all modifications</h2>
    <p>Use the “Save All” button to quickly save all the modifications made on instances. All successfully saved instances will disappear from that list.</p>
    <p>
      <img className="screenshot" src={`${window.rootPath}/assets/Help/OpenAnInstance/Edit/Save/save-all.png`} alt="save all"/>
    </p>

    <h2>Instance specific actions</h2>
    <p>If you want to handle more granular actions on the modifications you can use the different action buttons along every unsaved instance.</p>

    <h3>Save an instance</h3>
    <p>Use this button to save only this specific instance.</p>
    <p>
      <img className="screenshot" src={`${window.rootPath}/assets/Help/OpenAnInstance/Edit/Save/save.png`} alt="save"/>
    </p>

    <h3>Revert changes</h3>
    <p>Use this button to revert the changes made to this specific instance. Please be aware that all the changes made on the corresponding instance will be lost.</p>
    <p>
      <img className="screenshot" src={`${window.rootPath}/assets/Help/OpenAnInstance/Edit/Save/revert.png`} alt="revert"/>
    </p>

    <h3>Review changes</h3>
    <p>Use this button to review the changes you made on this instance. The application will show you a window with a visual diff of those changes.</p>
    <p>
      <img className="screenshot" src={`${window.rootPath}/assets/Help/OpenAnInstance/Edit/Save/review.png`} alt="review"/>
    </p>
    <p>
      <img className="screenshot" src={`${window.rootPath}/assets/Help/OpenAnInstance/Edit/Save/changes.png`} alt="changes"/>
    </p>

    <h2>Releasing the changes</h2>
    <p>Once your changes have been saved, they are not immediately visible in the public API. For this to happen, your changed/created instances need to be released through the “Release” feature. Please see the corresponding section to get more informations on how to release instances.</p>
  </div>
);

export default Save;