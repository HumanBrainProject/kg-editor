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

import { extend } from "lodash";

class Style {
  [index:string]: string;
}

interface Background {
  gradient: Style;
  image: string;
  position?: string;
  size?: string;
}

interface ButtonStyle {
  active: Style;
  backgroundColor: string;
  borderColor: string;
}

interface Button {
  primary: ButtonStyle;
  secondary: ButtonStyle;
}

interface List {
  hover: Style;
  selected: Style;
}

interface Info {
  color: string;
  normal: Style;
}

interface Error {
  color: string;
  quiet: Style;
  normal: Style;
  loud: Style;
}

interface Warning {
  color: string;
  quiet: Style;
  normal: Style;
  loud: Style;
}

interface Selection {
  color: string;
  hover: Style;
}

interface QuietLink {
  hover: Style;
}

interface Link {
  hover: Style;
  quiet: QuietLink;
}

interface Pane {
  boxShadow: Style;
}

interface ReleaseStatus {
  boxShadow: Style;
  released: Style;
  notReleased: Style;
  hasChanged: Style;
}

interface Release {
  status: ReleaseStatus;
  highlight: Style;
}

interface BookmarkState {
  color: string;
  highlight: Style;
}

interface Bookmark {
  on: BookmarkState;
}

export interface Theme {
  name: string;
  background: Background;
  backgroundColor?: string;
  button: Button;
  contrast1: Style;
  contrast2: Style;
  contrast3: Style;
  contrast4: Style;
  contrast5: Style;
  contrast6: Style;
  blendContrast1: Style;
  list: List;
  quiet: Style;
  normal: Style;
  loud: Style;
  louder: Style;
  error: Error;
  warn: Warning;
  info: Info;
  selected: Selection;
  link: Link;
  pane: Pane;
  release: Release;
  bookmark: Bookmark;
}