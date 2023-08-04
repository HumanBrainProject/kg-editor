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
import type { LinkObject, NodeObject } from 'force-graph';
import type { KeycloakConfig } from 'keycloak-js';
import type { PiwikOptions } from 'react-piwik';

export type UUID = string;

export enum ViewMode {
  VIEW = 'view',
  EDIT = 'edit',
  GRAPH = 'graph',
  MANAGE = 'manage',
  RELEASE = 'release',
  CREATE = 'create',
  RAW = 'raw'
}

export enum ReleaseStatus {
  UNRELEASED = 'UNRELEASED',
  HAS_CHANGED = 'HAS_CHANGED',
  RELEASED = 'RELEASED'
}

export type Stage = 'IN_PROGRESS' | 'RELEASED'; //TODO: change this to Enum
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

export interface Suggestion {
  id: string;
  name: string;
  additionalInformation: string;
  type: SimpleType;
  space: string;
  isNew?: boolean;
  isExternal?: boolean;
}

export interface StructureOfType extends SimpleType {
  labelField: string;
  embeddedOnly: boolean;
  fields: Fields;
  promotedFields: string[];
  incomingLinks: StructureOfIncomingLinkByFieldName;
  canCreate: boolean;
  isSupported?: boolean;
}

export type StructureOfIncomingLinkByFieldName = Record<string,StructureOfIncomingLink>; // by fieldName

export interface StructureOfField {
  isPublic?: boolean;
  alternatives: Alternative[];
  fullyQualifiedName: string;
  numOfOccurrences: number;
  order: number;
  name: string;
  label?: string;
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
  fields: Fields;
  value: any;
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
  type: StructureOfType;
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

export type Fields = Record<string,StructureOfField>; // by fieldName

export interface InstanceSummary extends InstanceLabel {
  permissions: Permissions;
  fields: Fields;
}

export interface InstanceFull extends InstanceSummary {
  alternatives: Alternatives;
  labelField: string;
  promotedFields: string[];
  incomingLinks: IncomingLinksByField;
  possibleIncomingLinks: StructureOfIncomingLink[];
}

export type Alternatives = Record<string,Alternative[]>; // by fieldName

export interface Alternative {
  value: any;
  selected: boolean;
  users: UserSummary[];
}

export type IncomingLinksByField = Record<string,IncomingLinksByType[]>; // by fieldName

export type IncomingLinksByType = Record<string,InstanceIncomingLinkFull>; // by type

export interface IncomingLinks {
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
  instances: IncomingLink[];
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
  instanceId?: UUID;
}

export interface SuggestionStructure {
  suggestions: KGCoreResult<Suggestion[]>;
  types: SuggestionsTypes;
}

export interface SuggestionSimpleTypeWithSpaces extends SimpleType {
  space: string[];
}

export type SuggestionsTypes = Record<string,SuggestionSimpleTypeWithSpaces>; // by typeName

export type InstanceRawData = {
  [fieldName:string]: unknown;
}

export type InstanceLabelData = Record<UUID,InstanceLabel>; // by instanceId

export type InstanceSummaryData = Record<UUID,InstanceSummary>; // by instanceId

export type InstanceFullData = Record<UUID,InstanceFull>; // by instanceId

export interface InstanceRawStructure {
  data: InstanceRawData;
  permissions?: Permissions;
}

export interface PreviewInstance {
  id?: string;
  name?: string;
  options?: PreviewInstanceOptions;
}

export interface PreviewInstanceOptions {
  showEmptyFields: boolean;
  showAction: boolean;
  showType: boolean;
  showStatus: boolean;
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
  status?: ReleaseStatus;
}

export interface ReleaseScope extends Scope {
  status?: ReleaseStatus;
  childrenStatus?: ReleaseStatus;
  globalStatus?: ReleaseStatus;
  pending_childrenStatus?: ReleaseStatus;
  pending_globalStatus?: ReleaseStatus;
  pending_status?: ReleaseStatus;
  children?: ReleaseScope[];
  typesName: string;
  isAssociation?: boolean;
}

export interface StatusResponse {
  data: ReleaseStatus;
}

export interface GraphNode extends NodeObject {
  name: string;
  space: string;
  color: string;
  groupId: string;
  highlighted: boolean;
  isGroup?: boolean;
  isMainNode?: boolean;
  labelLines: string[];
}

export type GraphNodes = Record<string,GraphNode>;

export type GraphGroups = Record<string,GraphGroup>;

export interface GraphLink extends LinkObject {
  id: string;
  highlighted: boolean;
  source: GraphNode;
  target: GraphNode;
}

export type GraphLinks = Record<string,GraphLink>;

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
  regex: RegExp;
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
  fields: Fields;
  markdown?: boolean;
}
