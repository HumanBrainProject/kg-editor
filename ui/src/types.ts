/*  Copyright 2018 - 2021 Swiss Federal Institute of Technology Lausanne (EPFL)
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *  http://www.apache.org/licenses/LICENSE-2.0.
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 *
 *  This open source software code was developed in part or in whole in the
 *  Human Brain Project, funded from the European Union's Horizon 2020
 *  Framework Programme for Research and Innovation under
 *  Specific Grant Agreements No. 720270, No. 785907, and No. 945539
 *  (Human Brain Project SGA1, SGA2 and SGA3).
 *
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
 *
 */
import type { IconProp } from '@fortawesome/fontawesome-svg-core';
import type { BrowserOptions } from '@sentry/browser';
import { LinkObject, NodeObject } from 'force-graph';
import type { KeycloakConfig } from 'keycloak-js';
import type { PiwikOptions } from 'react-piwik';

export type UUID = string;

export type ViewMode = 'view' | 'edit' | 'graph' | 'manage' | 'release' | 'create' | 'raw';

export enum ReleaseStatus{
  UNRELEASED = "UNRELEASED",
  HAS_CHANGED = "HAS_CHANGED",
  RELEASED = "RELEASED" 
}
export interface Settings {
  commit: string;
  keycloak: KeycloakConfig;
  matomo?: PiwikOptions;
  sentry?: BrowserOptions;
}

export interface Permissions {
  canCreate: boolean;
  canInviteForReview: boolean;
  canDelete: boolean;
  canInviteForSuggestion: boolean;
  canRead: boolean;
  canSuggest: boolean;
  canWrite: boolean;
  canRelease: boolean;
}

export interface Space {
  id: string;
  name: string;
  autorelease: boolean;
  clientSpace: boolean;
  internalSpace: boolean;
  permissions: Permissions;
}

export interface UserProfile extends UserSummary {
  givenName: string;
  familyName: string;
  email: string;
  spaces: Space[];
}

export interface UserSummary {
  id: string;
  username: string;
  name: string;
  picture?: string;
}

export type Stage = 'IN_PROGRESS' | 'RELEASED';

export interface KGCoreError {
  code: number;
  message: string;
  instanceId: UUID;
}

export interface KGCoreResult<T> {
  data: T;
  message: string;
  error: KGCoreError;
  total: number;
  size: number;
  from: number;
}

export interface SearchFilter {
  queryString: string;
  excludedUsers: string[];
}


export interface SimpleType {
  name: string;
  description: string;
  label: string;
  color: string;
  labelField?: string;
}

export interface SimpleTypeWithSpaces extends SimpleType {
  space: Space[];
}

export interface Suggestion {
  id: string;
  name: string;
  additionalInformation: string;
  type: SimpleTypeWithSpaces;
  space: Space;
  isNew?: boolean;
  isExternal?: boolean;
}

export interface StructureOfType {
  label: string;
  name: string;
  description: string;
  color: string;
  labelField: string;
  embeddedOnly: boolean;
  fields: Map<string, StructureOfField>;
  promotedFields: string[];
  incomingLinks: Map<string, StructureOfIncomingLink>;
  canCreate: boolean;
  isSupported?: boolean;
}

export interface StructureOfField {
  alternatives: Alternative[];
  fullyQualifiedName: string;
  numOfOccurrences: number;
  order: number;
  name: string;
  label: string;
  widget: string;
  regex: string;
  maxLength: number;
  minItems: number;
  maxItems: number;
  minValue: number;
  maxValue: number;
  labelTooltip: string;
  searchable: boolean;
  required: boolean;
  readOnly: boolean;
  fields: Map<string, StructureOfField>;
  value: object; // or array?
  defaultTargetType: string;
  targetTypes: SimpleType[];
  validation: ValidationRule[];
  warning: string;
}
export interface StructureOfIncomingLink {
  fullyQualifiedName: string;
  sourceTypes: SourceType[];
}
export interface SourceType {
  type: SimpleType;
  spaces: string[];
}
export interface ValidationRule {
  regex: string;
  errorMessage: string;
}

export interface InstanceLabel {
  space: string;
  types: SimpleType[];
  id: UUID;
  name: string;
  error: Error;
}

export interface InstanceSummary extends InstanceLabel {
  permissions: Permissions;
  fields: Map<string, StructureOfField>;
}

export interface InstanceFull extends InstanceSummary {
  alternatives: Map<string, Alternative[]>;
  labelField: string;
  promotedFields: string[];
  incomingLinks: Map<string, Map<string, IncomingLinksByType>>;
  possibleIncomingLinks: Map<string, StructureOfIncomingLink>;
}

export interface Alternatives {
  [key: string]: Alternative[];
}

export interface Alternative {
  value: any;
  selected: boolean;
  users: UserSummary[];
}

export interface IncomingLinksByType {
  label: string;
  color: string;
  data: IncomingLink[];
  total: number;
  from: number;
  size: number;
  nameForReverseLink: string;
}

export interface InstanceIncomingLink {
  instanceId: string;
  property: string;
  type: SimpleType;
  instances: InstanceLabel[];
  from: number;
  size: number;
  total: number;
  isFetching: boolean;
  fetchError?: string;
}

export interface InstanceIncomingLinkFull {
  property: string;
  label: string;
  links: InstanceIncomingLink[];
}

export interface IncomingLink {
  id: UUID;
  label: string;
  space: string;
}

export interface Error {
  code: number;
  message: string;
  instanceId: UUID;
}

export interface SuggestionStructure {
  suggestions: KGCoreResult<Suggestion[]>;
  types: Map<string, SimpleTypeWithSpaces>;
}

export interface Neighbor {
  id: UUID;
  name: string;
  types: SimpleType[];
  space: string;
  inbound: Neighbor[];
  outbound: Neighbor[];
}

export interface Scope {
  id: UUID;
  label: string;
  permissions: Permissions;
  children?: Scope[];
  types: SimpleType[];
  status: string;
}

export interface ReleaseScope extends Scope {
  childrenStatus?: ReleaseStatus;
  globalStatus?: ReleaseStatus;
  status?: ReleaseStatus;
  pending_childrenStatus?: ReleaseStatus;
  pending_globalStatus?: ReleaseStatus;
  pending_status?: ReleaseStatus;
  children?: ReleaseScope[];
  typesName: string;
  isAssociation?: boolean;
}

export interface StatusResponse {
  data: string;
}

export interface GraphNode extends NodeObject{
  name: string;
  space: string;
  color: string;
  groupId: string;
  highlighted: boolean;
  isGroup?: boolean;
  isMainNode?: boolean;
  labelLines: string[];
}

export interface GraphNodes {
  [key: string]: GraphNode;
}

export interface GraphGroups {
  [key: string]: GraphGroup;
}
export interface GraphLink extends LinkObject{
  id: string;
  highlighted: boolean;
}

export interface GraphLinks {
  [key:string]: GraphLink;
}

export interface GraphGroup extends GraphNode {
  types: SimpleType[];
  nodes: GraphNode[];
  show: boolean;
  grouped: boolean;
}

export interface FieldStoreValidation {
  regex: string;
  errorMessage: string;
}

export interface FieldStoreRegexRule {
  errorMessage: string;
  regex: RegExp | string;
}


export interface FieldStoreDefinition {
    widget: string;
    label: string;
    labelTooltip: string;
    labelTooltipIcon: IconProp;
    isPublic: boolean;
    fullyQualifiedName: string;
    order: number;
    isRequired: boolean;
    isReadOnly: boolean;
    warning: string;
    minValue?: number;
    maxValue?: number;
    minItems?: number;
    maxItems?: number;
    maxLength?: number;
    validation?: FieldStoreValidation[];
    regex?: string;
    defaultTargetType?: string;
    allowCustomValues?: boolean;
    lazyShowLinks?: boolean;
    targetTypes?: SimpleType[];
    fields: Map<string, StructureOfField>;
}
