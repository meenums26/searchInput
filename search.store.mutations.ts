import {
  ActiveDelegateRole,
  IDelegation,
  IDelegationUserProfiles,
  IRemovedDelegator
} from '@/datasetView/components/delegation/models';
import { GdsSidebarMapper } from '@/datasetView/components/gds-sidebar/mapper/gds-sidebar.mapper';
import {
  GdsSidebarEditOwnership,
  GdsSidebarType,
  OwnershipEditDetail
} from '@/datasetView/components/gds-sidebar/models/gds-sidebar.model';
import { WorkFlow } from '@/datasetView/workFlow/model';
import { MutationTree } from 'vuex';
import {
  IBulkDataAccessRequest,
  ReplaceEditedFieldPayload,
  AddEditedFieldPayload,
  RemoveEditedFieldPayload,
  ApprovalDetailType,
  DatasetFilter,
  FilterSegments
} from '@/datasetView/usecase-v2/tabs/dsa/bulkRequestAccessToGoldenDatasets/shared/models';
import deepCopy from '@/common/utils/deepCopy';
import { MTOarDetails } from '@/datasetView/model';
import {
  Attribute,
  BlkRequestAccessGDECount,
  DataSetDetails,
  DatasetOwner,
  DataSetViewState,
  EditLinkageRequest,
  GdeDqIssue,
  GdsDqIssue,
  GoldenDatasetDetailsResult,
  LinkedElement,
  LinkedFile,
  GDSActiveDataPartial,
  IntegratedDatasetDetailsResult,
  LinkedIDSElement,
  BlkRequestAccessIDECount,
  FilterSegmentSearchResult,
  SegmentationFiltersByDatasetResponse,
  PhysicalDatasetsMappedToGoldenDatasetsFilterResponse,
  GDSDataElementType,
  ITechnicalMetadataDetails,
  DataSetDetailsResponse,
  IntegratedDataSetDetailsResponse
} from '../../model/DvModel';
import * as types from '../types/mutation-types';

function findGdsIndex(state: DataSetViewState, targetLogsId: number): number {
  return state.bulkDataAccess.accessRequestPayload.goldenDatasets.findIndex(
    (dataSet) => dataSet.logsId === targetLogsId
  );
}

function prepareFilter(
  selectedFilter: DatasetFilter,
  selectedSegments: FilterSegments[]
): DatasetFilter {
  return {
    id: selectedFilter.id,
    name: selectedFilter.name,
    logs_id: selectedFilter.logs_id,
    segments: selectedSegments
  };
}

function findFilterIndexOnGDS(
  state: DataSetViewState,
  gdsIndex: number,
  targetFilter: DatasetFilter
): number {
  return state.bulkDataAccess.accessRequestPayload.goldenDatasets[
    gdsIndex
  ].filtersAndSegments.findIndex(
    (sourceFilter) => sourceFilter.id === targetFilter.id
  );
}

function findIdsIndex(state: DataSetViewState, targetIdsId: number): number {
  return state.bulkDataAccess.accessRequestPayload.integratedDatasets.findIndex(
    (dataSet) => dataSet.idsId === targetIdsId
  );
}

export const mutations: MutationTree<DataSetViewState> = {
  [types.MUTATE_SEARCH_KEY_TYPED](state, payload) {
    state.searchKeyTyped = payload;
  },
  [types.MUTATE_SEARCH_IN](state, payload) {
    state.searchIn = payload;
  },
  [types.MUTATE_ATTRIBUTES_LINKED](state, payload) {
    payload = payload || false;
    state.attributesLinked = payload;
  },
  [types.MUTATE_DATA_SET](state, dataSet) {
    state.dataSet = dataSet;
  },
  [types.MUTATE_LINKAGE_REFFERING_ELEMENTS](state, payload: LinkedElement[]) {
    state.gdsSidebar.linkRefferedElements = payload;
  },
  [types.MUTATE_SELECTED_DATA_SETS](state, dataSet) {
    const exists = state.selectedDataSets.some(
      (selectedDataSet: DataSetDetailsResponse) =>
        selectedDataSet.golden_dataset.logs_id ===
        dataSet.golden_dataset.logs_id
    );
    if (!exists) {
      state.selectedDataSets.push(dataSet);
    }
  },
  [types.MUTATE_SELECTED_INTEGRATED_DATA_SETS](state, selectedIds) {
    const exists = state.selectedIntegratedDataSet.some(
      (selectedDataSet: IntegratedDataSetDetailsResponse) =>
        selectedDataSet.integrated_dataset.id ===
        selectedIds.integrated_dataset.id
    );
    if (!exists) {
      state.selectedIntegratedDataSet.push(selectedIds);
    }
  },
  [types.MUTATE_MAPPED_GOLDEN_DATA_ELEMENTS](state, mappedGoldenDataElements) {
    state.mappedGoldenDataElements = mappedGoldenDataElements;
  },
  [types.MUTATE_MAPPED_INTEGRATED_DATA_ELEMENTS](
    state,
    mappedIntegratedDataElements
  ) {
    state.mappedIntegratedDataElements = mappedIntegratedDataElements;
  },
  [types.MUTATE_REMOVE_DATA_SETS](state, index) {
    state.selectedDataSets.splice(index, 1);
  },
  [types.MUTATE_REMOVE_INTEGRATED_DATA_SET](state, index) {
    state.selectedIntegratedDataSet.splice(index, 1);
  },
  [types.MUTATE_CURRENT_OAR_DETAILS](state, oarDetails: MTOarDetails) {
    state.currentOARDetails = oarDetails;
  },
  [types.MUTATE_GDS_DSA_DATA](state, payload) {
    state.gdsV2Data.dsaData = payload;
  },
  [types.SET_GDS_SEGMENTATION_TABULATOR_MODAL_VISIBILITY](state, payload) {
    if (
      state.gdsSegmentationFilters.modals
        .gdsSegmentationTabulatorModalVisibility !== payload
    ) {
      state.gdsSegmentationFilters.modals.gdsSegmentationTabulatorModalVisibility =
        payload;
    }
  },
  [types.SET_GDS_SEGMENTATION_SEGMENTS_AND_CONDITIONS_TABULATOR_MODAL_VISIBILITY](
    state,
    payload
  ) {
    if (
      state.gdsSegmentationFilters.modals
        .gdsSegmentationSegmentsAndConditionsTabulatorModalVisibility !==
      payload
    ) {
      state.gdsSegmentationFilters.modals.gdsSegmentationSegmentsAndConditionsTabulatorModalVisibility =
        payload;
    }
  },
  [types.SET_GDS_SEGMENTATION_TABULATOR_EDIT_STATE](state, payload) {
    if (state.gdsSegmentationFilters.editState !== payload) {
      state.gdsSegmentationFilters.editState = payload;
    }
  },
  [types.SAVE_GDS_DQ_SCORE_DATA](state, payload) {
    state.gdsV2Data.dqScoresData = payload;
  },
  [types.SET_GDS_DQ_SCORE_LOADING](state, payload) {
    state.gdsV2Data.dqScoresData = {
      score: null,
      status: 'LOADING',
      threshold: null,
      elements: []
    };
  },
  [types.SET_GDS_DQ_SCORE_NO_DATA](state, payload) {
    state.gdsV2Data.dqScoresData = {
      score: null,
      status: 'NO_DATA',
      threshold: null,
      elements: []
    };
  },

  [types.SAVE_GDS_DQ_ISSUE_DATA](state, payload) {
    state.gdsV2Data.dqIssuesData = payload;
  },
  [types.SET_GDS_DQ_ISSUE_LOADING](state) {
    state.gdsV2Data.dqIssuesData = {
      status: 'loading',
      elements: [],
      gdeElements: []
    };
  },
  [types.SET_GDS_DQ_ISSUE_NO_DATA](state) {
    state.gdsV2Data.dqIssuesData = {
      status: 'empty',
      elements: [],
      gdeElements: []
    };
  },

  [types.MUTATE_SEARCH_PARAMS](state, payload) {
    state.search = { ...payload };
  },
  [types.MUTATE_PREVIEW_MODE_STATE](state, payload) {
    state.previewModeState = { ...payload };
  },
  [types.MUTATE_FILTER_APPLIED_STATE](state, payload) {
    state.filterApplied = payload;
  },
  [types.MUTATE_FILTER_OPTIONS](state, payload) {
    state.filterOptions = payload;
  },
  [types.MUTATE_LOGS_ID_FILTER_OPTIONS](state, payload) {
    state.logsIdFilterOptions = payload;
  },
  [types.MUTATE_INITIAL_DATASET_ELEMENTS_ATTRIBUTES](state, payload) {
    state.initialDataSetElementAttributes = payload;
  },
  [types.MUTATE_GDS_SIDEBAR_NAME](state, payload: GdsSidebarType) {
    state.gdsSidebar.currentGdsSidebar = payload;
  },
  [types.SET_DEFAULT_GOLDEN_DATA_ELEMENT](state, payload: LinkedElement) {
    state.gdsSidebar.defaultDataElement = payload;
  },
  [types.SET_ACTIVE_GOLDEN_DATA_ELEMENT](state, payload: LinkedElement) {
    state.gdsSidebar.activeDataElement = payload;
  },
  [types.SET_ACTIVE_GOLDEN_DATA_ELEMENTS](state, payload: LinkedElement[]) {
    state.gdsSidebar.activeDataElements = payload;
  },
  [types.SET_GDS_SIDEBAR_EDIT_OWNERSHIP](
    state,
    payload: GdsSidebarEditOwnership
  ) {
    state.gdsSidebar.ownership = payload;
  },
  [types.UPDATE_GDS_SIDEBAR_OWNERSHIP](
    state,
    payload: GdsSidebarEditOwnership
  ) {
    state.gdsSidebar.ownership = payload;
  },
  [types.SET_ELEMENT_ATTRIBUTES_FILES](state, payload: LinkedElement[]) {
    state.gdsSidebar.elementAttributesFiles = payload;
  },
  [types.SET_ACTIVE_ELEMENT_ATTRIBUTES](state, payload: Attribute[]) {
    state.gdsSidebar.activeElementAttributes = payload;
  },
  [types.SET_FILE_ATTRIBUTES](state, payload: LinkedFile[]) {
    state.gdsSidebar.fileAttributes = payload;
  },
  [types.UPDATE_EDITED_GOLDEN_DATA_ELEMENT](state, payload: LinkedElement) {
    Object.assign(state.gdsSidebar.activeDataElement, payload);
  },
  [types.MUTATE_RESET_EDITED_GOLDEN_DATA_ELEMENT](state) {
    state.gdsSidebar.activeDataElement = {} as LinkedElement;
  },
  [types.SET_APPROVERS](state, payload: DatasetOwner[]) {
    state.gdsSidebar.approvers = payload;
  },
  [types.SET_REQUESTOR](state, payload: DatasetOwner) {
    state.gdsSidebar.requestor = payload;
  },
  [types.SET_EDIT_REQUEST](state, payload: EditLinkageRequest) {
    state.gdsSidebar.editRequest = payload;
  },
  [types.SET_CWF_EDIT_REQUEST](state, payload: Partial<WorkFlow>) {
    state.gdsSidebar.cwfEditRequest = payload;
  },
  [types.SET_EDIT_REQUEST_ID](state, id: number) {
    state.gdsSidebar.editRequest.id = id;
  },
  [types.SET_ACTIVE_AND_DEFAULT_GDS_METADATA_FOR_EDIT](state) {
    state.gdsSidebar.activeMetadata = JSON.parse(
      JSON.stringify(GdsSidebarMapper.getInitialMetadataObj())
    );
    state.gdsSidebar.defaultMetadata = JSON.parse(
      JSON.stringify(GdsSidebarMapper.getInitialMetadataObj())
    );
  },
  [types.SET_ACTIVE_GDS_METADATA_FOR_EDIT](state, payload: any) {
    state.gdsSidebar.activeMetadata = payload;
  },
  [types.SET_DEFAULT_GDS_METADATA](state, payload: any) {
    state.gdsSidebar.defaultMetadata = payload;
  },
  [types.UPDATE_EDITED_GDS_METADATA](state, payload: DataSetDetails) {
    Object.assign(state.gdsSidebar.activeMetadata, payload);
  },
  [types.RESET_EDITED_METADATA](state) {
    state.gdsSidebar.activeMetadata = JSON.parse(
      JSON.stringify(state.gdsSidebar.defaultMetadata)
    );
  },
  [types.SET_ACTIVE_MODE](state, mode: string) {
    state.gdsSidebar.activeMode = mode;
  },
  [types.UPDATE_EDIT_REQUEST](state, payload: EditLinkageRequest) {
    Object.assign(state.gdsSidebar.editRequest, payload);
  },
  [types.SET_ATTR_SUGGESTIONS](state, suggestions: number[]) {
    state.gdsSidebar.activeAttrSuggestions = suggestions;
  },
  [types.STORE_OWNERSHIP_BEFORE_UPDATE](state, payload: OwnershipEditDetail) {
    state.gdsSidebar.ownershipBeforeUpdate = payload;
  },
  [types.SET_PARTIAL_APPROVED_DETAILS](state, approvedRequests) {
    state.approvedRequests = approvedRequests;
  },
  [types.SET_GDS_DQ_ISSUE](state, gdsDqIssue: GdsDqIssue) {
    state.gdsV2Data.gdsDqIssuesData = gdsDqIssue;
  },
  [types.SET_ACTIVE_GDS_SEGMENTATION_FILTER_ID](state, filterID: string) {
    state.gdsSegmentationFilters.activeFilterId = filterID;
  },
  [types.SET_PHYSICAL_ATTRIBUTES_BY_PHYSICAL_DATASET](
    state,
    { rowId, physicalAttributesByPhysicalDataset }
  ) {
    state.gdsSegmentationFilters.physicalDatasets.physicalAttributes[rowId] =
      physicalAttributesByPhysicalDataset.data;
  },
  [types.SET_SEGMENTS_AND_CONDITIONS_FOR_FILTER_AND_PHYSICAL_ATTRIBUTES](
    state,
    { key, segmentsAndConditions }
  ) {
    state.gdsSegmentationFilters.segments[key] = segmentsAndConditions.data;
  },
  [types.SET_ERROR_SEGMENTS_AND_CONDITIONS_FOR_FILTER_AND_PHYSICAL_ATTRIBUTES](
    state,
    errorResponse: string
  ) {
    state.gdsSegmentationFilters.segmentsAndConditionsError.error =
      errorResponse;
  },
  [types.CLEAR_ERROR_SEGMENTS_AND_CONDITIONS_FOR_FILTER_AND_PHYSICAL_ATTRIBUTES](
    state
  ) {
    state.gdsSegmentationFilters.segmentsAndConditionsError.error = '';
  },
  [types.SET_ACTIVE_GDS_SEGMENTATION_ATTRIBUTE_ID](
    state,
    physicalAttributeId: string
  ) {
    state.gdsSegmentationFilters.activePhysicalAttributeId =
      physicalAttributeId;
  },
  [types.SET_ACTIVE_SEGMENTS_AND_CONDITIONS_KEY](state, key: string) {
    state.gdsSegmentationFilters.activeSegmentsAndConditionsKey = key;
  },
  [types.SET_PHYSICAL_DATASET_TO_EDIT_IN_SEGMENTS_AND_CONDITIONS](
    state,
    physicalDatasetName: string
  ) {
    state.gdsSegmentationFilters.physicalDatasetToEditInSegmentsAndConditions =
      physicalDatasetName;
  },
  [types.SET_SEGMENTATION_FILTERS_BY_DATASET](
    state,
    segmentationFilters: SegmentationFiltersByDatasetResponse
  ) {
    state.gdsSegmentationFilters.segmentationFilters = segmentationFilters;
  },
  [types.SET_PHYSICAL_DATASETS_MAPPED_TO_GDS_FILTER](
    state,
    physicalDatasetMappedtoGdsFilter: PhysicalDatasetsMappedToGoldenDatasetsFilterResponse
  ) {
    state.gdsSegmentationFilters.physicalDatasetMappedtoGdsFilter =
      physicalDatasetMappedtoGdsFilter;
  },
  [types.SET_ERROR_PHYSICAL_DATASETS_MAPPED_TO_GDS_FILTER](
    state,
    errorResponse: string
  ) {
    state.gdsSegmentationFilters.physicalDatasetMappedtoGdsFilter.error =
      errorResponse;
  },
  [types.CLEAR_ERROR_PHYSICAL_DATASETS_MAPPED_TO_GDS_FILTER](state) {
    state.gdsSegmentationFilters.physicalDatasetMappedtoGdsFilter.error = null;
  },
  [types.SET_GDE_DQ_ISSUE](state, gdeDqIssue: GdeDqIssue[]) {
    state.gdsV2Data.gdeDqIssuesData = gdeDqIssue;
  },
  [types.SET_GDS_EDA_COMPLIANT](state, gdsEdaCompliant: boolean) {
    state.gdsEdaCompliant = gdsEdaCompliant;
  },
  [types.SET_PRE_APPROVAL_CONDITIONS](state, conditions: any[]) {
    state.preApprovalConditions = conditions;
  },
  [types.SET_ENABLE_DSA_REQUESTS](state, enableValue: boolean) {
    state.enableDSARequests = enableValue;
    state.dataSet.golden_dataset.disable_data_sharing_agreement_requests =
      enableValue;
    state.dataSet.golden_dataset.can_create_data_sharing_agreements =
      !enableValue;
  },
  [types.SET_DELEGATION_ACTIVE_USER_ROLE](state, role: ActiveDelegateRole) {
    state.delegations.activeRole = role;
  },
  [types.SET_DELEGATION_OWNER_LOGSIDS](state, logsIds: number[]) {
    state.delegations.datasetsOfOwner = logsIds;
  },
  [types.SET_DELEGATION_STEWARD_LOGSIDS](state, logsIds: number[]) {
    state.delegations.datasetsOfSteward = logsIds;
  },
  [types.SET_DELEGATION_USER_PROFILES](
    state,
    payload: IDelegationUserProfiles
  ) {
    state.delegations.datasetProfiles = payload.profiles;
    state.delegations.datasetOwnerCorpId = payload.ownerId;
    state.delegations.datasetStewardCorpId = payload.stewardId;
    state.delegations.datasetProfilesForLogsId = payload.forLogsId;
  },
  [types.SET_DELEGATION_ACTIVE_IDS](
    state,
    ids: { corpId: string; logsId: number }
  ) {
    state.delegations.activeUserCorpId = ids.corpId;
    state.delegations.logsId = ids.logsId;
  },
  [types.STORE_NEW_DELEGATION](state, payload: IDelegation) {
    // for POST API
    state.delegations.userActions.created.push(payload);
    // for UI
    const userRole =
      payload.delegationType === ActiveDelegateRole.owner
        ? 'owners'
        : 'stewards';
    state.delegations.copyOfExistingDelegators[userRole].push(payload);
  },
  [types.CANCEL_DELEGATION_CHANGES](state) {
    const originalList = JSON.parse(
      JSON.stringify(state.delegations.existingDelegators)
    );
    // fetch original list
    state.delegations.copyOfExistingDelegators = originalList;
    // remove user actions from store
    state.delegations.userActions.created = [];
    state.delegations.userActions.removed = [];
  },
  [types.CLEAR_COMPLETED_USER_ACTIONS_FROM_STORE](state) {
    state.delegations.userActions.created = [];
    state.delegations.userActions.removed = [];
  },
  [types.STORE_REMOVED_DELEGATION](state, payload: IRemovedDelegator) {
    // for DELETE API
    const userActions = JSON.parse(
      JSON.stringify(state.delegations.userActions)
    );
    // 1. check if it's a newly created item from user and NOT existing delegation
    const isNewlyCreated = userActions.created.find(
      (el: IDelegation) =>
        el.delegatedUserCorpId === payload.delegatedUserCorpId
    );
    if (isNewlyCreated) {
      // 1.1 if YES remove it from userActions created list and don't place it in userActions removed list
      const newActions = userActions.created.filter(
        (el: IDelegation) =>
          el.delegatedUserCorpId !== payload.delegatedUserCorpId
      );
      state.delegations.userActions.created = newActions;
    } else {
      // 1.2 if it's an existing action, update the userActions removed list
      state.delegations.userActions.removed.push(payload);
    }

    // for UI update
    const userRole =
      payload.delegationType === ActiveDelegateRole.owner
        ? 'owners'
        : 'stewards';
    const delegatorsCopy = JSON.parse(
      JSON.stringify(state.delegations.copyOfExistingDelegators)
    );
    // fetch new list without the removed delegator entry
    const newList = delegatorsCopy[userRole].filter(
      (el: IDelegation) =>
        el.delegatedUserCorpId !== payload.delegatedUserCorpId
    );
    state.delegations.copyOfExistingDelegators[userRole] = newList;
  },
  [types.SET_ALL_DELEGATIONS_TO_STORE](state, payload: Array<IDelegation>) {
    // 1. get all owners from payload ActiveDelegateRole
    const delegationsForDataOwner = payload.filter(
      (del: IDelegation) => del.delegationType === ActiveDelegateRole.owner
    );
    // 2. get all stewards from payload
    const delegationsForDataSteward = payload.filter(
      (del: IDelegation) => del.delegationType === ActiveDelegateRole.steward
    );
    // 3. add owners and stewards to existingDelegators and copyOfExistingDelegators
    state.delegations.existingDelegators = {
      owners: delegationsForDataOwner,
      stewards: delegationsForDataSteward
    };
    state.delegations.copyOfExistingDelegators = JSON.parse(
      JSON.stringify(state.delegations.existingDelegators)
    );
  },
  [types.SET_BULK_DATA_ACCESS_INITIAL_PAYLOAD](
    state,
    initialPayload: IBulkDataAccessRequest
  ) {
    state.bulkDataAccess.accessRequestPayload = deepCopy(initialPayload);
    state.bulkDataAccess.goldenDatasets = [];
    state.bulkDataAccess.accessRequestResponse.success = false;
    state.bulkDataAccess.accessRequestResponse.accessRequestDetails = [];
    state.filtersAndSegmentsLookUp = [];
  },
  [types.SET_BULK_DATA_ACCESS_PAYLOAD_USERINFO](
    state,
    userInfo: {
      corpId: number;
      userName: string;
    }
  ) {
    state.bulkDataAccess.accessRequestPayload.userCorpId = userInfo.corpId;
    state.bulkDataAccess.accessRequestPayload.userName = userInfo.userName;
  },
  [types.SET_BULK_DATA_ACCESS_PAYLOAD_USECASE_DATA](
    state,
    useCaseData: {
      useCaseId: number;
      useCaseName: string;
      useCaseDSPA: boolean;
    }
  ) {
    state.bulkDataAccess.accessRequestPayload.useCaseId = useCaseData.useCaseId;
    state.bulkDataAccess.accessRequestPayload.useCaseName =
      useCaseData.useCaseName;
    state.bulkDataAccess.accessRequestPayload.useCaseDSPA =
      useCaseData.useCaseDSPA;
  },
  [types.SET_BULK_DATA_ACCESS_PAYLOAD_CONSUMING_APP](
    state,
    consumingApp: { oarId: string }
  ) {
    state.bulkDataAccess.accessRequestPayload.oarId = consumingApp.oarId;
  },
  [types.SET_BULK_DATA_ACCESS_PAYLOAD_PERIOD](
    state,
    accessPeriod: { start: string; end: string }
  ) {
    state.bulkDataAccess.accessRequestPayload.dataAccessStartDate =
      accessPeriod.start;
    state.bulkDataAccess.accessRequestPayload.dataAccessEndDate =
      accessPeriod.end;
  },
  [types.SET_BULK_DATA_ACCESS_PAYLOAD_DATASETS](state, validDatasets) {
    state.bulkDataAccess.accessRequestPayload.goldenDatasets = validDatasets;
  },
  [types.SET_BULK_DATA_ACCESS_PAYLOAD_IDS_DATASETS](state, validDatasets) {
    state.bulkDataAccess.accessRequestPayload.integratedDatasets =
      validDatasets;
  },
  [types.SET_BULK_DATA_ACCESS_DATASETS_WITH_DETAILS](
    state,
    datasetsWithDetails: GoldenDatasetDetailsResult[]
  ) {
    state.bulkDataAccess.goldenDatasets = datasetsWithDetails;
  },
  [types.SET_BULK_DATA_ACCESS_DATASETS_IDS_WITH_DETAILS](
    state,
    datasetsWithDetails: IntegratedDatasetDetailsResult[]
  ) {
    state.bulkDataAccess.integratedDatasets = datasetsWithDetails;
  },
  [types.SET_CWF_FLAG](state, enabled: boolean) {
    state.gdsSidebar.cwfFlag = enabled;
  },
  [types.SET_BULK_DATA_ACCESS_DATAELEMENTS_OPTIONS](
    state,
    dataElementOptions: LinkedElement[]
  ) {
    state.bulkDataAccess.dataElementOptions = dataElementOptions;
  },
  [types.SET_BULK_DATA_ACCESS_IDS_DATAELEMENTS_OPTIONS](
    state,
    idsDataElementOptions: LinkedIDSElement[]
  ) {
    state.bulkDataAccess.idsDataElementOptions = idsDataElementOptions;
  },

  [types.SET_BULK_DATA_ACCESS_PAYLOAD_DATASET_ELEMENTS](
    state,
    datasetElementSelection: {
      logsId: number;
      allDataElementsSelected: boolean;
      dataElements: number[];
      totalDataElements: number;
    }
  ) {
    const index = findGdsIndex(state, datasetElementSelection.logsId);
    if (index !== -1) {
      state.bulkDataAccess.accessRequestPayload.goldenDatasets[
        index
      ].dataElements = datasetElementSelection.dataElements;
      state.bulkDataAccess.accessRequestPayload.goldenDatasets[
        index
      ].allDataElementsSelected =
        datasetElementSelection.allDataElementsSelected;
      state.bulkDataAccess.accessRequestPayload.goldenDatasets[
        index
      ].totalDataElements = datasetElementSelection.totalDataElements;
    }
  },
  [types.SET_BULK_DATA_ACCESS_PAYLOAD_DATASET_FILTERS](
    state,
    datasetFilterSelection: {
      logsId: number;
      filter: DatasetFilter;
      segments: FilterSegments[];
    }
  ) {
    const gdsIndex = findGdsIndex(state, datasetFilterSelection.logsId);
    if (gdsIndex !== -1) {
      const filterIndex = findFilterIndexOnGDS(
        state,
        gdsIndex,
        datasetFilterSelection.filter
      );
      const selectedFilterWithSegments = JSON.parse(
        JSON.stringify(
          prepareFilter(
            datasetFilterSelection.filter,
            datasetFilterSelection.segments
          )
        )
      );
      if (filterIndex !== -1) {
        // updation
        state.bulkDataAccess.accessRequestPayload.goldenDatasets[
          gdsIndex
        ].filtersAndSegments[filterIndex] = selectedFilterWithSegments;
      } else {
        // creation
        state.bulkDataAccess.accessRequestPayload.goldenDatasets[
          gdsIndex
        ].filtersAndSegments.push(selectedFilterWithSegments);
      }
    }
  },
  [types.SET_SEGMENTS_OPTIONS](state, segmentsOption: FilterSegments[]) {
    state.bulkDataAccess.tempSegmentsOptions = segmentsOption;
  },
  [types.SET_BULK_DATA_ACCESS_PAYLOAD_IDS_ELEMENTS](
    state,
    datasetElementSelection: {
      idsId: number;
      allDataElementsSelected: boolean;
      dataElements: number[];
      totalDataElements: number;
    }
  ) {
    const index = findIdsIndex(state, datasetElementSelection.idsId);
    if (index !== -1) {
      state.bulkDataAccess.accessRequestPayload.integratedDatasets[
        index
      ].dataElements = datasetElementSelection.dataElements;
      state.bulkDataAccess.accessRequestPayload.integratedDatasets[
        index
      ].allDataElementsSelected =
        datasetElementSelection.allDataElementsSelected;
      state.bulkDataAccess.accessRequestPayload.integratedDatasets[
        index
      ].totalDataElements = datasetElementSelection.totalDataElements;
    }
  },

  [types.SET_BULK_DATA_ACCESS_SELECTED_DATASET_ELEMENTS](
    state,
    dataElements: number[]
  ) {
    state.bulkDataAccess.tempSelectedDataElements = [...dataElements];
  },
  [types.SET_BULK_DATA_ACCESS_SELECTED_IDS_ELEMENTS](
    state,
    dataElements: number[]
  ) {
    state.bulkDataAccess.tempSelectedIDSDataElements = [...dataElements];
  },
  [types.SET_BULK_DATA_ACCESS_SELECTED_FILTER_SEGMENTS](
    state,
    filterWithSelectedSegments: DatasetFilter
  ) {
    state.bulkDataAccess.tempSelectedFilter = filterWithSelectedSegments;
    state.bulkDataAccess.tempSelectedSegments =
      filterWithSelectedSegments.segments;
  },
  [types.SET_BULK_DATA_ACCESS_TOTAL_DATAELEMENTS](
    state,
    totalDataElements: BlkRequestAccessGDECount
  ) {
    const index = findGdsIndex(state, totalDataElements.logsId);
    if (index !== -1) {
      state.bulkDataAccess.accessRequestPayload.goldenDatasets[
        index
      ].totalDataElements = totalDataElements.count;
    }
  },
  [types.SET_BULK_DATA_ACCESS_TOTAL_IDS_DATAELEMENTS](
    state,
    totalDataElements: BlkRequestAccessIDECount
  ) {
    const index = findIdsIndex(state, totalDataElements.idsId);
    if (index !== -1) {
      state.bulkDataAccess.accessRequestPayload.integratedDatasets[
        index
      ].totalDataElements = totalDataElements.count;
    }
  },

  [types.UPDATE_CWF_REQUEST](state, payload: any) {
    Object.assign(state.gdsSidebar.cwfEditRequest, payload);
  },
  [types.SET_NO_OF_FILES_LINKED](state, count: number) {
    state.gdsSidebar.noOfFilesLinked = count;
  },
  [types.SET_GDS_CREATION_LOOKUPS](state, gdsCreationLookups: any) {
    if (gdsCreationLookups) {
      state.gdsCreationLookups = gdsCreationLookups;
    }
  },
  [types.SET_ACTIVE_GDS_DATA](
    state: DataSetViewState,
    payload: GDSActiveDataPartial
  ) {
    state.gdsActiveData = {
      ...state.gdsActiveData,
      ...payload
    };
  },
  [types.SET_REPLACE_EDITED_FIELD](
    state,
    { field, value }: ReplaceEditedFieldPayload
  ) {
    state.bulkDataAccess.editedFields.replace[field] = value;
  },
  [types.SET_ADD_EDITED_FIELD](state, { field, value }: AddEditedFieldPayload) {
    state.bulkDataAccess.editedFields.add[field] = value;
  },
  [types.SET_REMOVE_EDITED_FIELD](
    state,
    { field, value }: RemoveEditedFieldPayload
  ) {
    state.bulkDataAccess.editedFields.remove[field] = value;
  },
  [types.SET_PREVIOUSLY_SELECTED_DATA_ELEMENTS](state, dataElements: number[]) {
    state.bulkDataAccess.previouslySelectedDataElements = [...dataElements];
  },
  [types.SET_PREVIOUSLY_SELECTED_IDS_DATA_ELEMENTS](
    state,
    dataElements: number[]
  ) {
    state.bulkDataAccess.previouslySelectedIDSDataElements = [...dataElements];
  },

  [types.SET_BULK_DATA_ACCESS_APPROVAL_DETAILS](
    state,
    approvalDetails: ApprovalDetailType[]
  ) {
    state.bulkDataAccess.editDSAInfo.approvalDetails = [...approvalDetails];
  },

  [types.SET_SHOW_IDS_DSA_REQUESTED](state, payload: boolean) {
    state.bulkDataAccess.showIDSDSARequested = payload;
  },
  [types.MUTATE_DATA_SET_WITH_FILTER](
    state,
    payload: GoldenDatasetDetailsResult[]
  ) {
    state.dataSetWithFilter = payload;
  },
  [types.MUTATE_DATA_SET_WITH_FILTER_WITH_APPEND](
    state,
    payload: GoldenDatasetDetailsResult[]
  ) {
    if (state.dataSetWithFilter && state.dataSetWithFilter.length > 0) {
      state.dataSetWithFilter = [...state.dataSetWithFilter, ...payload];
    } else {
      state.dataSetWithFilter = payload;
    }
  },
  [types.SET_DATA_ELEMENTS_TO_DATASET](
    state,
    { logid, elements }: { logid: number; elements: GDSDataElementType[] }
  ) {
    const indexToUpdate =
      state.dataSetWithFilter?.findIndex(
        (gds) => gds.golden_dataset.logs_id === logid
      ) ?? -1;
    if (indexToUpdate !== -1 && state.dataSetWithFilter) {
      state.dataSetWithFilter[indexToUpdate].golden_elements = elements;
    }
  },
  [types.SET_DATASET_FILTERS_SEGMENTS_LOOK_UP](
    state: DataSetViewState,
    payload: FilterSegmentSearchResult[]
  ) {
    state.filtersAndSegmentsLookUp = payload;
  },
  [types.SET_PREVIOUSLY_SELECTED_FILTER_SEGMENTS](state, datasetFilters) {
    state.bulkDataAccess.previouslySelectedFiltersSegments = datasetFilters;
  },
  [types.SET_BULK_DATA_ACCESS_PAYLOAD_INTENDED_AND_TYPE_OF_USE](
    state: DataSetViewState,
    useCaseData: {
      intendedUseId: number;
      typeOfUseId: number;
    }
  ) {
    state.bulkDataAccess.accessRequestPayload.useCaseIntendedUseId =
      useCaseData.intendedUseId;
    state.bulkDataAccess.accessRequestPayload.useCaseTypeOfUseId =
      useCaseData.typeOfUseId;
  },
  [types.CLEAR_DATASET_WITH_FILTER_DATA](state: DataSetViewState) {
    state.dataSetWithFilter = [];
  },
  [types.SET_TECHNICAL_METADATA_FOR_GOLDEN_DATASET](
    state: DataSetViewState,
    techmetaData: ITechnicalMetadataDetails
  ) {
    state.technicalMetadataForGoldenDataset.logsId = techmetaData.logsId;
    state.technicalMetadataForGoldenDataset.physicalDatasets =
      techmetaData.physicalDatasets;
  }
};
