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

import { library } from "@fortawesome/fontawesome-svg-core";

import {faUser} from "@fortawesome/free-solid-svg-icons/faUser";
import {faUserLock} from "@fortawesome/free-solid-svg-icons/faUserLock";
import {faUserEdit} from "@fortawesome/free-solid-svg-icons/faUserEdit";
import {faUserCheck} from "@fortawesome/free-solid-svg-icons/faUserCheck";
import {faUserClock} from "@fortawesome/free-solid-svg-icons/faUserClock";
import {faUserPlus} from "@fortawesome/free-solid-svg-icons/faUserPlus";
import {faQuestion} from "@fortawesome/free-solid-svg-icons/faQuestion";
import {faQuestionCircle} from "@fortawesome/free-solid-svg-icons/faQuestionCircle";
import {faHome} from "@fortawesome/free-solid-svg-icons/faHome";
import {faSearch} from "@fortawesome/free-solid-svg-icons/faSearch";
import {faCamera} from "@fortawesome/free-solid-svg-icons/faCamera";
import {faCaretRight} from "@fortawesome/free-solid-svg-icons/faCaretRight";
import {faCaretDown} from "@fortawesome/free-solid-svg-icons/faCaretDown";
import {faCircleNotch} from "@fortawesome/free-solid-svg-icons/faCircleNotch";
import {faCircle} from "@fortawesome/free-solid-svg-icons/faCircle";
import {faTimes} from "@fortawesome/free-solid-svg-icons/faTimes";
import {faUndo} from "@fortawesome/free-solid-svg-icons/faUndo";
import {faUndoAlt} from "@fortawesome/free-solid-svg-icons/faUndoAlt";
import {faSave} from "@fortawesome/free-solid-svg-icons/faSave";
import {faSyncAlt} from "@fortawesome/free-solid-svg-icons/faSyncAlt";
import {faEdit} from "@fortawesome/free-solid-svg-icons/faEdit";
import {faProjectDiagram} from "@fortawesome/free-solid-svg-icons/faProjectDiagram";
import {faCloudUploadAlt} from "@fortawesome/free-solid-svg-icons/faCloudUploadAlt";
import {faChartBar} from "@fortawesome/free-solid-svg-icons/faChartBar";
import {faCode} from "@fortawesome/free-solid-svg-icons/faCode";
import {faCodeBranch} from "@fortawesome/free-solid-svg-icons/faCodeBranch";
import {faPencilAlt} from "@fortawesome/free-solid-svg-icons/faPencilAlt";
import {faEye} from "@fortawesome/free-solid-svg-icons/faEye";
import {faGlobe} from "@fortawesome/free-solid-svg-icons/faGlobe";
import {faExclamationTriangle} from "@fortawesome/free-solid-svg-icons/faExclamationTriangle";
import {faUnlink} from "@fortawesome/free-solid-svg-icons/faUnlink";
import {faBan} from "@fortawesome/free-solid-svg-icons/faBan";
import {faRedoAlt} from "@fortawesome/free-solid-svg-icons/faRedoAlt";
import {faMoneyCheck} from "@fortawesome/free-solid-svg-icons/faMoneyCheck";
import {faThumbsUp} from "@fortawesome/free-solid-svg-icons/faThumbsUp";
import {faCheck} from "@fortawesome/free-solid-svg-icons/faCheck";
import {faFile} from "@fortawesome/free-solid-svg-icons/faFile";
import {faPlus} from "@fortawesome/free-solid-svg-icons/faPlus";
import {faDotCircle} from "@fortawesome/free-solid-svg-icons/faDotCircle";
import {faArrowRight} from "@fortawesome/free-solid-svg-icons/faArrowRight";
import {faArrowUp} from "@fortawesome/free-solid-svg-icons/faArrowUp";
import {faArrowDown} from "@fortawesome/free-solid-svg-icons/faArrowDown";
import {faExpandArrowsAlt} from "@fortawesome/free-solid-svg-icons/faExpandArrowsAlt";
import {faCompress} from "@fortawesome/free-solid-svg-icons/faCompress";
import {faEyeSlash} from "@fortawesome/free-solid-svg-icons/faEyeSlash";
import {faExclamationCircle} from "@fortawesome/free-solid-svg-icons/faExclamationCircle";
import {faEnvelope} from "@fortawesome/free-solid-svg-icons/faEnvelope";
import {faSun} from "@fortawesome/free-solid-svg-icons/faSun";
import {faMoon} from "@fortawesome/free-solid-svg-icons/faMoon";
import {faStar} from "@fortawesome/free-solid-svg-icons/faStar";
import {faTrashAlt} from "@fortawesome/free-solid-svg-icons/faTrashAlt";
import {faLightbulb} from "@fortawesome/free-solid-svg-icons/faLightbulb";
import {faFolderOpen} from "@fortawesome/free-solid-svg-icons/faFolderOpen";
import {faGlasses} from "@fortawesome/free-solid-svg-icons/faGlasses";
import {faTimesCircle} from "@fortawesome/free-solid-svg-icons/faTimesCircle";
import {faAngleDown} from "@fortawesome/free-solid-svg-icons/faAngleDown";
import {faAngleDoubleRight} from "@fortawesome/free-solid-svg-icons/faAngleDoubleRight";
import {faCog} from "@fortawesome/free-solid-svg-icons/faCog";
import {faCogs} from "@fortawesome/free-solid-svg-icons/faCogs";
import {faAngleRight} from "@fortawesome/free-solid-svg-icons/faAngleRight";
import {faCopy} from "@fortawesome/free-solid-svg-icons/faCopy";
import {faPlusSquare} from "@fortawesome/free-solid-svg-icons/faPlusSquare";
import {faLongArrowAltRight} from "@fortawesome/free-solid-svg-icons/faLongArrowAltRight";
import {faShoppingCart} from "@fortawesome/free-solid-svg-icons/faShoppingCart";
import {faPollH} from "@fortawesome/free-solid-svg-icons/faPollH";
import {faSatelliteDish} from "@fortawesome/free-solid-svg-icons/faSatelliteDish";
import {faBlenderPhone} from "@fortawesome/free-solid-svg-icons/faBlenderPhone";
import {faTable} from "@fortawesome/free-solid-svg-icons/faTable";
import {faAsterisk} from "@fortawesome/free-solid-svg-icons/faAsterisk";
import {faLevelDownAlt} from "@fortawesome/free-solid-svg-icons/faLevelDownAlt";
import {faSitemap} from "@fortawesome/free-solid-svg-icons/faSitemap";
import {faInfoCircle} from "@fortawesome/free-solid-svg-icons/faInfoCircle";

library.add(
  faUser,
  faUserLock,
  faUserEdit,
  faUserCheck,
  faUserClock,
  faUserPlus,
  faQuestion,
  faQuestionCircle,
  faHome,
  faSearch,
  faCamera,
  faCaretRight,
  faUndo,
  faUndoAlt,
  faSave,
  faSyncAlt,
  faCaretDown,
  faCircleNotch,
  faCircle,
  faTimes,
  faEdit,
  faProjectDiagram,
  faCloudUploadAlt,
  faChartBar,
  faCode,
  faCodeBranch,
  faPencilAlt,
  faEye,
  faEyeSlash,
  faExclamationTriangle,
  faUnlink,
  faBan,
  faRedoAlt,
  faMoneyCheck,
  faThumbsUp,
  faCheck,
  faFile,
  faPlus,
  faDotCircle,
  faArrowRight,
  faArrowUp,
  faArrowDown,
  faExpandArrowsAlt,
  faCompress,
  faExclamationCircle,
  faEnvelope,
  faSun,
  faMoon,
  faStar,
  faTrashAlt,
  faLightbulb,
  faFolderOpen,
  faGlasses,
  faTimesCircle,
  faAngleDown,
  faAngleDoubleRight,
  faCog,
  faCogs,
  faAngleRight,
  faCopy,
  faPlusSquare,
  faLongArrowAltRight,
  faShoppingCart,
  faPollH,
  faSatelliteDish,
  faBlenderPhone,
  faTable,
  faAsterisk,
  faLevelDownAlt,
  faSitemap,
  faGlobe,
  faInfoCircle
);