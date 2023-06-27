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
import Button from "react-bootstrap/Button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import useStores from "../../Hooks/useStores";
import Sentry from "../../Services/Sentry";

const ContactTheSupport = () => {
  const { userProfileStore } = useStores();
  
  const handleErrorReport = () => {
    Sentry.showReportDialog({
      user: {
        email: userProfileStore.user?.email,
        name: `${userProfileStore.user?.name} (${userProfileStore.user?.username})`
      }
    });
  };

  return(
    <div>
      <h1>Contact us</h1>
      <p>Should you encounter any problem with this application, please contact our team by email at : <a href={"mailto:kg@ebrains.eu"}>kg@ebrains.eu</a></p>
      <Button variant={"warning"} onClick={handleErrorReport}>
        <FontAwesomeIcon icon={"envelope"} /> &nbsp; Send an error report
      </Button>
    </div>
  );
};

export default ContactTheSupport;