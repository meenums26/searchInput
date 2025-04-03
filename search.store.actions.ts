import deepCopy from '@/common/utils/deepCopy';
import { GdsSidebarMapper } from '@/datasetView/components/gds-sidebar/mapper/gds-sidebar.mapper';
import {
  GdsSidebarEditOwnership,
  OwnershipEditDetail
} from '@/datasetView/components/gds-sidebar/models/gds-sidebar.model';
import { GdsSidebarStorage } from '@/datasetView/components/gds-sidebar/storage/gds-sidebar.storage';
import { gdsEditWorkflowUtil } from '@/datasetView/utilities/gdsEditWorkflow.utils';
import { WorkFlow } from '@/datasetView/workFlow/model';
import { dqMonitoringStorage } from '@/datasetView/dataQuality/scores/storage';
import { ActionContext } from 'vuex';
import {
  IBulkDataAccessResponse,
  IEditDataAccessResponse,
  DatasetFilter,
  FilterSegments,
  DataProductRequestDetails
} from '@/datasetView/usecase-v2/tabs/dsa/bulkRequestAccessToGoldenDatasets/shared/models';
import { WorkFlowServices } from '@/datasetView/workFlow/services/workflow.service';
import { WorkflowStorage } from '@/datasetView/workFlow/storage';
import { oarApi, registerGdsApi } from '@/datasetView/services';
import { httpRequest } from '@/common/services';
import * as constants from '@/common/constants';
import moment from 'moment';
import {
  DEFAULT_DATE_FORMAT,
  EDITED_FIELDS,
  EDITED_FIELDS_OPERATIONS
} from '@/datasetView/usecase-v2/tabs/dsa/bulkRequestAccessToGoldenDatasets/shared/constants';
import { DataElements } from '@/datasetView/dsaa/models/data-request';
import { dsaaFactory } from '@/datasetView/dsaa/services';
import { IdsStorage } from '@/datasetView/integratedDatasets/storage';
import { IdeService } from '@/datasetView/integratedDatasets/services/ide.service';
import { IdeGdeMapperDetails } from '@/datasetView/integratedDatasets/model';
import { useStorage } from '@/core/plugin';
import { ENABLE_DSA_FILTER_SEGMENTS } from '@/common/constants';
import * as fromUCDsa from '@/datasetView/usecase-v2/tabs/dsa/storage/index';
import * as fromUCV2Store from '@/datasetView/usecase-v2/storage/store';
import {
  DataForAutoSuggest,
  DataSearchParams,
  DataSet,
  DataSetDetailsResponse,
  DataSetHttpResponse,
  DataSetViewState,
  DQIssuesApiRequest,
  DQScoresApiRequest,
  EditLinkageRequest,
  GDSDQIssueType,
  GDSDQScoreType,
  LinkageStatusCode,
  RootState,
  GDSActiveDataPartial,
  IntegratedDataSetDetailsResponse,
  EditPayload,
  MappedGde,
  MappedIde,
  FilterPhysicalAttributesByPhysicalDatasetPayload,
  SegmentsAndConditionsForFilterAndPhysicalAttributePayload,
  PayloadUpdateFilterSegmentsValuesByFilterAndPhysicalAttributeRoot
} from '../../model/DvModel';
import {
  DataAPIFetch,
  datasetViewFactory,
  workflowApi
} from '../../services/index';
import * as types from '../index';
import { SearchStoreMapper } from './search.store.mappers';
import { DelegationHelpers, handleError } from './utils/helpers';

export default {
  [types.MAPPED_INTEGRATED_DATA_ELEMENTS](
    { commit }: ActionContext<DataSetViewState, RootState>,
    mappedIdes: MappedIde[]
  ): void {
    commit(types.MUTATE_MAPPED_INTEGRATED_DATA_ELEMENTS, mappedIdes);
  },
  [types.MAPPED_GOLDEN_DATA_ELEMENTS](
    { commit }: ActionContext<DataSetViewState, RootState>,
    mappedGdes: MappedGde[]
  ): void {
    commit(types.MUTATE_MAPPED_GOLDEN_DATA_ELEMENTS, mappedGdes);
  },
  [types.GET_DATA_SET_DETAILS_BY_ID](
    { commit }: ActionContext<DataSetViewState, RootState>,
    reqObject: { logsID: string; callSourcingV2: boolean }
  ): Promise<DataSetDetailsResponse | Error> {
    return new Promise((resolve, reject) => {
      datasetViewFactory
        .getDetailsBySrcId(reqObject.logsID, reqObject.callSourcingV2)
        .then(({ data }: any) => {
          const dataSet = JSON.parse(JSON.stringify(data));
          commit(types.MUTATE_DATA_SET, dataSet);
          resolve(dataSet);
        })
        .catch((error) => reject(error));
    });
  },
  [types.GET_SELECTED_DATA_SETS]({
    getters,
    commit
  }: ActionContext<DataSetViewState, RootState>): void {
    const dataSet: DataSetDetailsResponse = getters[types.DATA_SET];
    commit(types.MUTATE_SELECTED_DATA_SETS, dataSet);
  },
  [types.REMOVE_DATA_SETS](
    { commit }: ActionContext<DataSetViewState, RootState>,
    index: number
  ): void {
    commit(types.MUTATE_REMOVE_DATA_SETS, index);
  },
  [types.REMOVE_INTEGRATED_DATA_SET](
    { commit }: ActionContext<DataSetViewState, RootState>,
    index: number
  ): void {
    commit(types.MUTATE_REMOVE_INTEGRATED_DATA_SET, index);
  },
  [types.SELECTED_INTEGRATED_DATA_SET](
    { commit }: ActionContext<DataSetViewState, RootState>,
    selectedIds: IntegratedDataSetDetailsResponse
  ): void {
    commit(types.MUTATE_SELECTED_INTEGRATED_DATA_SETS, selectedIds);
  },
  [types.GET_DATA_SET_LIST](
    actionContext: ActionContext<DataSetViewState, RootState>,
    { key, category }: DataSearchParams
  ): Promise<DataSetHttpResponse> {
    return DataAPIFetch[category](key);
  },
  [types.GET_DATA_SET_LIST_BY_INDEX](
    actionContext: ActionContext<DataSetViewState, RootState>,
    index: number
  ): Promise<DataSetHttpResponse> {
    return datasetViewFactory.getRecommendationsByIndex(index);
  },
  async [types.GET_DATA_SET_ID](
    actionContext: ActionContext<DataSetViewState, RootState>,
    { key }: DataSearchParams
  ): Promise<DataSet[]> {
    return datasetViewFactory.getDataSetSearchById(key);
  },
  [types.GET_DATA_SET_WITH_FILTER](
    actionContext: ActionContext<DataSetViewState, RootState>,
    reqOptions: { filterApplied: any; callSourcingV2: boolean }
  ): Promise<DataSetHttpResponse> {
    return datasetViewFactory.getFullListDataSourceWithFilter(
      reqOptions.filterApplied,
      reqOptions.callSourcingV2
    );
  },
  [types.GET_DATA_SET_WITH_FILTER_PARAMS](
    actionContext: ActionContext<DataSetViewState, RootState>,
    reqOptions: { filterApplied: any; callSourcingV2: boolean }
  ): Promise<DataSetHttpResponse> {
    return datasetViewFactory.getFullListDataSourceWithFilterParams(
      reqOptions.filterApplied,
      reqOptions.callSourcingV2
    );
  },
  // added Mutation can be used in other Components - Prefer this
  async [types.GET_DATA_SET_WITH_FILTER_NEW](
    { commit }: ActionContext<DataSetViewState, RootState>,
    reqOptions: {
      filterApplied: any;
      callSourcingV2: boolean;
      withAppend: boolean;
    }
  ): Promise<any> {
    const { data } = (await datasetViewFactory.getFullListDataSourceWithFilter(
      reqOptions.filterApplied,
      reqOptions.callSourcingV2
    )) as any;
    if (reqOptions.withAppend) {
      commit(types.MUTATE_DATA_SET_WITH_FILTER_WITH_APPEND, data.results);
    } else {
      commit(types.MUTATE_DATA_SET_WITH_FILTER, data.results);
    }
  },
  [types.GET_FILTER_OPTIONS](): Promise<DataSetHttpResponse> {
    return datasetViewFactory.getFilterOptions();
  },
  async [types.GET_OAR_BY_CIA_RATING](
    actionContext: ActionContext<DataSetViewState, RootState>,
    oarCIARequested: string
  ): Promise<any> {
    return datasetViewFactory.getOARsByCIA(oarCIARequested);
  },
  async [types.GET_FILTER_OPTIONS_FOR_IDEGDS_MAPPER](
    { commit, getters }: ActionContext<DataSetViewState, RootState>,
    callSourcingV2: boolean
  ) {
    const logsIdfilterOptions: [] = getters[types.LOGS_ID_FILTER_OPTIONS];
    if (logsIdfilterOptions.length !== 0) return;
    const { data } = (await datasetViewFactory.getFullListDataSourceWithFilter(
      '',
      callSourcingV2
    )) as any;
    const gdsFilterOptions: any = data;
    commit(
      types.MUTATE_LOGS_ID_FILTER_OPTIONS,
      gdsFilterOptions.filter_choices.logs_id
    );
  },
  [types.GET_DATASET_ATTRIBUTES](
    actionContext: ActionContext<DataSetViewState, RootState>,
    payload: { logsId: number; callSourcingV2: boolean }
  ): Promise<any> {
    return datasetViewFactory.getDatasetAttributes(
      payload.logsId,
      payload.callSourcingV2
    );
  },
  async [types.FETCH_BULK_DATA_ACCESS_DATAELEMENTS_OPTIONS](
    { commit }: ActionContext<DataSetViewState, RootState>,
    payload: {
      logsId: number;
      paginationDataFilter: string;
      callSourcingV2: boolean;
    }
  ): Promise<void> {
    commit(types.SET_BULK_DATA_ACCESS_DATAELEMENTS_OPTIONS, []);
    const { data } = await datasetViewFactory.fetchDatasetElements(
      payload.logsId,
      payload.paginationDataFilter,
      payload.callSourcingV2
    );
    if (!data) {
      return;
    }

    commit(types.SET_BULK_DATA_ACCESS_DATAELEMENTS_OPTIONS, data.results);
    commit(types.SET_BULK_DATA_ACCESS_TOTAL_DATAELEMENTS, {
      logsId: payload.logsId,
      count: data.count
    });
  },

  async [types.FETCH_BULK_DATA_ACCESS_IDS_DATAELEMENTS_OPTIONS](
    { commit }: ActionContext<DataSetViewState, RootState>,
    payload: {
      idsId: number;
      paginationDataFilter: string;
    }
  ): Promise<void> {
    commit(types.SET_BULK_DATA_ACCESS_IDS_DATAELEMENTS_OPTIONS, []);

    let mappings: IdeGdeMapperDetails[] = [];

    await IdsStorage.fetchIdsElements(payload.idsId?.toString());
    try {
      mappings = await IdeService.fetchIdeGdeMapping({
        idsIds: [payload.idsId]
      });
    } catch (error) {
      mappings = [];
    }

    const { results } = IdsStorage.idsDataElements();
    const parsedResults = JSON.parse(JSON.stringify(deepCopy(results)));
    parsedResults.forEach((element: any) => {
      const mapping = mappings.find((m) => m.idsId === element.idsId);
      element.hasDisabledDsaSetting = mapping?.ideDetails.find(
        (i) => i.ideId.toString() === element.ideId.toString()
      )?.hasDisabledDSASetting;
    });
    if (!parsedResults) {
      return;
    }
    commit(types.SET_BULK_DATA_ACCESS_IDS_DATAELEMENTS_OPTIONS, parsedResults);
    commit(types.SET_BULK_DATA_ACCESS_TOTAL_IDS_DATAELEMENTS, {
      idsId: payload.idsId,
      count: parsedResults.length
    });
  },

  async [types.SAVE_GOLDEN_DATA_SET_CHANGES]({
    commit,
    state,
    getters
  }: ActionContext<DataSetViewState, RootState>): Promise<void> {
    // check common workflow enabled
    const isCWFenabled = getters[types.GET_GDS_CWF_FLAG];
    /* check if there is any id in editRequest */

    /* get payload */
    const payload: EditLinkageRequest = getters[types.GET_EDIT_REQUEST];

    if (!isCWFenabled) {
      const { id } = state.gdsSidebar.editRequest;
      /* define http request type */
      if (id) {
        const { data } = await datasetViewFactory.updateGoldenDataSetChanges(
          payload,
          id
        );
        GdsSidebarStorage.setEditRequest(data);
      } else {
        const { data } = await datasetViewFactory.saveGoldenDataSetChanges(
          payload
        );
        commit(types.SET_EDIT_REQUEST_ID, data.id);
        GdsSidebarStorage.setEditRequest(data);
      }
    } else {
      let cwfResult = {} as Partial<WorkFlow>;
      const cwfPayload: Partial<WorkFlow> = deepCopy(
        getters[types.GET_CWF_EDIT_REQUEST]
      );
      // eslint-disable-next-line no-restricted-syntax
      for (const [key, value] of Object.entries(deepCopy(payload))) {
        cwfPayload.workflowModule[key] = value;
      }
      GdsSidebarStorage.setCommonWorkflowRequest(cwfPayload);
      const cwfRequestID = state.gdsSidebar.cwfEditRequest.requestId;
      if (cwfRequestID) {
        cwfResult = await WorkFlowServices.updateWorkFlowDetails(cwfPayload);
      } else {
        cwfResult = await workflowApi.saveToWorkflow(cwfPayload);
        commit(types.SET_EDIT_REQUEST_ID, cwfResult.requestId);
      }
      GdsSidebarStorage.setEditRequest(deepCopy(cwfResult?.workflowModule));
      GdsSidebarStorage.setCommonWorkflowRequest(cwfResult);
    }
  },
  [types.GET_GDS_SIDEBAR_OWNERSHIP]({
    getters,
    commit
  }: ActionContext<DataSetViewState, RootState>): void {
    const dataSet: DataSetDetailsResponse = getters[types.DATA_SET];
    const gdsSidebarOwnership: GdsSidebarEditOwnership =
      GdsSidebarMapper.mapDataSetToGdsSidebarOwnership(dataSet);
    commit(types.SET_GDS_SIDEBAR_EDIT_OWNERSHIP, gdsSidebarOwnership);
  },
  async [types.GET_OAR_DETAILS_BY_ID](
    { commit, state }: ActionContext<DataSetViewState, RootState>,
    oarName: string
  ) {
    try {
      const { data } = await oarApi.getOarDetailsById(oarName);

      if (data && data.length) {
        const foundOar = data.find(
          (oar) => oar.oarNumber === state.dataSet.golden_dataset?.golden_src_id
        );
        const oarDetails = foundOar || data[0];

        commit(types.MUTATE_CURRENT_OAR_DETAILS, oarDetails);
      }
    } catch (err) {}
  },
  async [types.SAVE_GDS_OWNERSHIP_EDIT](
    { getters, dispatch }: ActionContext<DataSetViewState, RootState>,
    callSourcingV2: boolean
  ): Promise<any> {
    const dataSet: DataSetDetailsResponse = getters[types.DATA_SET];
    const logsId: number = dataSet.golden_dataset.logs_id;
    const ownershipEditData: GdsSidebarEditOwnership =
      getters[types.GET_GDS_EDIT_OWNERSHIP];
    try {
      const response = await datasetViewFactory.saveGdsMetadataEdit(
        ownershipEditData,
        logsId,
        callSourcingV2
      );
      dispatch(types.SAVE_OWNERSHIP_CHANGES_TO_DMP);
      dispatch(types.GET_DATA_SET_DETAILS_BY_ID, {
        logsID: logsId,
        callSourcingV2
      });
      return Promise.resolve(response);
    } catch (error) {
      return Promise.reject(error);
    }
  },
  async [types.SAVE_APPROVED_GDS_EDIT](
    { getters }: ActionContext<DataSetViewState, RootState>,
    payload: { corpId: number; comments: string; callSourcingV2: boolean }
  ): Promise<void> {
    const editRequest: EditLinkageRequest = getters[types.GET_EDIT_REQUEST];
    await gdsEditWorkflowUtil.callEditApprovedApis(
      editRequest,
      payload.corpId,
      LinkageStatusCode.Approved,
      false, // common workflow boolean
      payload.callSourcingV2,
      payload.comments
    );
  },
  async [types.SAVE_PREAPPROVAL_CONDITIONS](
    { commit }: ActionContext<DataSetViewState, RootState>,
    payload: { conditions: any; logsId: number; corpId: number }
  ): Promise<void> {
    const { data } = await datasetViewFactory.savePreApprovalConditions(
      payload
    );
    commit(types.SET_PRE_APPROVAL_CONDITIONS, data.conditions);
  },
  async [types.SAVE_ENABLE_DSA_REQUESTS](
    { commit }: ActionContext<DataSetViewState, RootState>,
    payload: {
      enableValue: any;
      logsId: number;
    }
  ): Promise<void> {
    await datasetViewFactory.saveEnableDSARequest(payload);
    commit(types.SET_ENABLE_DSA_REQUESTS, payload.enableValue);
  },
  async [types.FETCH_PRE_APPROVAL_CONDITIONS](
    { commit }: ActionContext<DataSetViewState, RootState>,
    payload: { logsId: number; corpId: number }
  ): Promise<void> {
    try {
      const conditions = await datasetViewFactory.fetchPreApprovalConditions(
        payload
      );
      commit(types.SET_PRE_APPROVAL_CONDITIONS, conditions.data.conditions);
    } catch (err) {}
  },
  async [types.SAVE_PARTIALLY_APPROVED_GDS_EDIT](
    { getters }: ActionContext<DataSetViewState, RootState>,
    payload: { corpId: number; comments: string; callSourcingV2: boolean }
  ): Promise<void> {
    // check common workflow enabled
    const isCWFenabled = getters[types.GET_GDS_CWF_FLAG];
    if (!isCWFenabled) {
      const editRequest: EditLinkageRequest = getters[types.GET_EDIT_REQUEST];
      const approvedRequest: any = getters[types.GET_PARTIAL_APPROVED_DETAILS];
      const filteredApprovedEditRequest: EditLinkageRequest =
        gdsEditWorkflowUtil.filterPartialApproved(
          JSON.parse(JSON.stringify(editRequest)),
          JSON.parse(JSON.stringify(approvedRequest))
        );
      await gdsEditWorkflowUtil.callEditApprovedApis(
        filteredApprovedEditRequest,
        payload.corpId,
        LinkageStatusCode.PartiallyApproved,
        isCWFenabled,
        payload.callSourcingV2,
        payload.comments
      );
      await gdsEditWorkflowUtil.savePartialApprovalToDMP(
        approvedRequest,
        editRequest.id as number
      );
    } else {
      const cwfPayload: Partial<WorkFlow> =
        WorkflowStorage.getWorkFlowDetails();
      const approvedChanges: EditLinkageRequest =
        gdsEditWorkflowUtil.getApprovedNewCommonWorkflowChanges(
          JSON.parse(JSON.stringify(deepCopy(cwfPayload.workflowModule))),
          JSON.parse(
            JSON.stringify(deepCopy(cwfPayload.workflowModuleApproved))
          )
        );
      await gdsEditWorkflowUtil.callEditApprovedApis(
        approvedChanges,
        payload.corpId,
        LinkageStatusCode.PartiallyApproved,
        isCWFenabled,
        payload.callSourcingV2,
        payload.comments
      );
    }
  },
  async [types.DELETE_CURRENT_REQUEST]({
    state
  }: ActionContext<DataSetViewState, RootState>): Promise<void> {
    if (!state.gdsSidebar.cwfFlag) {
      await datasetViewFactory.deleteCurrentRequest(
        state.gdsSidebar.editRequest.id as number
      );
    } else {
      await datasetViewFactory.deleteCommonWorkflowCurrentRequest(
        state.gdsSidebar.cwfEditRequest.requestId as number
      );
    }
  },
  async [types.GET_DATA_ATTRIBUTE_RECOMMENDATIONS](
    { commit }: ActionContext<DataSetViewState, RootState>,
    dataForAutoSuggest: DataForAutoSuggest
  ): Promise<void> {
    const { data } = await datasetViewFactory.getDataAttributeSuggestions(
      dataForAutoSuggest
    );
    commit(types.SET_ATTR_SUGGESTIONS, data);
  },
  async [types.SAVE_OWNERSHIP_CHANGES_TO_DMP]({
    getters
  }: ActionContext<DataSetViewState, RootState>): Promise<void> {
    const ownershipDetailsToSave: OwnershipEditDetail =
      getters[types.GET_OWNERSHIP_BEFORE_CHANGE];
    await datasetViewFactory.saveOwnershipEditToDMP(ownershipDetailsToSave);
  },
  async [types.SET_GDS_DQ_SCORE_DATA](
    { commit }: ActionContext<DataSetViewState, RootState>,
    dqReqBody: DQScoresApiRequest
  ) {
    let dqData: GDSDQScoreType = {
      score: null,
      status: 'NO_DATA',
      threshold: null,
      elements: []
    };

    try {
      commit(types.SET_GDS_DQ_SCORE_LOADING);
      const dqResponse = await dqMonitoringStorage.fetchGdsDataQualityScore(
        dqReqBody.logs_id
      );
      if (dqResponse.dq_score) {
        dqData = SearchStoreMapper.mapDQResponse(dqResponse);
      }

      commit(types.SAVE_GDS_DQ_SCORE_DATA, dqData);
    } catch (err) {
      commit(types.SET_GDS_DQ_SCORE_NO_DATA);
    }
  },

  async [types.SET_GDS_DQ_ISSUE_DATA](
    { commit }: ActionContext<DataSetViewState, RootState>,
    dqReqBody: DQIssuesApiRequest
  ) {
    let dqData: GDSDQIssueType = {
      status: 'empty',
      elements: [],
      gdeElements: []
    };

    try {
      commit(types.SET_GDS_DQ_ISSUE_LOADING);
      if (dqReqBody.element_id.length != 0) {
        const dqResponse = await datasetViewFactory.getDataQualityIssues(
          dqReqBody
        );
        if (dqResponse.elements.length != 0) {
          dqData = SearchStoreMapper.mapDQIssueResponse(dqResponse);
        }
      }

      commit(types.SAVE_GDS_DQ_ISSUE_DATA, dqData);
    } catch (err) {
      commit(types.SET_GDS_DQ_ISSUE_NO_DATA);
    }
  },

  async [types.SET_PARTIAL_APPROVED_DETAILS](
    { commit }: ActionContext<DataSetViewState, RootState>,
    partialApprovedData: DataForAutoSuggest
  ) {
    commit(types.SET_PARTIAL_APPROVED_DETAILS, partialApprovedData);
  },
  async [types.FETCH_SEGMENTATION_FILTERS_BY_DATASET](
    { commit }: ActionContext<DataSetViewState, RootState>,
    gdsID: string
  ) {
    try {
      const segmentationFiltersByDataset =
        await datasetViewFactory.getSegmentationFiltersByDataset(gdsID);
      commit(
        types.SET_SEGMENTATION_FILTERS_BY_DATASET,
        segmentationFiltersByDataset.data
      );
    } catch (err) {
      console.log(err);
    }
  },
  async [types.FETCH_PHYSICAL_ATTRIBUTES_BY_PHYSICAL_DATASET](
    { commit, state }: ActionContext<DataSetViewState, RootState>,
    rowId: string
  ) {
    // If physicalAttributes are already fetched, return them
    if (
      state.gdsSegmentationFilters.physicalDatasets.physicalAttributes[rowId]
    ) {
      return state.gdsSegmentationFilters.physicalDatasets.physicalAttributes[
        rowId
      ];
    }

    // Otherwise, fetch them from the backend
    try {
      const physicalAttributesByPhysicalDataset =
        await datasetViewFactory.getPhysicalAttributesByPhysicalDataset(rowId);
      commit(types.SET_PHYSICAL_ATTRIBUTES_BY_PHYSICAL_DATASET, {
        rowId,
        physicalAttributesByPhysicalDataset
      });
      return Promise.resolve(physicalAttributesByPhysicalDataset);
    } catch (err) {
      return Promise.reject(err);
    }
  },
  async [types.FETCH_SEGMENTS_AND_CONDITIONS_FOR_FILTER_AND_PHYSICAL_ATTRIBUTES](
    { commit, state }: ActionContext<DataSetViewState, RootState>,
    rowData: SegmentsAndConditionsForFilterAndPhysicalAttributePayload
  ) {
    const key = `${rowData.activeFilterId}-${rowData.physicalAttributeId}`; // Create a unique key
    commit(types.SET_ACTIVE_SEGMENTS_AND_CONDITIONS_KEY, key);
    commit(
      types.SET_ACTIVE_GDS_SEGMENTATION_ATTRIBUTE_ID,
      rowData.physicalAttributeId
    );

    // If segmentsAndConditions are already fetched, return them
    if (state.gdsSegmentationFilters.segments[key] && !rowData.updateState) {
      return state.gdsSegmentationFilters.segments[key];
    }

    // Clear any existing error before making a new request
    commit(
      types.CLEAR_ERROR_SEGMENTS_AND_CONDITIONS_FOR_FILTER_AND_PHYSICAL_ATTRIBUTES
    );

    // Otherwise, fetch them from the backend
    try {
      const segmentsAndConditions =
        await datasetViewFactory.getSegmentsAndConditionsForFilterAndPhysicalAttribute(
          rowData.activeFilterId,
          rowData.physicalAttributeId
        );
      commit(
        types.SET_SEGMENTS_AND_CONDITIONS_FOR_FILTER_AND_PHYSICAL_ATTRIBUTES,
        {
          key,
          segmentsAndConditions
        }
      );
      return Promise.resolve(segmentsAndConditions);
    } catch (err) {
      handleError(
        err,
        commit,
        types.SET_ERROR_SEGMENTS_AND_CONDITIONS_FOR_FILTER_AND_PHYSICAL_ATTRIBUTES
      );
      return Promise.reject(err);
    }
  },
  async [types.FETCH_PHYSICAL_DATASETS_MAPPED_TO_GDS_FILTER](
    { commit }: ActionContext<DataSetViewState, RootState>,
    filterID: string
  ): Promise<void> {
    // Clear any existing error before making a new request
    commit(types.CLEAR_ERROR_PHYSICAL_DATASETS_MAPPED_TO_GDS_FILTER);

    try {
      const physicalDatasetsMappedToGoldenDatasetsFilter =
        await datasetViewFactory.getPhysicalDatasetsMappedToGoldenDatasetsFilter(
          filterID
        );
      commit(
        types.SET_PHYSICAL_DATASETS_MAPPED_TO_GDS_FILTER,
        physicalDatasetsMappedToGoldenDatasetsFilter.data
      );
      commit(types.SET_ACTIVE_GDS_SEGMENTATION_FILTER_ID, filterID);
    } catch (err) {
      handleError(
        err,
        commit,
        types.SET_ERROR_PHYSICAL_DATASETS_MAPPED_TO_GDS_FILTER
      );
      return Promise.reject(err);
    }
  },
  async [types.UPDATE_GDS_SEGMENTATION_PHYSICAL_DATASET_ATTRIBUTES](
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    { commit }: ActionContext<DataSetViewState, RootState>,
    payload: FilterPhysicalAttributesByPhysicalDatasetPayload
  ) {
    try {
      const response =
        await datasetViewFactory.updatePhysicalAttributesByPhysicalDataset(
          payload.filterID,
          payload.data
        );
      return Promise.resolve(response);
    } catch (err) {
      return Promise.reject(err);
    }
  },
  async [types.UPDATE_GDS_FILTER_SEGMENTS_VALUES](
    { commit: _commit }: ActionContext<DataSetViewState, RootState>,
    payload: PayloadUpdateFilterSegmentsValuesByFilterAndPhysicalAttributeRoot
  ) {
    try {
      const response = await datasetViewFactory.updateFilterSegmentsValues(
        payload.filterId,
        payload.physicalAttributeId,
        payload.data
      );
      return Promise.resolve(response);
    } catch (err) {
      return Promise.reject(err);
    }
  },
  async [types.FETCH_GDS_GDE_DQ_ISSUES](
    { commit }: ActionContext<DataSetViewState, RootState>,
    gdsId: number
  ) {
    try {
      const gdsGdeDqIssues = await datasetViewFactory.fetchGdsGdeDqIssues(
        gdsId
      );
      commit(types.SET_GDS_DQ_ISSUE, gdsGdeDqIssues.gdsDqIssues);
      commit(types.SET_GDE_DQ_ISSUE, gdsGdeDqIssues.gdeDqIssues);
    } catch (err) {}
  },
  async [types.FETCH_GDS_EDA_COMPLIANT](
    { commit }: ActionContext<DataSetViewState, RootState>,
    gdsId: number
  ) {
    try {
      const gdsEdaCompliant = await datasetViewFactory.getEdaCompliantForGds(
        gdsId
      );
      commit(types.SET_GDS_EDA_COMPLIANT, gdsEdaCompliant.eda_compliancy_flag);
    } catch (err) {}
  },
  async [types.SAVE_AND_CLOSE_DELEGATIONS]({
    state,
    commit
  }: ActionContext<DataSetViewState, RootState>) {
    try {
      // 1. get payload for creating new delegations
      const toBeCreated = DelegationHelpers.prepareDelegationPayload(
        state.delegations.userActions.created,
        state
      );
      // 2. get payload for deleting existing delegations
      const toBeDeleted = DelegationHelpers.prepareDelegationPayload(
        state.delegations.userActions.removed,
        state
      );
      // 3. send http for creating new and removing existing
      const apiResponses = await Promise.allSettled([
        toBeCreated.length > 0
          ? datasetViewFactory.createNewDelegations(toBeCreated)
          : undefined,
        toBeDeleted.length > 0
          ? datasetViewFactory.deleteExistingDelegations(toBeDeleted)
          : undefined
      ]);
      commit(types.CLEAR_COMPLETED_USER_ACTIONS_FROM_STORE);
    } catch (err) {}
  },
  async [types.GET_ALL_DELEGATIONS](
    { commit }: ActionContext<DataSetViewState, RootState>,
    logsID: number
  ) {
    try {
      const { results } = await datasetViewFactory.getExistingDelegations(
        logsID
      );
      commit(types.SET_ALL_DELEGATIONS_TO_STORE, results);
    } catch (err) {}
  },
  async [types.REQUEST_BULK_DATA_ACCESS_TO_GOLDEN_DATASETS](
    { state }: ActionContext<DataSetViewState, RootState>,
    endpointFeature: boolean
  ): Promise<IBulkDataAccessResponse | unknown> {
    try {
      const requestAccessResponse =
        await datasetViewFactory.requestAccessToGoldenDatasets(
          state.bulkDataAccess.accessRequestPayload,
          endpointFeature
        );
      return Promise.resolve(requestAccessResponse);
    } catch (err) {
      return Promise.resolve(err);
    }
  },

  async [types.REQUEST_BULK_DATA_ACCESS_TO_INTEGRATED_DATASETS](
    { state }: ActionContext<DataSetViewState, RootState>,
    endpointFeature: boolean
  ): Promise<IBulkDataAccessResponse | unknown> {
    try {
      const requestAccessResponse =
        await datasetViewFactory.requestAccessToIntegratedDatasets(
          state.bulkDataAccess.accessRequestPayload,
          endpointFeature
        );
      return Promise.resolve(requestAccessResponse);
    } catch (err) {
      return Promise.resolve(err);
    }
  },

  async [types.EDIT_BULK_DATA_ACCESS_TO_INTEGRATED_DATASETS](
    { state, commit }: ActionContext<DataSetViewState, RootState>,
    dataProductRequestDetails: DataProductRequestDetails
  ): Promise<IEditDataAccessResponse | unknown> {
    const { editedFields } = state.bulkDataAccess;
    const accessRequestDetails = state.bulkDataAccess.accessRequestPayload;
    const parsedOperationPayload =
      SearchStoreMapper.parseEditStateToPayload(editedFields);
    const payloadToBff = SearchStoreMapper.preparePayloadForDPEdit(
      dataProductRequestDetails,
      parsedOperationPayload,
      accessRequestDetails
    );
    try {
      const requestAccessResponse =
        await datasetViewFactory.editRequestToDataProductDsa(payloadToBff);
      commit(
        `${fromUCV2Store.UCV2_STORE_MODULE}/${fromUCDsa.SET_USE_CASE_DSA_TAB_TILE_INFORMATION}`,
        fromUCDsa.initialDsaTileTabState
      );
      return Promise.resolve(requestAccessResponse);
    } catch (err) {
      return Promise.resolve(err);
    }
  },

  async [types.EDIT_BULK_DATA_ACCESS_TO_GOLDEN_DATASETS](
    { state }: ActionContext<DataSetViewState, RootState>,
    payload: EditPayload
  ): Promise<IEditDataAccessResponse | unknown> {
    const { editedFields } = state.bulkDataAccess;
    const parsedPayload =
      SearchStoreMapper.parseEditStateToPayload(editedFields);

    try {
      const requestAccessResponse =
        await datasetViewFactory.editAccessToGoldenDatasets(
          payload.masterRequestId,
          parsedPayload,
          payload.endpointFeature
        );
      return Promise.resolve(requestAccessResponse);
    } catch (err) {
      return Promise.resolve(err);
    }
  },
  async [types.REQUEST_DP_DSA_DETAILS_BY_STATUS_ID](
    { commit }: ActionContext<DataSetViewState, RootState>,
    payload: { usecaseId: string; idsId: string; oarId: string }
  ): Promise<void> {
    try {
      const { data } = await datasetViewFactory.requestDpDsaDetailsByStatusId(
        payload
      );
      if (data?.oar_id) {
        const { oar_id, start_date, end_date, ide_ids } = data;
        const dataProductRequestDetails: DataProductRequestDetails = {
          ...data,
          ids_id: payload.idsId
        };
        const accessPeriod = {
          start: moment(start_date).format(DEFAULT_DATE_FORMAT),
          end: moment(end_date).format(DEFAULT_DATE_FORMAT)
        };
        commit(types.SET_BULK_DATA_ACCESS_PAYLOAD_CONSUMING_APP, {
          oarId: oar_id
        });
        commit(types.SET_BULK_DATA_ACCESS_PAYLOAD_PERIOD, accessPeriod);
        commit(types.SET_BULK_DATA_ACCESS_PAYLOAD_IDS_ELEMENTS, {
          idsId: payload.idsId,
          allDataElementsSelected: false,
          dataElements: ide_ids,
          totalDataElements: ide_ids.length
        });
        commit(types.SET_PREVIOUSLY_SELECTED_IDS_DATA_ELEMENTS, ide_ids);
        commit(types.SET_BULK_DATA_ACCESS_SELECTED_IDS_ELEMENTS, ide_ids);
        commit(
          types.SET_DATA_PRODUCT_REQUEST_DETAILS,
          dataProductRequestDetails
        );
      }
    } catch (err) {
      console.log(err);
    }
  },
  [types.REQUEST_DSA_DETAILS_BY_MASTERID](
    { commit }: ActionContext<DataSetViewState, RootState>,
    masterRequestId: string
  ): void {
    try {
      const storage = useStorage();
      const endpointFeature = storage.features.hasFeature(
        'enableDSARefactoredEndpoint'
      );
      const filterSegmentsFeature = storage.features.hasFeature(
        ENABLE_DSA_FILTER_SEGMENTS
      );
      let url = `${constants.DC_BASE_URL}master_details/?masterrequest_id=${masterRequestId}`;
      if (endpointFeature) {
        url = `${constants.BFF_API().dsa}/dsa/details/${masterRequestId}`;
      }
      httpRequest.get(url).then((response) => {
        const {
          Data_sharing_agreement: { logid },
          app_access_details: { oar: oarId },
          usecase_details: {
            general_information: { startDate, endDate }
          },
          approval_details: approvalDetails,
          // eslint-disable-next-line camelcase
          data_elements,
          filters
        } = response.data;
        const dataElements = data_elements.map(
          (dataElement: DataElements) => dataElement.element_id
        );
        if (filterSegmentsFeature && filters && filters.length) {
          const selectedFilters: DatasetFilter[] =
            SearchStoreMapper.parseFiltersAndSegments(logid, filters);
          selectedFilters.forEach((selectedFilter: DatasetFilter) => {
            commit(types.SET_BULK_DATA_ACCESS_PAYLOAD_DATASET_FILTERS, {
              logsId: +logid,
              filter: selectedFilter,
              segments: selectedFilter.segments
            });
            commit(
              types.SET_BULK_DATA_ACCESS_SELECTED_FILTER_SEGMENTS,
              selectedFilter
            );
          });
          commit(
            types.SET_PREVIOUSLY_SELECTED_FILTER_SEGMENTS,
            selectedFilters
          );
        }
        const accessPeriod = {
          start: moment(startDate).format(DEFAULT_DATE_FORMAT),
          end: moment(endDate).format(DEFAULT_DATE_FORMAT)
        };
        commit(types.SET_BULK_DATA_ACCESS_PAYLOAD_CONSUMING_APP, { oarId });
        commit(types.SET_BULK_DATA_ACCESS_PAYLOAD_PERIOD, accessPeriod);
        commit(types.SET_BULK_DATA_ACCESS_PAYLOAD_DATASET_ELEMENTS, {
          allDataElementsSelected: false,
          dataElements,
          logsId: logid,
          totalDataElements: dataElements.length
        });
        commit(types.SET_PREVIOUSLY_SELECTED_DATA_ELEMENTS, dataElements);
        commit(
          types.SET_BULK_DATA_ACCESS_SELECTED_DATASET_ELEMENTS,
          dataElements
        );
        commit(types.SET_BULK_DATA_ACCESS_APPROVAL_DETAILS, approvalDetails);
      });
    } catch (err) {}
  },
  async [types.UNLOCK_DSA](
    _actionContext: ActionContext<DataSetViewState, RootState>,
    masterRequestId: string
  ): Promise<void> {
    try {
      await dsaaFactory.getRequestCancellation({
        master_request_id: masterRequestId,
        request_status: 'CRC'
      });
    } catch (err) {}
  },
  [types.FETCH_GDS_CREATION_LOOKUPS]({
    commit
  }: ActionContext<DataSetViewState, RootState>) {
    try {
      commit(types.SET_GDS_CREATION_LOOKUPS, '');
    } catch (err) {}
  },
  [types.SET_ACTIVE_GDS_WITH_PAYLOAD](
    { commit }: ActionContext<DataSetViewState, RootState>,
    payload: GDSActiveDataPartial
  ) {
    try {
      commit(types.SET_ACTIVE_GDS_DATA, payload);
    } catch (err) {}
  },

  async [types.REGISTER_GDS]({ getters }: ActionContext<DataSetViewState, {}>) {
    await registerGdsApi.registerGds(getters[types.GET_ACTIVE_GDS]);
  },

  [types.SAVE_DATAELEMENTS_EDITED_FIELDS](
    { state, commit }: ActionContext<DataSetViewState, RootState>,
    logsId: number
  ): void {
    const foundGDS =
      state.bulkDataAccess.accessRequestPayload.goldenDatasets.find(
        (dataSet) => dataSet.logsId === logsId
      );

    if (!foundGDS) return;

    const { dataElements: currentDataElements } = foundGDS;
    const { previouslySelectedDataElements } = state.bulkDataAccess;

    // We calculate the added/removed elems as the difference in elems betweeen the current and the initial selection
    const addedElems = currentDataElements.filter(
      (x) => !previouslySelectedDataElements.includes(x)
    );
    const removedElems = previouslySelectedDataElements.filter(
      (x) => !currentDataElements.includes(x)
    );

    commit(types.SET_ADD_EDITED_FIELD, {
      field: EDITED_FIELDS.DATA_ELEMENTS,
      value: addedElems
    });
    commit(types.SET_REMOVE_EDITED_FIELD, {
      field: EDITED_FIELDS.DATA_ELEMENTS,
      value: removedElems
    });
  },

  [types.SAVE_IDS_DATAELEMENTS_EDITED_FIELDS](
    { state, commit }: ActionContext<DataSetViewState, RootState>,
    idsId: number
  ): void {
    const foundIDS =
      state.bulkDataAccess.accessRequestPayload.integratedDatasets.find(
        (dataSet) => dataSet.idsId === idsId
      );

    if (!foundIDS) return;

    const { dataElements: currentDataElements } = foundIDS;
    const { previouslySelectedIDSDataElements } = state.bulkDataAccess;

    // We calculate the added/removed elems as the difference in elems betweeen the current and the initial selection
    const addedElems = currentDataElements.filter(
      (x) => !previouslySelectedIDSDataElements.includes(x)
    );
    const removedElems = previouslySelectedIDSDataElements.filter(
      (x) => !currentDataElements.includes(x)
    );

    commit(types.SET_ADD_EDITED_FIELD, {
      field: EDITED_FIELDS.DATA_ELEMENTS,
      value: addedElems
    });
    commit(types.SET_REMOVE_EDITED_FIELD, {
      field: EDITED_FIELDS.DATA_ELEMENTS,
      value: removedElems
    });
  },

  [types.TOGGLE_GDE](
    { state, commit }: ActionContext<DataSetViewState, RootState>,
    gdeId: number
  ) {
    const { tempSelectedDataElements } = state.bulkDataAccess;
    const foundGDEIndex = tempSelectedDataElements.indexOf(gdeId);
    const newDataElements = [...tempSelectedDataElements];

    if (foundGDEIndex !== -1) {
      newDataElements.splice(foundGDEIndex, 1);
    } else {
      newDataElements.push(gdeId);
    }

    commit(
      types.SET_BULK_DATA_ACCESS_SELECTED_DATASET_ELEMENTS,
      newDataElements
    );
  },

  [types.TOGGLE_IDE](
    { state, commit }: ActionContext<DataSetViewState, RootState>,
    ideId: number
  ) {
    const { tempSelectedIDSDataElements } = state.bulkDataAccess;
    const foundIDEIndex = tempSelectedIDSDataElements.indexOf(ideId);
    const newDataElements = [...tempSelectedIDSDataElements];

    if (foundIDEIndex !== -1) {
      newDataElements.splice(foundIDEIndex, 1);
    } else {
      newDataElements.push(ideId);
    }

    commit(types.SET_BULK_DATA_ACCESS_SELECTED_IDS_ELEMENTS, newDataElements);
  },

  [types.TOGGLE_SELECT_ALL_GDES](
    { state, commit }: ActionContext<DataSetViewState, RootState>,
    gdeList?: number[]
  ) {
    const { dataElementOptions } = state.bulkDataAccess;

    if (!gdeList) {
      commit(types.SET_BULK_DATA_ACCESS_SELECTED_DATASET_ELEMENTS, []);
      return;
    }

    const selectedGDEs = dataElementOptions
      .filter((option) => gdeList.includes(+option.data_element_id))
      .map((elem) => elem.data_element_id);

    commit(types.SET_BULK_DATA_ACCESS_SELECTED_DATASET_ELEMENTS, selectedGDEs);
  },

  [types.TOGGLE_SELECT_ALL_IDES](
    { state, commit }: ActionContext<DataSetViewState, RootState>,
    ideList?: number[]
  ) {
    const { idsDataElementOptions } = state.bulkDataAccess;

    if (!ideList) {
      commit(types.SET_BULK_DATA_ACCESS_SELECTED_IDS_ELEMENTS, []);
      return;
    }

    const selectedIDEs = idsDataElementOptions
      .filter((option) => ideList.includes(+option.ideId))
      .map((elem) => elem.ideId);

    commit(types.SET_BULK_DATA_ACCESS_SELECTED_IDS_ELEMENTS, selectedIDEs);
  },

  [types.LOAD_PREVIOUS_GDE_SELECTION](
    { state, commit }: ActionContext<DataSetViewState, RootState>,
    logsId: number
  ) {
    const { goldenDatasets } = state.bulkDataAccess.accessRequestPayload;
    const foundGDS = goldenDatasets.find((gds) => gds.logsId === logsId);

    if (foundGDS) {
      commit(
        types.SET_BULK_DATA_ACCESS_SELECTED_DATASET_ELEMENTS,
        foundGDS.dataElements
      );
    }
  },

  [types.LOAD_PREVIOUS_IDE_SELECTION](
    { state, commit }: ActionContext<DataSetViewState, RootState>,
    idsId: number
  ) {
    const { integratedDatasets } = state.bulkDataAccess.accessRequestPayload;
    const foundIDS = integratedDatasets.find((gds) => gds.idsId === idsId);

    if (foundIDS) {
      commit(
        types.SET_BULK_DATA_ACCESS_SELECTED_IDS_ELEMENTS,
        foundIDS.dataElements
      );
    }
  },
  [types.TOGGLE_FILTER_SEGMENT](
    { state, commit }: ActionContext<DataSetViewState, RootState>,
    payload: { selectedFilter: DatasetFilter; selectedSegment: FilterSegments }
  ) {
    const { tempSelectedSegments } = state.bulkDataAccess;
    const selectedSegmentIndex = tempSelectedSegments.findIndex(
      (element: FilterSegments) => element.id === payload.selectedSegment.id
    );
    const newSegments = [...tempSelectedSegments];
    if (selectedSegmentIndex !== -1) {
      newSegments.splice(selectedSegmentIndex, 1);
    } else {
      newSegments.push(payload.selectedSegment);
    }
    const filterWithSelectedSegments: DatasetFilter = {
      id: payload.selectedFilter.id,
      name: payload.selectedFilter.name,
      segments: newSegments
    };
    commit(
      types.SET_BULK_DATA_ACCESS_SELECTED_FILTER_SEGMENTS,
      filterWithSelectedSegments
    );
  },
  [types.TOGGLE_FILTER_ALL_SEGMENTS](
    { commit }: ActionContext<DataSetViewState, RootState>,
    payload: {
      selectedFilter: DatasetFilter;
      selectedSegments: FilterSegments[];
    }
  ) {
    const filterWithSelectedSegments: DatasetFilter = {
      id: payload.selectedFilter.id,
      name: payload.selectedFilter.name,
      segments: payload.selectedSegments
    };
    commit(
      types.SET_BULK_DATA_ACCESS_SELECTED_FILTER_SEGMENTS,
      filterWithSelectedSegments
    );
  },
  [types.LOAD_PREVIOUS_FILTER_SEGMENT_SELECTION](
    { state, commit }: ActionContext<DataSetViewState, RootState>,
    payload: { logsId: number; filterId: string }
  ) {
    const { goldenDatasets } = state.bulkDataAccess.accessRequestPayload;
    const foundGDS = goldenDatasets.find(
      (gds) => gds.logsId === payload.logsId
    );
    let selectedFilter: DatasetFilter = {
      id: '',
      name: '',
      segments: []
    };
    if (foundGDS) {
      const selectedFilterIndex = foundGDS.filtersAndSegments.findIndex(
        (element: DatasetFilter) => element.id === payload.filterId
      );
      if (selectedFilterIndex !== -1) {
        selectedFilter = foundGDS.filtersAndSegments[selectedFilterIndex];
      }
      commit(
        types.SET_BULK_DATA_ACCESS_SELECTED_FILTER_SEGMENTS,
        selectedFilter
      );
    }
  },
  [types.FETCH_SEGMENTS_OPTIONS](
    { state, commit }: ActionContext<DataSetViewState, RootState>,
    payload: { logsId: number; filterId: string }
  ) {
    commit(types.SET_SEGMENTS_OPTIONS, []);
    const { filtersAndSegmentsLookUp } = state;
    const foundGdsFilterArray = filtersAndSegmentsLookUp.find(
      (filterArray) => filterArray.logs_id === payload.logsId
    );
    if (foundGdsFilterArray) {
      const correspondingSegmentsArray = foundGdsFilterArray.filters.filter(
        (element: DatasetFilter) => element.id === payload.filterId
      )[0].segments;
      commit(types.SET_SEGMENTS_OPTIONS, correspondingSegmentsArray);
    }
  },
  [types.SAVE_FILTERS_SEGMENTS_EDITED_FIELDS](
    { state, commit }: ActionContext<DataSetViewState, RootState>,
    logsId: number
  ): void {
    const foundGDS =
      state.bulkDataAccess.accessRequestPayload.goldenDatasets.find(
        (dataSet) => dataSet.logsId === logsId
      );

    if (!foundGDS) return;
    const { filtersAndSegments: currentFiltersAndSegments } = foundGDS;
    const { previouslySelectedFiltersSegments } = state.bulkDataAccess;
    const addedFilters: any[] = SearchStoreMapper.getEditedFiltersWithSegments(
      currentFiltersAndSegments,
      previouslySelectedFiltersSegments,
      EDITED_FIELDS_OPERATIONS.ADD
    );
    const removedFilters: any[] =
      SearchStoreMapper.getEditedFiltersWithSegments(
        currentFiltersAndSegments,
        previouslySelectedFiltersSegments,
        EDITED_FIELDS_OPERATIONS.REMOVE
      );

    commit(types.SET_ADD_EDITED_FIELD, {
      field: EDITED_FIELDS.SEGMENTS,
      value: addedFilters
    });
    commit(types.SET_REMOVE_EDITED_FIELD, {
      field: EDITED_FIELDS.SEGMENTS,
      value: removedFilters
    });
  },
  async [types.FETCH_TECHNICAL_METADATA_FOR_GOLDEN_DATASET](
    { commit }: ActionContext<DataSetViewState, RootState>,
    logsId: number
  ): Promise<void> {
    const techMetadata =
      await datasetViewFactory.fetchPhysicalDatasetDetailsFor(logsId);
    commit(types.SET_TECHNICAL_METADATA_FOR_GOLDEN_DATASET, {
      logsId,
      physicalDatasets: techMetadata.physicalDatasets
    });
  },
  async [types.FETCH_LINKAGE_REFFERING_ELEMENTS_DATA](
    { commit }: ActionContext<DataSetViewState, RootState>,
    searchKey: string
  ): Promise<void> {
    try {
      const response = await datasetViewFactory.getLinkedRefferingElement(
        searchKey
      );
      commit(types.SET_LINKAGE_REFFERING_ELEMENTS, response.data.results);
    } catch (error) {
      console.error('Fetch error :', error);
      commit(types.MUTATE_LINKAGE_REFFERING_ELEMENTS, []);
    }
  }
};
