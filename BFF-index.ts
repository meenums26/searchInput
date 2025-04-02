/*
© 2019 ABN AMRO BV, Amsterdam, NL. All Rights Reserved.
Version:0.1
Except for any free or open source software components embedded in this proprietary
software program (“Program”), this Program is protected by copyright laws, international
treaties and other pending or existing intellectual property rights in NL.
-->
**/
import axios, { AxiosResponse } from 'axios';
import * as constants from '@/common/constants';
import {
  ALEX_API_DEV,
  ALEX_API_PROD,
  BFF_API,
  DC_BASE_URL,
  RESOLVE_ENVIRONMENT
} from '@/common/constants';

import {
  alexTermHttpRequest,
  bdmHttpRequest,
  dcaHttpRequest,
  erdV2HttpRequest,
  httpRequest,
  onBoardingHttpRequest,
  sourcingHttpRequest,
  ucaHttpRequest
} from '@/common/services';
import utils from '@/common/utilities';
import { DetailsDataResponse } from '@/datasetView/usecase-v2/models/usecase.model';
import {
  DelegationStatus,
  IDelegation,
  IRemovedDelegator
} from '../components/delegation/models';
import { OwnershipEditDetail } from '../components/gds-sidebar/models/gds-sidebar.model';
import { UpdateAlexTermPayloadDto } from '../components/shared/DataElements/terms-and-definitions';
import { BE_NO_DATA, FE_NO_BUSINESS_LINE } from '../constants';
import { IdsDetailsDto } from '../integratedDatasets/repositories';
import {
  AlexAPIHttpResponse,
  ApplicationDetailsHTTPResponse,
  ApprovedEditRequest,
  DataForAutoSuggest,
  DataSet,
  DatasetAttributeHttpResponse,
  DataSetDetailsResponse,
  DataSetHttpResponse,
  DataSetStatisticsHttpResponse,
  DataSetSuggestionsHttpResponse,
  DonutChartApiResponse,
  DQIssuesApiRequest,
  DQIssuessApiResponse,
  DQScoresApiResponse,
  EditLinkageRequest,
  EditRequestStatusResponse,
  GdsGdeDqIssues,
  GdsEdaCompliant,
  RequestedAgreementsHttpResponse,
  UseCaseCreateResponse,
  UseCaseLookUpResponse,
  UseCasePayload,
  UseCasePayloadForGDS,
  UseCasePayloadResponse,
  UseCaseTileDetailResponse,
  OarDetailsHTTPResponse,
  LinkedElement,
  PaginatedResults,
  RefrenceData,
  SegmentationFiltersByDatasetHttpResponse,
  MappedPhysicalDatasetsMappedToGoldenDatasetsFilterHttpResponse,
  BffBdmBaseInfoListAPIHttpResponse,
  PhysicalAttributesByPhysicalDatasetHttpResponse,
  PhysicalAttributesByPhysicalDatasetPayload,
  MappedSegmentsAndConditionsForFilterAndPhysicalAttributeHttpResponse,
  PayloadUpdateFilterSegmentsValuesRoot,
  GdsFilterApiError,
  ITechnicalMetadataDetails
} from '../model';
import { IdsTileListDto } from '../model/IntegratedDatasetModels';
import { UpdateDspaPayload } from '../usecase-v2/tabs/dspa/model/dspa-model';
import {
  IBulkDataAccessRequest,
  IBulkDataAccessResponse,
  IEditDataAccessResponse
} from '../usecase-v2/tabs/dsa/bulkRequestAccessToGoldenDatasets/shared/models';
import {
  IStrategicThemeResponse,
  IDataDomainResponse
} from '../usecase-v2/models/usecase.model';
import { WorkFlow } from '../workFlow/model';
import { CurrentWorkflowFilters } from '../workFlow/storage/store';

export const DataAPIFetch = {
  goldenSource: (sourceName: string): Promise<DataSetHttpResponse> => {
    const url = `${DC_BASE_URL}datasets_in_source/?source_name=${sourceName}`;
    return httpRequest.get(url);
  },
  dataOwner: (corpId: string): Promise<DataSetHttpResponse> => {
    const url = `${DC_BASE_URL}datasets_dataowner/?corpid=${corpId}`;
    return httpRequest.get(url);
  },
  dataSet: (dataSetName: string): Promise<DataSetHttpResponse> => {
    const url = `${DC_BASE_URL}datasets_list/?dataset_name=${dataSetName}`;
    return httpRequest.get(url);
  },
  businessLine: (businessLine: string): Promise<DataSetHttpResponse> => {
    const url = `${DC_BASE_URL}datasets_lob/?lob_name=${businessLine}`;
    return httpRequest.get(url);
  },
  businessCategory: (
    businessCategory: string
  ): Promise<DataSetHttpResponse> => {
    const url = `${DC_BASE_URL}datasets_in_category/?business_category=${businessCategory}`;
    return httpRequest.get(url);
  },
  dataDomain: (dataDomain: string): Promise<DataSetHttpResponse> => {
    const url = `${DC_BASE_URL}datasets_in_domain/?data_domain=${dataDomain}`;
    return httpRequest.get(url);
  },
  getDataRoles: (corpID: string) => {
    const url = `${constants.DC_BASE_URL}get_users_info?corp_id=${corpID}`;
    return httpRequest.get(url);
  }
};

export const datasetViewFactory = {
  getRecommendations(
    inputValue: string
  ): Promise<DataSetSuggestionsHttpResponse> {
    const url = `${DC_BASE_URL}dataset_search_count/?searchKey=${inputValue}`;
    return httpRequest.get(url);
  },
  getRecommendationsByIndex(index = 1): Promise<DataSetHttpResponse> {
    const url = `${DC_BASE_URL}datasets_full_list_counter/?start=${index}&counter=19`;
    return httpRequest.get(url);
  },
  getDetailsBySrcId(
    logsId: string,
    callV2Flag?: boolean
  ): Promise<DataSetDetailsResponse> {
    let url = '';
    if (callV2Flag) {
      url = `${BFF_API().sourcing}/datasetsV2/${logsId}/`;
    } else {
      url = `${BFF_API().sourcing}/datasets/${logsId}/`;
    }

    return onBoardingHttpRequest.get(url);
  },
  async getPhysicalAttributesByPhysicalDataset(
    physicalDatasetId: string
  ): Promise<PhysicalAttributesByPhysicalDatasetHttpResponse> {
    const url = `${
      BFF_API().sourcing
    }/sourcing/technicalMetadata/physical-dataset/${physicalDatasetId}/attributes`;

    return await sourcingHttpRequest.get(url);
  },
  getSegmentationFiltersByDataset(
    gdsID: string
  ): Promise<SegmentationFiltersByDatasetHttpResponse> {
    const url = `${
      BFF_API().sourcing
    }/sourcing/segmentation/filters/by-gds/${gdsID}/`;

    return sourcingHttpRequest.get(url);
  },
  getPhysicalDatasetsMappedToGoldenDatasetsFilter(
    filterID: string
  ): Promise<MappedPhysicalDatasetsMappedToGoldenDatasetsFilterHttpResponse> {
    const url = `${
      BFF_API().sourcing
    }/sourcing/segmentation/filters/${filterID}/physical-datasets`;

    return sourcingHttpRequest.get(url);
  },
  getSegmentsAndConditionsForFilterAndPhysicalAttribute(
    filterID: string,
    physicalAttributeId: string
  ): Promise<MappedSegmentsAndConditionsForFilterAndPhysicalAttributeHttpResponse> {
    const url = `${
      BFF_API().sourcing
    }/sourcing/segmentation/filters/${filterID}/physical-dataset-attributes/${physicalAttributeId}/segments`;

    return sourcingHttpRequest.get(url);
  },
  async updatePhysicalAttributesByPhysicalDataset(
    filterID: string,
    payload: PhysicalAttributesByPhysicalDatasetPayload
  ): Promise<any> {
    const url = `${
      BFF_API().sourcing
    }/sourcing/segmentation/update/filter/${filterID}/physical-datasets`;

    try {
      return await sourcingHttpRequest.patch(url, payload);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data || 'An error occurred';
        return Promise.reject(
          new GdsFilterApiError(errorMessage, error.response?.data)
        );
      }
      return Promise.reject(
        new GdsFilterApiError('An unexpected error occurred', null)
      );
    }
  },
  async updateFilterSegmentsValues(
    filterId: string,
    physicalAttributeId: string,
    payload: PayloadUpdateFilterSegmentsValuesRoot
  ): Promise<any> {
    const url = `${
      BFF_API().sourcing
    }/sourcing/segmentation/update/filter/${filterId}/physical-dataset-attributes/${physicalAttributeId}/segments`;
    return await sourcingHttpRequest.patch(url, payload);
  },
  // no reference in code hence no need for v2 condition
  updateDetailsBySrcId(
    logsId: string,
    dataset: any
  ): Promise<DataSetDetailsResponse> {
    const url = `${constants.ONBOARD_API}/api/v1/datasets/${logsId}/`;
    return onBoardingHttpRequest.put(url, dataset);
  },
  createOrUpdateLinkage(payload: EditLinkageRequest): Promise<any> {
    const url = `${constants.DC_BASE_URL}api/edit_new/editlinkage/`;
    return httpRequest.post(url, payload);
  },
  getFullListDataSourceWithFilter(
    filtersApplied: any,
    callAPIV2flag?: boolean
  ): Promise<DataSetHttpResponse> {
    let url = '';
    if (callAPIV2flag) {
      url = `${BFF_API().sourcing}/datasetsV2/?${filtersApplied}`;
    } else {
      url = `${BFF_API().sourcing}/datasets/?${filtersApplied}`;
    }
    return onBoardingHttpRequest.get(url);
  },
  getFullListDataSourceWithFilterParams(
    filtersApplied: any,
    callAPIV2flag?: boolean
  ): Promise<DataSetHttpResponse> {
    let url = '';
    if (callAPIV2flag) {
      url = `${BFF_API().sourcing}/datasetsV2/`;
    } else {
      url = `${BFF_API().sourcing}/datasets/`;
    }
    return onBoardingHttpRequest.get(url, {
      params: filtersApplied
    });
  },
  getFilterOptions(): Promise<DataSetHttpResponse> {
    const url = `${DC_BASE_URL}get_filters_data/`;
    return httpRequest.get(url);
  },
  getDatasetAttributes(
    logsId: number,
    callAPIV2flag: boolean
  ): Promise<DatasetAttributeHttpResponse> {
    const url = callAPIV2flag
      ? `${
          utils.getOnboardingAPIEndpointAndTokenPerEnv().endpoint
        }/v2/datasets/${logsId}/attributes/`
      : `${
          utils.getOnboardingAPIEndpointAndTokenPerEnv().endpoint
        }/v1/datasets/${logsId}/attributes/`;
    return onBoardingHttpRequest.get(url);
  },
  fetchDatasetElements(
    logsId: number,
    paginationDataFilter: string,
    callAPIV2flag: boolean
  ): Promise<PaginatedResults<LinkedElement>> {
    const url = callAPIV2flag
      ? `${
          BFF_API().sourcing
        }/datasetsV2/${logsId}/elements/?${paginationDataFilter}`
      : `${
          BFF_API().sourcing
        }/datasets/${logsId}/elements/?${paginationDataFilter}`;
    return onBoardingHttpRequest.get(url);
  },
  getStatisticsData(): Promise<DataSetStatisticsHttpResponse> {
    const url = `${DC_BASE_URL}get_summary_report_new/`;
    return httpRequest.get(url);
  },
  getStatisticsDataWithBusinessLines(
    businessLines: Array<string>
  ): Promise<DataSetStatisticsHttpResponse> {
    businessLines = businessLines.map((businessLine: string) => {
      return businessLine !== BE_NO_DATA ? businessLine : FE_NO_BUSINESS_LINE;
    });
    const url = `${DC_BASE_URL}get_summary_report/`;
    return httpRequest.post(url, { businessLines });
  },
  async getAlexTermsDefinitions(
    collectionId: number
  ): Promise<BffBdmBaseInfoListAPIHttpResponse> {
    const url = `${BFF_API().bdm}collections/${collectionId}/termsList`;
    return bdmHttpRequest.get(url);
  },
  fetchTermDetailsList(payload: object): Promise<void> {
    const url = `${BFF_API().datasets}/api/terms/details/`;
    return bdmHttpRequest.post(url, payload);
  },
  updateAlexTermsDefinitions(
    termId: string,
    updateTermPayload: UpdateAlexTermPayloadDto
  ): Promise<AlexAPIHttpResponse> {
    let ALEX_URL = ALEX_API_DEV; // local, Dev, Stg
    if (RESOLVE_ENVIRONMENT().toLowerCase() === 'production') {
      ALEX_URL = ALEX_API_PROD;
    }
    const url = `${ALEX_URL}/oauth/terms/${termId}`;
    return alexTermHttpRequest.put(url, updateTermPayload);
  },

  getDataSetSearchById(dataSetName: string): Promise<DataSet[]> {
    const url = `${DC_BASE_URL}datasets_list/?dataset_name=${dataSetName}`;
    return httpRequest.get(url);
  },
  getAgreementNames(
    corpID: number | string
  ): Promise<RequestedAgreementsHttpResponse> {
    const url = `${DC_BASE_URL}agreement-name/?corpid=${corpID}`;
    return httpRequest.get(url);
  },
  getDatasetDetailsBySrcId(id: string, callV2Flag: boolean): Promise<any> {
    const url = callV2Flag
      ? `${BFF_API().sourcing}/datasetsV2/${id}/`
      : `${BFF_API().sourcing}/datasets/${id}/`;
    return onBoardingHttpRequest.get(url);
  },
  getDatasetElementsBySrcId(
    id: string,
    callAPIV2flag: boolean
  ): Promise<DatasetAttributeHttpResponse> {
    const url = callAPIV2flag
      ? `${
          utils.getOnboardingAPIEndpointAndTokenPerEnv().endpoint
        }/v2/datasets/${id}/attributes/`
      : `${
          utils.getOnboardingAPIEndpointAndTokenPerEnv().endpoint
        }/v1/datasets/${id}/attributes/`;
    return onBoardingHttpRequest.get(url);
  },
  getDSAARequestStatus(oarId: string) {
    const url = `${constants.DC_BASE_URL}agreement_exist?oar_modelnumber=${oarId}`;
    return httpRequest.get(url);
  },
  getEditRequestList(
    logsID: number | string
  ): Promise<EditRequestStatusResponse> {
    const url = `${constants.DC_BASE_URL}api/edit_new/editlinkage/?logs_id=${logsID}&request_status_flag=P`;
    return httpRequest.get(url);
  },
  getEditLinkageDetails(): Promise<EditRequestStatusResponse> {
    const url = `${constants.DC_BASE_URL}api/edit_new/editlinkage/`;
    return httpRequest.get(url);
  },
  getEditLinkageDraftList(
    logsID: number | string
  ): Promise<EditRequestStatusResponse> {
    const url = `${constants.DC_BASE_URL}api/edit_new/editlinkage/?logs_id=${logsID}&request_status_flag=D`;
    return httpRequest.get(url);
  },
  getEditRequestDetails(requestID: number): Promise<any> {
    const url = `${constants.DC_BASE_URL}api/edit_new/editlinkage/${requestID}/`;
    return httpRequest.get(url);
  },
  getApprovedEditRequest(requestID: any): Promise<any> {
    const url = `${constants.DC_BASE_URL}api/edit_new/approvedchanges/${requestID}/`;
    return httpRequest.get(url);
  },
  updateEditLinkageStatus(
    id: number,
    status: string,
    corpId: number,
    comments?: string
  ): Promise<any> {
    const url = `${constants.DC_BASE_URL}api/edit_new/editlinkage/${id}/`;
    return httpRequest.put(url, {
      request_status_flag: status,
      comments,
      approval_details: [
        {
          approver_id: corpId
        }
      ]
    });
  },
  askOnboardingApproval(payload: any, logsID: string | number): Promise<any> {
    const url = `${
      utils.getOnboardingAPIEndpointAndTokenPerEnv().endpoint
    }/v1/datasets/${logsID}/attributes/`;
    return onBoardingHttpRequest.post(url, payload);
  },
  getGoldenDatasetsForStatistics(
    filters: string,
    callSourcingV2: boolean
  ): Promise<any> {
    const url = callSourcingV2
      ? `${
          utils.getOnboardingAPIEndpointAndTokenPerEnv().endpoint
        }/v2/datasets/${filters}`
      : `${
          utils.getOnboardingAPIEndpointAndTokenPerEnv().endpoint
        }/v1/datasets/${filters}`;
    return onBoardingHttpRequest.get(url);
  },
  saveGoldenDataSetChanges(payload: EditLinkageRequest): Promise<any> {
    const url = `${constants.DC_BASE_URL}api/edit_new/editlinkage/`;
    return httpRequest.post(url, payload);
  },
  updateCurrentEditRequest(payload: EditLinkageRequest): Promise<any> {
    const url = `${constants.DC_BASE_URL}api/edit_new/editlinkage/${payload.id}/`;
    return httpRequest.put(url, payload);
  },
  updateGoldenDataSetChanges(
    payload: EditLinkageRequest,
    id: number
  ): Promise<any> {
    const url = `${constants.DC_BASE_URL}api/edit_new/editlinkage/${id}/`;
    return httpRequest.put(url, payload);
  },
  saveGdsMetadataEdit(
    payload: any,
    logsId: number,
    callSourcingV2: boolean
  ): any {
    const url = callSourcingV2
      ? `${
          utils.getOnboardingAPIEndpointAndTokenPerEnv().endpoint
        }/v2/datasets/${logsId}/`
      : `${
          utils.getOnboardingAPIEndpointAndTokenPerEnv().endpoint
        }/v1/datasets/${logsId}/`;
    return onBoardingHttpRequest.put(url, payload);
  },
  fetchPreApprovalConditions(payload: any): any {
    const url = `${constants.DC_BASE_URL}dsaa/api/auto_approve_conditions/?logId=${payload.logsId}&corpId=${payload.corpId}&conditions`;
    return httpRequest.get(url);
  },
  savePreApprovalConditions(payload: any): any {
    const url = `${constants.DC_BASE_URL}dsaa/api/auto_approve_conditions/?logId=${payload.logsId}`;
    return httpRequest.post(url, payload.conditions);
  },
  saveEnableDSARequest(payload: any): any {
    const url = `${BFF_API().sourcing}/datasetsV2/${payload.logsId}/`;
    const enablePayload = {
      disable_data_sharing_agreement_requests: payload.enableValue
    };
    return onBoardingHttpRequest.put(url, enablePayload);
  },
  addGoldenDataElement(
    payload: any,
    logsId: number | undefined,
    callSourcingV2: boolean
  ): any {
    const url = callSourcingV2
      ? `${
          utils.getOnboardingAPIEndpointAndTokenPerEnv().endpoint
        }/v2/datasets/${logsId}/elements/bulk_create/`
      : `${
          utils.getOnboardingAPIEndpointAndTokenPerEnv().endpoint
        }/v1/datasets/${logsId}/elements/bulk_create/`;
    return onBoardingHttpRequest.post(url, payload.golden_elements);
  },
  editGoldenDataElement(
    payload: any,
    logsId: number,
    callSourcingV2: boolean
  ): any {
    const url = callSourcingV2
      ? `${
          utils.getOnboardingAPIEndpointAndTokenPerEnv().endpoint
        }/v2/datasets/${logsId}/elements/bulk_update/`
      : `${
          utils.getOnboardingAPIEndpointAndTokenPerEnv().endpoint
        }/v1/datasets/${logsId}/elements/bulk_update/`;
    return onBoardingHttpRequest.post(url, payload);
  },
  deleteGoldenDataElement(
    logsId: number,
    gdeId: number | undefined,
    callSourcingV2: boolean
  ): any {
    const url = callSourcingV2
      ? `${
          utils.getOnboardingAPIEndpointAndTokenPerEnv().endpoint
        }/v2/datasets/${logsId}/elements/${gdeId}`
      : `${
          utils.getOnboardingAPIEndpointAndTokenPerEnv().endpoint
        }/v1/datasets/${logsId}/elements/${gdeId}`;
    return onBoardingHttpRequest.delete(url);
  },
  deleteCurrentRequest(requestID: number): any {
    const url = `${constants.DC_BASE_URL}api/edit_new/editlinkage/${requestID}/`;
    return httpRequest.delete(url);
  },
  getDataAttributeSuggestions(payload: DataForAutoSuggest): any {
    const url = `${constants.DC_BASE_URL}api/de_autosuggestions/`;
    return httpRequest.post(url, payload);
  },
  async getDataQualityScores(payload: any): Promise<DQScoresApiResponse> {
    const url = `${constants.DC_BASE_URL}api/dqdata`;
    const { data } = await httpRequest.post(url, payload);
    return data;
  },
  async getDataQualityIssues(
    payload: DQIssuesApiRequest
  ): Promise<DQIssuessApiResponse> {
    const url = `${BFF_API().features}/data-quality/issues/dqissues`;
    const { data } = await httpRequest.post(url, { data: payload });
    return data;
  },
  async fetchGdsGdeDqIssues(gdsId: number): Promise<GdsGdeDqIssues> {
    const url = `${BFF_API().features}/data-quality/issues/gds/dqissues`;
    const { data } = await httpRequest.post(url, { gdsId });
    return data;
  },
  async getDsaForGds(logs_id: number): Promise<DonutChartApiResponse> {
    const url = `${constants.DC_BASE_URL}api/dsaa_data?logs_id=${logs_id}`;
    const { data } = await httpRequest.get(url);
    return data;
  },
  async getEdaCompliantForGds(gdsId: number): Promise<GdsEdaCompliant> {
    const url = `${BFF_API().datasets}/datasets/eda-compliant/${gdsId}`;
    const { data } = await httpRequest.get(url);
    return data;
  },
  async getUcForGds(
    payload: UseCasePayloadForGDS
  ): Promise<DonutChartApiResponse> {
    const url = `${constants.DC_BASE_URL}api/usecase_data`;
    const { data } = await httpRequest.post(url, payload);
    return data;
  },
  async saveOwnershipEditToDMP(payload: OwnershipEditDetail): Promise<any> {
    const url = `${constants.DC_BASE_URL}api/edit_new/savechanges/`;
    const { data } = await httpRequest.post(url, payload);
    return data;
  },
  async getOARsByCIA(queryParamStr: string): Promise<any> {
    const url = `${BFF_API().features}/getOARsByCIA/?${queryParamStr}`;
    return httpRequest.get(url);
  },

  async savePartialApprovedData(
    approvedRequest: ApprovedEditRequest,
    requestID: number
  ): Promise<ApprovedEditRequest> {
    const url = `${constants.DC_BASE_URL}api/edit_new/approvedchanges/${requestID}/`;
    const { data } = await httpRequest.put(url, approvedRequest);
    return data;
  },
  getAgreementDetails(
    logsID: number | string,
    corpID: number,
    enableDSARefactoredEndpoint: boolean
  ): Promise<any> {
    const url = enableDSARefactoredEndpoint
      ? `${BFF_API().dsa}/dsa/approvalDetails/${logsID}/${corpID}`
      : `${constants.DC_BASE_URL}dsaa/api/approval_details?logid=${logsID}&corpid=${corpID}`;
    return httpRequest.get(url);
  },
  getJourneyDetails(reqId: string | number): Promise<any> {
    const url = `${constants.DC_BASE_URL}dsaa/api/dsametromap?reqId=${reqId}`;
    return httpRequest.get(url);
  },
  async savePreApprovalAction(
    payload: any,
    enableDSARefactoredEndpoint: boolean
  ): Promise<any> {
    const url = enableDSARefactoredEndpoint
      ? `${BFF_API().dsa}/dsa/updateAutoApproval`
      : `${constants.DC_BASE_URL}dsaa/api/auto_approval`;
    const { data } = await httpRequest.post(url, payload);
    return data;
  },
  async getAutoApprovalStatus(gdsId: number, corpId: number) {
    const url = `${BFF_API().dsa}/dsa/getAutoApprovalStatus/${gdsId}/${corpId}`;
    const { data } = await httpRequest.get(url);
    return data;
  },
  async createNewDelegations(payload: Array<IDelegation>): Promise<any> {
    const url = `${constants.DC_BASE_URL}api/commonworkflow/delegation/`;
    const { data } = await httpRequest.post(url, payload);
    return data;
  },
  async deleteExistingDelegations(
    payload: Array<IRemovedDelegator>
  ): Promise<any> {
    const url = `${constants.DC_BASE_URL}api/commonworkflow/revoke_delegation/`;
    const { data } = await httpRequest.post(url, payload);
    return data;
  },
  async getExistingDelegations(logsId: number): Promise<any> {
    const url = `${constants.DC_BASE_URL}api/commonworkflow/delegation/?logsId=${logsId}&delegationStatus=${DelegationStatus.added}`;
    const { data } = await httpRequest.get(url);
    return data;
  },
  async requestAccessToGoldenDatasets(
    payload: IBulkDataAccessRequest,
    endpointFeature: boolean
  ): Promise<IBulkDataAccessResponse> {
    const url = endpointFeature
      ? `${BFF_API().dsa}/dsa/bulkdsa`
      : `${constants.DC_BASE_URL}bulkdsa`;
    const { data } = await httpRequest.post(url, payload);
    return data;
  },
  async requestAccessToIntegratedDatasets(
    payload: IBulkDataAccessRequest,
    endpointFeature: boolean
  ): Promise<IBulkDataAccessResponse> {
    const parsedPayload = JSON.parse(JSON.stringify(payload));
    const url = endpointFeature
      ? `${BFF_API().dsa}/dsa/newApp/bulkdsaIds`
      : `${BFF_API().dsa}/dsa/bulkdsaIds`;
    parsedPayload.tokenUrl = utils.getDcaApiUrls().tokenRequestUrl;
    const { data } = await httpRequest.post(url, parsedPayload);
    return data;
  },
  async editAccessToGoldenDatasets(
    masterRequestId: string,
    payload: any,
    endpointFeature: boolean
  ): Promise<IEditDataAccessResponse> {
    const baseUrl = `${constants.DC_BASE_URL}edit_dsa/${masterRequestId}/`;
    const bffUrl = `${BFF_API().dsa}/dsa/edit_dsa/${masterRequestId}/`;
    const url = endpointFeature ? bffUrl : baseUrl;
    const { data } = await httpRequest.patch(url, payload);
    return data;
  },
  async deleteCommonWorkflowCurrentRequest(requestID: number): Promise<any> {
    const url = `${constants.DC_BASE_URL}api/commonworkflow/editrequest/${requestID}/`;
    return await httpRequest.delete(url);
  },
  async fetchPhysicalDatasetDetailsFor(
    logsId: number
  ): Promise<ITechnicalMetadataDetails> {
    const url = `${
      constants.BFF_API().sourcing
    }/datasets/${logsId}/technical-metadata`;
    const { data } = await httpRequest.get(url);
    return data;
  },
  async getLinkedRefferingElement(searchKey: string):Promise<any>{
    const url = `${BFF_API().datasets}/api/v2/data_elements/?search=${searchKey}`;
    const data = await httpRequest.get(url);
    return data;
  }
};

export const useCaseAPI = {
  getApplication(searchKey: string): Promise<ApplicationDetailsHTTPResponse> {
    const url = `${DC_BASE_URL}oar_details/?searchKey=${searchKey}`;
    return httpRequest.get(url);
  },
  getDetails(id: number): Promise<DetailsDataResponse> {
    const url = `${DC_BASE_URL}api/usecase/details/v2/${id}/`;
    return httpRequest.get(url);
  },
  getUseCaseLookUpInfo(): Promise<UseCaseLookUpResponse> {
    const url = `${DC_BASE_URL}api/lookup_data/`;
    return httpRequest.get(url);
  },
  /* eslint-disable camelcase */
  createUseCase(created_by: number): Promise<UseCaseCreateResponse> {
    const url = `${DC_BASE_URL}api/usecase/`;
    return httpRequest.post(url, { created_by });
  },
  getUseCaseByID(useCaseId: number): Promise<UseCasePayloadResponse> {
    const url = `${DC_BASE_URL}api/usecase/${useCaseId}`;
    return httpRequest.get(url);
  },
  deleteUseCaseByID(useCaseId: number): Promise<UseCasePayloadResponse> {
    const url = `${DC_BASE_URL}api/usecase/${useCaseId}`;
    return httpRequest.delete(url);
  },
  saveUseCase(
    useCaseId: number,
    payload: UseCasePayload
  ): Promise<UseCaseLookUpResponse> {
    const url = `${DC_BASE_URL}api/usecase/${useCaseId}/`;
    return httpRequest.put(url, payload);
  },
  getUseCaseList(
    filtersApplied: string,
    usecaseAPIToggle: boolean
  ): Promise<UseCaseTileDetailResponse> {
    const url = `${BFF_API().usecase}usecaselist?${filtersApplied}`;
    return ucaHttpRequest.get(url, {
      params: { enableUcaApi: usecaseAPIToggle }
    });
  },
  getPublishedUseCaseList(
    filtersApplied: string,
    usecaseAPIToggle: boolean
  ): Promise<UseCaseTileDetailResponse> {
    const url = `${
      BFF_API().usecase
    }usecaselist?${filtersApplied}&status=Published`;
    return ucaHttpRequest.get(url, {
      params: { enableUcaApi: usecaseAPIToggle }
    });
  },
  isGivenUseCaseNameUnique(useCaseName: string) {
    const url = `${DC_BASE_URL}api/get_name_uniqueness?name=${useCaseName}`;
    return httpRequest.get(url);
  },
  getBlockIdsList(searchKey: string): Promise<any> {
    const url = `${BFF_API().dsa}/dsa/blocks?search=${searchKey}`;
    return httpRequest.get(url);
  },
  getOrgEntityList(searchKey: string): Promise<any> {
    const url = `${
      BFF_API().dsa
    }/dsa/organizational-entities?search=${searchKey}`;
    return httpRequest.get(url);
  },
  getOarDetails(searchKey: string): Promise<OarDetailsHTTPResponse> {
    const url = `${BFF_API().dsa}/oar?search=${encodeURIComponent(searchKey)}`;
    return httpRequest.get(url);
  },
  async getOarDetailsAsync(searchKey: string): Promise<any> {
    const url = `${BFF_API().dsa}/oar?search=${encodeURIComponent(searchKey)}`;
    const oraDetailsResp = await httpRequest.get(url);
    return oraDetailsResp.data;
  },
  async getOarDetailsBatchAsync(payload: string[]): Promise<any> {
    const url = `${BFF_API().dsa}/oar/batch`;
    const oraDetailsResp = await httpRequest.post(url, payload);
    return oraDetailsResp.data;
  },
  async getStrategicThemes(): Promise<IStrategicThemeResponse> {
    const res = await httpRequest.get(`${BFF_API().usecase}strategicThemes`);
    return res.data;
  },
  async getDataDomains(): Promise<IDataDomainResponse> {
    const res = await httpRequest.get(`${BFF_API().usecase}dataDomainsFDGM`);
    return res.data;
  },
  getMDLUseCaseLookUp(): Promise<UseCaseLookUpResponse> {
    const url = `${BFF_API().usecase}usecaseMDLLookUps`;
    return httpRequest.get(url);
  },
  async getDataElementByElementId(id: any) {
    const url = `${constants.ONBOARD_API}/v2/data_elements/${id}/`;
    return await onBoardingHttpRequest.get(url);
  }
};

export const workflowApi = {
  async saveToWorkflow(workflow: Partial<WorkFlow>): Promise<WorkFlow> {
    const url = `${DC_BASE_URL}api/commonworkflow/editrequest/`;
    const { data } = await httpRequest.post(url, workflow);
    return data;
  },
  async fetchCurrentWorkflow(
    currentWorkflowFilters: CurrentWorkflowFilters
  ): Promise<WorkFlow[]> {
    const url = `${DC_BASE_URL}api/commonworkflow/editrequest/?entityID=${currentWorkflowFilters.entityId}&requestStatus=${currentWorkflowFilters.requestStatus}&workflowModuleId=1`;
    const { data } = await httpRequest.get(url);
    return data.results as WorkFlow[];
  }
};

export const integratedDatasetApi = {
  getTileList(queryParams: string): Promise<IdsTileListDto> {
    const url = `${DC_BASE_URL}api/ids/v1/ids/?format=json${queryParams}`;
    return httpRequest.get(url);
  },
  async getIdsDetailsbyID(id: string): Promise<IdsDetailsDto> {
    const url = `ids/v1/ids/${id}/`;
    const { data } = await dcaHttpRequest.get(url);
    return data;
  }
};
export const datasetsApi = {
  getDatasetsBFF(useCaseId: string, enableDSARefactoredEndpoint: boolean) {
    let url = '';
    if (enableDSARefactoredEndpoint && enableDSARefactoredEndpoint === true) {
      url = `${BFF_API().dsa}/usecasev2/${useCaseId}/gdsDetails`;
    } else {
      url = `${BFF_API().datasets}/usecasev2/datasets/${useCaseId}`;
    }

    return httpRequest.get(url);
  }
};

export const dspaApi = {
  getDspaForm(formId: number, useCaseId: string) {
    const url = `${DC_BASE_URL}dsaa/api/dspa_questionaries?form=${formId}&usecaseId=${useCaseId}`;
    return httpRequest.get(url);
  },
  updateDspaForm(formId: number, useCaseId: string, payload: any) {
    const url = `${DC_BASE_URL}dsaa/api/dspa_questionaries/?form=${formId}&usecaseId=${useCaseId}`;
    return httpRequest.post(url, payload);
  },
  // BFF version will be added soon
  getDspaFormByMasterReqId(formId: number, useCaseId: string, mrid?: string) {
    const url = `${DC_BASE_URL}dsaa/api/dspa_questionaries?form=${formId}&usecaseId=${useCaseId}&masterRequestId=${mrid}`;
    return httpRequest.get(url);
  },
  getDspaFormBFF(formId: number, useCaseId: string) {
    const url = `${BFF_API().dspa}/dspa/${formId}/${useCaseId}`;
    return httpRequest.get(url);
  },
  updateDspaFormBFF(
    formId: number,
    useCaseId: string,
    payload: UpdateDspaPayload
  ) {
    const url = `${BFF_API().dspa}/dspa/${formId}/${useCaseId}`;
    return httpRequest.put(url, payload);
  }
};

export const oarApi = {
  getOarDetailsById(searchKey: string): Promise<OarDetailsHTTPResponse> {
    const url = `${BFF_API().dsa}/oar?search=${encodeURIComponent(searchKey)}`;
    return httpRequest.get(url);
  }
};

export const registerGdsApi = {
  async registerGds(payload: any) {
    const url = `${BFF_API().sourcing}/datasetsV2/gds-registration`;
    return onBoardingHttpRequest.post(url, payload);
  }
};

export const erdApi = {
  async getReferenceDatasetsAndFilterParams(
    fileName: string,
    pageNumber: number,
    rowsPerPage: number,
    sortByParams: string,
    logsId: string,
    filters: any
  ): Promise<RefrenceData> {
    const url = `${
      BFF_API().erd
    }ANDES/reference-data?file_name=${fileName}&rows_per_page=${rowsPerPage}&page_number=${pageNumber}&logs_id=${logsId}&${sortByParams}`;
    try {
      const { data } = await erdV2HttpRequest.post<
        any,
        AxiosResponse<RefrenceData>
      >(url, { filters });
      return data;
    } catch (err) {
      return err;
    }
  }
};
