import { ProfileData } from '@/core/modules/user';
import {
  ActiveDelegateRole,
  IDelegateUserModel,
  IDelegation
} from '@/datasetView/components/delegation/models';
import {
  GdsSidebarEditOwnership,
  GdsSidebarType,
  OwnershipEditDetail
} from '@/datasetView/components/gds-sidebar/models/gds-sidebar.model';
import { WorkFlow } from '@/datasetView/workFlow/model';
import { GetterTree } from 'vuex';
import {
  IBulkDataAccessRequest,
  DatasetFilter,
  FilterSegmentSearchResult,
  FilterSegments
} from '@/datasetView/usecase-v2/tabs/dsa/bulkRequestAccessToGoldenDatasets/shared/models';
import { StatusType } from '@/datasetView/dsaa/models/approvals';
import {
  Attribute,
  DatasetOwner,
  DataSetViewState,
  EditLinkageRequest,
  GdeDqIssue,
  GdsDqIssue,
  GoldenDatasetDetailsResult,
  LinkedElement,
  LinkedFile,
  RootState,
  ConditionSelection,
  IntegratedDatasetDetailsResult,
  LinkedIDSElement
} from '../../model/DvModel';
import * as types from '../index';

export const getters: GetterTree<DataSetViewState, RootState> = {
  [types.SEARCH_KEY_TYPED](state: DataSetViewState) {
    return state.searchKeyTyped;
  },
  [types.SEARCH_IN](state: DataSetViewState) {
    return state.searchIn;
  },
  [types.SELECTED_INTEGRATED_DATA_SET](state: DataSetViewState) {
    return state.selectedIntegratedDataSet;
  },
  [types.GET_DATA_SETS](state: DataSetViewState) {
    return state.selectedDataSets;
  },
  [types.GET_MAPPED_GOLDEN_DATA_ELEMENTS](state: DataSetViewState) {
    return state.mappedGoldenDataElements;
  },
  [types.DATA_SET](state: DataSetViewState) {
    return state.dataSet;
  },
  [types.CURRENT_OAR_DETAILS](state: DataSetViewState) {
    return state.currentOARDetails;
  },
  [types.GDS_DSA_DATA](state: DataSetViewState) {
    return state.gdsV2Data.dsaData;
  },
  [types.GDS_DQ_SCORE_DATA](state: DataSetViewState) {
    return state.gdsV2Data.dqScoresData;
  },
  [types.GET_ACTIVE_GDS_SEGMENTATION_FILTER_ID](state: DataSetViewState) {
    return state.gdsSegmentationFilters.activeFilterId;
  },
  [types.GET_ACTIVE_GDS_SEGMENTATION_ATTRIBUTE_ID](state: DataSetViewState) {
    return state.gdsSegmentationFilters.activePhysicalAttributeId;
  },
  [types.GET_PHYSICAL_ATTRIBUTES_BY_PHYSICAL_DATASET]:
    (state: DataSetViewState) => (rowId: string) => {
      return (
        state.gdsSegmentationFilters.physicalDatasets.physicalAttributes[
          rowId
        ] || []
      );
    },
  [types.GET_SEGMENTS_AND_CONDITIONS_FOR_FILTER_AND_PHYSICAL_ATTRIBUTES]:
    (state: DataSetViewState) => (key: string) => {
      return state.gdsSegmentationFilters.segments[key] || [];
    },
  [types.GET_ACTIVE_SEGMENTS_AND_CONDITIONS_KEY](state: DataSetViewState) {
    return state.gdsSegmentationFilters.activeSegmentsAndConditionsKey;
  },
  [types.GET_ERROR_SEGMENTS_AND_CONDITIONS_FOR_FILTER_AND_PHYSICAL_ATTRIBUTES](
    state: DataSetViewState
  ) {
    return state.gdsSegmentationFilters.segmentsAndConditionsError.error;
  },
  [types.GET_PHYSICAL_DATASET_TO_EDIT_IN_SEGMENTS_AND_CONDITIONS](
    state: DataSetViewState
  ) {
    return state.gdsSegmentationFilters
      .physicalDatasetToEditInSegmentsAndConditions;
  },
  [types.GET_SEGMENTATION_FILTERS_BY_DATASET](state: DataSetViewState) {
    return state.gdsSegmentationFilters.segmentationFilters;
  },
  [types.GET_PHYSICAL_DATASETS_MAPPED_TO_GDS_FILTER](state: DataSetViewState) {
    return state.gdsSegmentationFilters.physicalDatasetMappedtoGdsFilter;
  },
  [types.GET_GDS_SEGMENTATION_TABULATOR_MODAL_VISIBILITY](
    state: DataSetViewState
  ) {
    return state.gdsSegmentationFilters.modals
      .gdsSegmentationTabulatorModalVisibility;
  },
  [types.GET_GDS_SEGMENTATION_SEGMENTS_AND_CONDITIONS_TABULATOR_MODAL_VISIBILITY](
    state: DataSetViewState
  ) {
    return state.gdsSegmentationFilters.modals
      .gdsSegmentationSegmentsAndConditionsTabulatorModalVisibility;
  },
  [types.GET_GDS_SEGMENTATION_TABULATOR_EDIT_STATE](state: DataSetViewState) {
    return state.gdsSegmentationFilters.editState;
  },
  [types.GDS_DQ_ISSUE_DATA](state: DataSetViewState) {
    return state.gdsV2Data.dqIssuesData;
  },

  [types.SEARCH_PARAMS](state: DataSetViewState) {
    return {
      ...state.search
    };
  },
  [types.PREVIEW_MODE_STATE](state: DataSetViewState) {
    return { ...state.previewModeState };
  },
  [types.FILTER_APPLIED_STATE](state: DataSetViewState) {
    return state.filterApplied;
  },
  [types.DATA_SET_LIST_WITH_FILTER](state: DataSetViewState) {
    return state.dataListWithFilter;
  },
  [types.FILTER_OPTIONS](state: DataSetViewState) {
    return state.filterOptions;
  },
  [types.INITIAL_DATA_SET](state: DataSetViewState) {
    return state.filterOptions;
  },
  [types.INITIAL_DATASET_ELEMENTS_ATTRIBUTES](state: DataSetViewState) {
    return state.initialDataSetElementAttributes;
  },
  [types.LOGS_ID_FILTER_OPTIONS](state: DataSetViewState) {
    return state.logsIdFilterOptions;
  },
  [types.IS_GDS_SIDEBAR_ACTIVE](state: DataSetViewState): boolean {
    return state.gdsSidebar.currentGdsSidebar !== GdsSidebarType.hidden;
  },
  [types.GET_CURRENT_GDS_SIDEBAR](state: DataSetViewState): GdsSidebarType {
    return state.gdsSidebar.currentGdsSidebar;
  },
  [types.GET_GDS_EDIT_OWNERSHIP](
    state: DataSetViewState
  ): GdsSidebarEditOwnership {
    return state.gdsSidebar.ownership;
  },
  [types.GET_ACTIVE_GOLDEN_DATA_ELEMENT](
    state: DataSetViewState
  ): LinkedElement {
    return state.gdsSidebar.activeDataElement;
  },
  [types.GET_ACTIVE_GOLDEN_DATA_ELEMENTS](
    state: DataSetViewState
  ): LinkedElement[] {
    return state.gdsSidebar.activeDataElements;
  },
  [types.GET_ELEMENT_ATTRIBUTES_FILES](
    state: DataSetViewState
  ): LinkedElement[] {
    return state.gdsSidebar.elementAttributesFiles;
  },
  [types.GET_ACTIVE_ELEMENT_ATTRIBUTES](state: DataSetViewState): Attribute[] {
    return state.gdsSidebar.activeElementAttributes;
  },
  [types.GET_FILE_ATTRIBUTES](state: DataSetViewState): LinkedFile[] {
    return state.gdsSidebar.fileAttributes;
  },
  [types.GET_DEFAULT_GOLDEN_DATA_ELEMENT](
    state: DataSetViewState
  ): LinkedElement {
    return state.gdsSidebar.defaultDataElement;
  },
  [types.GET_APPROVERS](state: DataSetViewState): DatasetOwner[] {
    return state.gdsSidebar.approvers;
  },
  [types.GET_REQUESTOR](state: DataSetViewState): DatasetOwner {
    return state.gdsSidebar.requestor;
  },
  [types.GET_EDIT_REQUEST](
    state: DataSetViewState
  ): Partial<EditLinkageRequest> {
    return state.gdsSidebar.editRequest;
  },
  [types.GET_GDS_CWF_FLAG](state: DataSetViewState): boolean {
    return state.gdsSidebar.cwfFlag;
  },
  [types.GET_CWF_EDIT_REQUEST](state: DataSetViewState): Partial<WorkFlow> {
    return state.gdsSidebar.cwfEditRequest;
  },
  [types.GET_ACTIVE_GDS_METADATA](state: DataSetViewState) {
    return state.gdsSidebar.activeMetadata;
  },
  [types.GET_DEFAULT_GDS_METADATA](state: DataSetViewState) {
    return state.gdsSidebar.defaultMetadata;
  },
  [types.GET_ACTIVE_MODE](state: DataSetViewState) {
    return state.gdsSidebar.activeMode;
  },
  [types.GET_ACTIVE_ATTR_RECOMMENDATIONS](state: DataSetViewState): number[] {
    return state.gdsSidebar.activeAttrSuggestions;
  },
  [types.GET_OWNERSHIP_BEFORE_CHANGE](
    state: DataSetViewState
  ): OwnershipEditDetail {
    return state.gdsSidebar.ownershipBeforeUpdate;
  },
  [types.GET_PARTIAL_APPROVED_DETAILS](state: DataSetViewState) {
    return state.approvedRequests;
  },
  [types.GET_GDS_DQ_ISSUE](state: DataSetViewState): GdsDqIssue {
    return state.gdsV2Data.gdsDqIssuesData;
  },
  [types.GET_GDE_DQ_ISSUE](state: DataSetViewState): GdeDqIssue[] {
    return state.gdsV2Data.gdeDqIssuesData;
  },
  [types.GET_GDS_EDA_COMPLIANT](state: DataSetViewState): Boolean {
    return state.gdsEdaCompliant;
  },
  [types.GET_DELEGATION_ACTIVE_USER_ROLE](state): ActiveDelegateRole {
    return state.delegations.activeRole;
  },
  [types.GET_DELEGATIONS_OWNER](state): IDelegateUserModel {
    const owner = state.delegations.datasetProfiles.find(
      (el) => el.corpId.toString() === state.delegations.datasetOwnerCorpId
    );
    return {
      id: owner?.corpId.toString(),
      name: owner?.displayName,
      role: owner?.organisationalUnitName
    };
  },
  [types.GET_DELEGATIONS_STEWARD](state): IDelegateUserModel {
    const steward = state.delegations.datasetProfiles.find(
      (el) => el.corpId.toString() === state.delegations.datasetStewardCorpId
    );
    return {
      id: steward?.corpId.toString(),
      name: steward?.displayName,
      role: steward?.organisationalUnitName
    };
  },
  [types.GET_DELEGATION_OWNER_DATASETS](state): number[] {
    return state.delegations.datasetsOfOwner;
  },
  [types.GET_DELEGATION_STEWARD_DATASETS](state): number[] {
    return state.delegations.datasetsOfSteward;
  },
  [types.GET_DELEGATION_PROFILES_EXIST_IN_STORE](state): {
    profilesInStore: ProfileData[];
    forLogsId: number;
  } {
    return {
      profilesInStore: state.delegations.datasetProfiles,
      forLogsId: state.delegations.datasetProfilesForLogsId
    };
  },
  [types.GET_DELEGATION_ACTIVE_IDS](state): { corpId: string; logsId: number } {
    return {
      corpId: state.delegations.activeUserCorpId,
      logsId: state.delegations.logsId
    };
  },
  [types.GET_EXISTING_ONWER_DELEGATORS](state): Array<IDelegation> {
    return state.delegations.copyOfExistingDelegators.owners;
  },
  [types.GET_EXISTING_STEWARD_DELEGATORS](state): Array<IDelegation> {
    return state.delegations.copyOfExistingDelegators.stewards;
  },
  [types.GET_BULK_DATA_ACCESS_DATASETS_WITH_DETAILS](
    state
  ): Array<GoldenDatasetDetailsResult> {
    return state.bulkDataAccess.goldenDatasets;
  },
  [types.GET_BULK_DATA_ACCESS_DATASETS_IDS_WITH_DETAILS](
    state
  ): Array<IntegratedDatasetDetailsResult> {
    return state.bulkDataAccess.integratedDatasets;
  },
  [types.GET_BULK_DATA_ACCESS_PAYLOAD](state): IBulkDataAccessRequest {
    return state.bulkDataAccess.accessRequestPayload;
  },
  [types.GET_BULK_DATA_ACCESS_DATAELEMENTS_OPTIONS](state): LinkedElement[] {
    return state.bulkDataAccess.dataElementOptions;
  },
  [types.GET_BULK_DATA_ACCESS_IDS_DATAELEMENTS_OPTIONS](
    state
  ): LinkedIDSElement[] {
    return state.bulkDataAccess.idsDataElementOptions;
  },
  [types.GET_TEMP_SELECTED_GDES](state): number[] {
    return state.bulkDataAccess.tempSelectedDataElements;
  },
  [types.GET_TEMP_SELECTED_IDES](state): number[] {
    return state.bulkDataAccess.tempSelectedIDSDataElements;
  },
  [types.GET_TEMP_SELECTED_FILTER](state): DatasetFilter {
    return state.bulkDataAccess.tempSelectedFilter;
  },
  [types.GET_GDS_ID](state: DataSetViewState): number {
    return state.dataSet.golden_dataset.logs_id;
  },
  [types.GET_NO_OF_FILES_LINKED](state: DataSetViewState): number {
    return state.gdsSidebar.noOfFilesLinked;
  },
  [types.ATTRIBUTES_LINKED](state: DataSetViewState): Boolean {
    return state.attributesLinked;
  },
  [types.GET_PRE_APPROVAL_CONDITIONS](
    state: DataSetViewState
  ): ConditionSelection[] {
    return state.preApprovalConditions;
  },
  [types.GET_PRE_SELECTED_VALUE_FOR_DSA_REQUEST](
    state: DataSetViewState
  ): Boolean {
    return state.dataSet.golden_dataset.disable_data_sharing_agreement_requests;
  },
  [types.GET_SELECTED_DSA_REQUEST_ERRORS](state: DataSetViewState): string[] {
    return state.dataSet.golden_dataset.ready_for_data_sharing_requests_errors;
  },
  [types.GET_GDS_CREATION_LOOKUPS](state: DataSetViewState): any {
    return state.gdsCreationLookups;
  },
  [types.GET_ACTIVE_GDS](state: DataSetViewState): any {
    return state.gdsActiveData;
  },
  [types.GET_IS_DSA_APPROVAL_LOCKED](state: DataSetViewState): boolean {
    return state.bulkDataAccess.editDSAInfo.approvalDetails.some(
      (details) => details.approve_flag === StatusType.locked
    );
  },
  [types.GET_SHOW_IDS_DSA_REQUESTED](state: DataSetViewState): boolean {
    return state.bulkDataAccess.showIDSDSARequested;
  },
  [types.GET_DATA_SET_WITH_FILTER_DATA](
    state
  ): GoldenDatasetDetailsResult[] | undefined {
    return state.dataSetWithFilter;
  },
  [types.GET_SEGMENTS_OPTIONS](state: DataSetViewState): FilterSegments[] {
    return state.bulkDataAccess.tempSegmentsOptions;
  },
  [types.GET_FILTER_SEGMENTS_LOOKUP](
    state: DataSetViewState
  ): FilterSegmentSearchResult[] {
    return state.filtersAndSegmentsLookUp;
  },
  [types.GET_TECHNICAL_METADATA_FOR_GOLDEN_DATASET](state: DataSetViewState) {
    return state.technicalMetadataForGoldenDataset;
  },
  [types.GET_LINKAGE_REFFERING_ELEMENTS](
    state: DataSetViewState
  ): LinkedElement[] {
    return state.gdsSidebar.linkRefferedElements;
  },
};
