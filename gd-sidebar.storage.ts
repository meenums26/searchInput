import * as types from '@/datasetView/store/index';
import { WorkFlow } from '@/datasetView/workFlow/model';
import store from '@/plugins/global.store';
import {
  Attribute,
  DataForAutoSuggest,
  DataSetDetails,
  DatasetOwner,
  EditLinkageRequest,
  LinkedElement,
  LinkedFile,
  PreviewModeState,
  ConditionSelection,
  DataSetDetailsResponse
} from '../../../model/DvModel';
import { GdsSidebarMapper } from '../mapper/gds-sidebar.mapper';
import {
  GdsSidebarEditOwnership,
  GdsSidebarType,
  OwnershipEditDetail
} from '../models/gds-sidebar.model';

function isSidebarVisible(): boolean {
  return store().getters[types.IS_GDS_SIDEBAR_ACTIVE];
}

function openSidebarFor(param: GdsSidebarType) {
  store().commit(types.MUTATE_GDS_SIDEBAR_NAME, param);
}

function closeSidebar() {
  store().commit(types.MUTATE_GDS_SIDEBAR_NAME, GdsSidebarType.hidden);
}

function getCurrentGdsSidebar(): GdsSidebarType {
  return store().getters[types.GET_CURRENT_GDS_SIDEBAR];
}

function setDefaultGoldenDataElement(goldenDataElement: LinkedElement) {
  store().commit(types.SET_DEFAULT_GOLDEN_DATA_ELEMENT, goldenDataElement);
}

function getDefaultGoldenDataElement(): LinkedElement {
  return store().getters[types.GET_DEFAULT_GOLDEN_DATA_ELEMENT];
}

function setActiveGoldenDataElement(goldenDataElement: LinkedElement) {
  store().commit(types.SET_ACTIVE_GOLDEN_DATA_ELEMENT, goldenDataElement);
}

function getActiveGoldenDataElement(): LinkedElement {
  return store().getters[types.GET_ACTIVE_GOLDEN_DATA_ELEMENT];
}

function setActiveGoldenDataElements(goldenDataElements: LinkedElement[]) {
  store().commit(types.SET_ACTIVE_GOLDEN_DATA_ELEMENTS, goldenDataElements);
}

function getActiveGoldenDataElements(): LinkedElement[] {
  return store().getters[types.GET_ACTIVE_GOLDEN_DATA_ELEMENTS];
}

function storeEditedValue(
  updatedPropertyValue: {
    [key: string]: string | string[] | Attribute[] | null;
  },
  disable: boolean = false
) {
  if (disable) return;
  store().commit(types.UPDATE_EDITED_GOLDEN_DATA_ELEMENT, updatedPropertyValue);
}

function resetEditedElement() {
  store().commit(types.MUTATE_RESET_EDITED_GOLDEN_DATA_ELEMENT);
}

function getInitialDatasetElementsAttributes(): LinkedElement[] {
  return store().getters[types.INITIAL_DATASET_ELEMENTS_ATTRIBUTES];
}

function getInitialElementAttribute(elemId: number): LinkedElement | undefined {
  const originalArray = store().getters[
    types.INITIAL_DATASET_ELEMENTS_ATTRIBUTES
  ] as LinkedElement[];
  return originalArray?.find((element) => element.data_element_id === elemId);
}

function setElementAttributesFiles(goldenDataElements: LinkedElement[]) {
  store().commit(types.SET_ELEMENT_ATTRIBUTES_FILES, goldenDataElements);
}

function getElementAttributesFiles(): LinkedElement[] {
  return store().getters[types.GET_ELEMENT_ATTRIBUTES_FILES];
}

function setActiveElementAttributes(activeAttributes: Attribute[]) {
  store().commit(types.SET_ACTIVE_ELEMENT_ATTRIBUTES, activeAttributes);
}

function getActiveElementAttributes(): Attribute[] {
  return store().getters[types.GET_ACTIVE_ELEMENT_ATTRIBUTES];
}

function setFileAttributes(files: LinkedFile[]) {
  store().commit(types.SET_FILE_ATTRIBUTES, files);
}

function getFileAttributes(): LinkedFile[] {
  return store().getters[types.GET_FILE_ATTRIBUTES];
}

function setApprovers(approvers: DatasetOwner[]) {
  store().commit(types.SET_APPROVERS, approvers);
}

function getApprovers(): DatasetOwner[] {
  return store().getters[types.GET_APPROVERS];
}

function setRequestor(requestor: DatasetOwner) {
  store().commit(types.SET_REQUESTOR, requestor);
}

function getRequestor(): DatasetOwner {
  return store().getters[types.GET_REQUESTOR];
}

function setEditRequest(editRequest: EditLinkageRequest) {
  store().commit(types.SET_EDIT_REQUEST, editRequest);
}

function setCommonWorkflowRequest(cwfEditRequest: Partial<WorkFlow>) {
  store().commit(types.SET_CWF_EDIT_REQUEST, cwfEditRequest);
}

function getCommonWorkflowRequest(): Partial<WorkFlow> {
  return store().getters[types.GET_CWF_EDIT_REQUEST];
}

function updateEditedRequestValue(updatedPropertyValue: {
  [key: string]: string | string[] | Attribute[];
}) {
  store().commit(types.UPDATE_EDIT_REQUEST, updatedPropertyValue);
}

function getEditRequest(): EditLinkageRequest {
  return store().getters[types.GET_EDIT_REQUEST];
}

function saveGoldenDataSet(): Promise<void> {
  return store().dispatch(types.SAVE_GOLDEN_DATA_SET_CHANGES);
}

function setActiveAndDefaultMetadata() {
  store().commit(types.SET_ACTIVE_AND_DEFAULT_GDS_METADATA_FOR_EDIT);
}

function setActiveMetadata(payload: any) {
  store().commit(types.SET_ACTIVE_GDS_METADATA_FOR_EDIT, payload);
}

function getActiveMetadata(): DataSetDetails {
  return store().getters[types.GET_ACTIVE_GDS_METADATA];
}

function setDefaultMetadata(payload: DataSetDetails) {
  return store().commit(types.SET_DEFAULT_GDS_METADATA, payload);
}

function getDefaultMetadata(): DataSetDetails {
  return store().getters[types.GET_DEFAULT_GDS_METADATA];
}

function storeEditedMetadataValue(updatedProp: {
  [key: string]: string | number | null | string[];
}) {
  store().commit(types.UPDATE_EDITED_GDS_METADATA, updatedProp);
  GdsSidebarMapper.mapMetadataToWorkflow(true);
}

function getOriginalDatasetObj(): DataSetDetailsResponse {
  return store().getters[types.DATA_SET];
}

function resetEditedMetadata() {
  store().commit(types.RESET_EDITED_METADATA);
  GdsSidebarMapper.mapMetadataToWorkflow();
}

function getOnwership(): Promise<void> {
  return store().dispatch(types.GET_GDS_SIDEBAR_OWNERSHIP);
}

function updateOwnershipInStore(
  updatedOwnership: GdsSidebarEditOwnership
): void {
  store().commit(types.UPDATE_GDS_SIDEBAR_OWNERSHIP, updatedOwnership);
}

function ownershipData(): GdsSidebarEditOwnership {
  return store().getters[types.GET_GDS_EDIT_OWNERSHIP];
}

function saveOwnershipEdit(callSourcingV2: boolean): Promise<any> {
  return store().dispatch(types.SAVE_GDS_OWNERSHIP_EDIT, callSourcingV2);
}

function savePreApprovalConditions(
  conditions: any,
  logsId: number,
  corpId: number
): Promise<any> {
  return store().dispatch(types.SAVE_PREAPPROVAL_CONDITIONS, {
    conditions,
    logsId,
    corpId
  });
}

function saveEnableDSARequests(
  enableValue: boolean,
  logsId: number
): Promise<any> {
  return store().dispatch(types.SAVE_ENABLE_DSA_REQUESTS, {
    enableValue,
    logsId
  });
}

function fetchPreApprovalConditions(
  logsId: number,
  corpId: number
): Promise<any> {
  return store().dispatch(types.FETCH_PRE_APPROVAL_CONDITIONS, {
    corpId,
    logsId
  });
}

function getPreApprovalConditions(): ConditionSelection[] {
  return store().getters[types.GET_PRE_APPROVAL_CONDITIONS];
}

function getPreSelectedValueForDSARequest(): boolean {
  return store().getters[types.GET_PRE_SELECTED_VALUE_FOR_DSA_REQUEST];
}

function getSelectedDSARequestConditionToMeet(): string[] {
  return store().getters[types.GET_SELECTED_DSA_REQUEST_ERRORS];
}

function resetOwnership(): void {
  /* this actually returns ownership to default values */
  store().dispatch(types.GET_GDS_SIDEBAR_OWNERSHIP);
}

function setActiveMode(mode: string) {
  store().commit(types.SET_ACTIVE_MODE, mode);
}

function getActiveMode() {
  return store().getters[types.GET_ACTIVE_MODE];
}

function saveApprovedEdit(
  corpId: number,
  callSourcingV2: boolean,
  comments?: string
): Promise<void> {
  return store().dispatch(types.SAVE_APPROVED_GDS_EDIT, {
    corpId,
    comments,
    callSourcingV2
  });
}

function savePartialApprovedEdit(
  corpId: number,
  callSourcingV2: boolean,
  comments?: string
): Promise<void> {
  return store().dispatch(types.SAVE_PARTIALLY_APPROVED_GDS_EDIT, {
    corpId,
    comments,
    callSourcingV2
  });
}

function deleteCurrentRequest(): Promise<void> {
  return store().dispatch(types.DELETE_CURRENT_REQUEST);
}

function fetchDataAttributeRecommmendations(
  payload: DataForAutoSuggest
): Promise<void> {
  return store().dispatch(types.GET_DATA_ATTRIBUTE_RECOMMENDATIONS, payload);
}

function getActiveAttrRecommendations(): number[] {
  return store().getters[types.GET_ACTIVE_ATTR_RECOMMENDATIONS];
}

function isPreviewSidebarOpen(): boolean {
  const previewModeState: PreviewModeState =
    store().getters[`${types.PREVIEW_MODE_STATE}`];
  return previewModeState.isOpened;
}

function setClosedPreviewModeState(): void {
  store().commit(types.MUTATE_PREVIEW_MODE_STATE, {
    isOpened: false,
    datasetPreviewIndex: -1,
    datasetSrcId: -1
  });
}

function storeOwnershipDetailsBeforeUpdate(
  updatedOwnership: OwnershipEditDetail
) {
  store().commit(types.STORE_OWNERSHIP_BEFORE_UPDATE, updatedOwnership);
}

function updateCommonWorkflowRequestValue(updatedPropertyValue: {
  [key: string]: any;
}) {
  store().commit(types.UPDATE_CWF_REQUEST, updatedPropertyValue);
}

function getNoOfFilesLinked(): number {
  return store().getters[types.GET_NO_OF_FILES_LINKED];
}

function getAttributesLinked(): number {
  return store().getters[types.ATTRIBUTES_LINKED];
}

function  getLinkageReferringElements(searchKey:string):LinkedElement[]{
  return store().getters[types.GET_LINKAGE_REFFERING_ELEMENTS,searchKey];
}

function mutateLinkageReferringElements(payload:LinkedElement[]){
  store().commit(types.SET_LINKAGE_REFFERING_ELEMENTS,payload);
}

async function fetchLinkageRefferingElements(searchKey: string): Promise<void> {
  await store().dispatch(types.FETCH_LINKAGE_REFFERING_ELEMENTS_DATA, searchKey);
}

export const GdsSidebarStorage = {
  isSidebarVisible,
  openSidebarFor,
  closeSidebar,
  getCurrentGdsSidebar,
  setDefaultGoldenDataElement,
  getDefaultGoldenDataElement,
  setActiveGoldenDataElement,
  getActiveGoldenDataElement,
  setActiveGoldenDataElements,
  getActiveGoldenDataElements,
  storeEditedValue,
  resetEditedElement,
  setElementAttributesFiles,
  getElementAttributesFiles,
  setActiveElementAttributes,
  getActiveElementAttributes,
  setFileAttributes,
  getFileAttributes,
  getInitialElementAttribute,
  getInitialDatasetElementsAttributes,
  setApprovers,
  getApprovers,
  setRequestor,
  getRequestor,
  getEditRequest,
  setEditRequest,
  saveGoldenDataSet,
  setActiveAndDefaultMetadata,
  getActiveMetadata,
  getDefaultMetadata,
  setDefaultMetadata,
  storeEditedMetadataValue,
  getOriginalDatasetObj,
  getOnwership,
  ownershipData,
  updateOwnershipInStore,
  saveOwnershipEdit,
  resetEditedMetadata,
  getPreSelectedValueForDSARequest,
  getSelectedDSARequestConditionToMeet,
  resetOwnership,
  setActiveMode,
  getActiveMode,
  saveApprovedEdit,
  updateEditedRequestValue,
  setActiveMetadata,
  deleteCurrentRequest,
  fetchDataAttributeRecommmendations,
  getActiveAttrRecommendations,
  isPreviewSidebarOpen,
  setClosedPreviewModeState,
  storeOwnershipDetailsBeforeUpdate,
  savePartialApprovedEdit,
  setCommonWorkflowRequest,
  getCommonWorkflowRequest,
  updateCommonWorkflowRequestValue,
  getNoOfFilesLinked,
  getAttributesLinked,
  savePreApprovalConditions,
  saveEnableDSARequests,
  fetchPreApprovalConditions,
  getPreApprovalConditions,
  getLinkageReferringElements,
  mutateLinkageReferringElements,
  fetchLinkageRefferingElements
};
