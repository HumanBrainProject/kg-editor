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
import Button from "react-bootstrap/Button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import * as Sentry from "@sentry/browser";

const HelpView = () => {
  const handleErrorReport = () => {
    const error = new Error("User feedback error report."); //We generate a custom error as report dialog is only linked to an error.
    Sentry.captureException(error);
    Sentry.showReportDialog({
      title: "An unexpected error has occured.",
      subtitle2: "We recommend you to save all your changes and reload the application in your browser. The KG team has been notified. If you'd like to help, tell us what happened below.",
      labelEmail: "Email(optional)",
      labelName: "Name(optional)",
      user: {
        email: "error@kgeditor.com",
        name: "Error Reporter"
      },
      labelComments: "Please fill in a description of your error use case"
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

export default HelpView;