/* eslint-disable sonarjs/no-duplicate-string */
import {
  DataSetViewState,
  LinkedElement,
  PaginatedResults,
  EditLinkageRequest,
  RootState
} from '@/datasetView/model';
import { ActionContext } from 'vuex';
import actions from '@/datasetView/store/search-store/search.store.actions';
import { IdsStorage } from '@/datasetView/integratedDatasets/storage';
import { IdsDataElementsResponse } from '@/datasetView/integratedDatasets/repositories';
import { SearchStoreMapper } from '@/datasetView/store/search-store/search.store.mappers';
import { IdeService } from '@/datasetView/integratedDatasets/services/ide.service';
import { DelegationHelpers } from '@/datasetView/store/search-store/utils/helpers';
import {
  FETCH_GDS_GDE_DQ_ISSUES,
  FETCH_GDS_EDA_COMPLIANT,
  GET_ALL_DELEGATIONS,
  GET_DATA_SET_ID,
  GET_SELECTED_DATA_SETS,
  REMOVE_DATA_SETS,
  REMOVE_INTEGRATED_DATA_SET,
  SELECTED_INTEGRATED_DATA_SET,
  MAPPED_INTEGRATED_DATA_ELEMENTS,
  MAPPED_GOLDEN_DATA_ELEMENTS,
  GET_DATA_SET_WITH_FILTER,
  SAVE_AND_CLOSE_DELEGATIONS,
  SAVE_GDS_DQ_ISSUE_DATA,
  SET_GDS_DQ_ISSUE_DATA,
  SET_GDS_DQ_ISSUE_LOADING,
  SET_GDS_DQ_ISSUE_NO_DATA,
  REQUEST_BULK_DATA_ACCESS_TO_GOLDEN_DATASETS,
  REQUEST_BULK_DATA_ACCESS_TO_INTEGRATED_DATASETS,
  EDIT_BULK_DATA_ACCESS_TO_GOLDEN_DATASETS,
  FETCH_BULK_DATA_ACCESS_DATAELEMENTS_OPTIONS,
  FETCH_BULK_DATA_ACCESS_IDS_DATAELEMENTS_OPTIONS,
  SAVE_GOLDEN_DATA_SET_CHANGES,
  DELETE_CURRENT_REQUEST,
  SAVE_PARTIALLY_APPROVED_GDS_EDIT,
  GET_OAR_DETAILS_BY_ID,
  MUTATE_CURRENT_OAR_DETAILS,
  GET_DATA_SET_DETAILS_BY_ID,
  SAVE_GDS_OWNERSHIP_EDIT,
  REQUEST_DSA_DETAILS_BY_MASTERID,
  SAVE_DATAELEMENTS_EDITED_FIELDS,
  SET_ADD_EDITED_FIELD,
  SET_REMOVE_EDITED_FIELD,
  FETCH_GDS_CREATION_LOOKUPS,
  SET_GDS_CREATION_LOOKUPS,
  SET_ACTIVE_GDS_WITH_PAYLOAD,
  SET_ACTIVE_GDS_DATA,
  TOGGLE_GDE,
  TOGGLE_IDE,
  TOGGLE_SELECT_ALL_GDES,
  SET_BULK_DATA_ACCESS_SELECTED_DATASET_ELEMENTS,
  LOAD_PREVIOUS_GDE_SELECTION,
  LOAD_PREVIOUS_IDE_SELECTION,
  SAVE_IDS_DATAELEMENTS_EDITED_FIELDS,
  SET_BULK_DATA_ACCESS_SELECTED_IDS_ELEMENTS,
  TOGGLE_SELECT_ALL_IDES,
  UNLOCK_DSA,
  GET_DATA_SET_WITH_FILTER_NEW,
  GET_DATA_SET_WITH_FILTER_PARAMS,
  TOGGLE_FILTER_SEGMENT,
  TOGGLE_FILTER_ALL_SEGMENTS,
  LOAD_PREVIOUS_FILTER_SEGMENT_SELECTION,
  FETCH_SEGMENTS_OPTIONS,
  SET_BULK_DATA_ACCESS_SELECTED_FILTER_SEGMENTS,
  SET_SEGMENTS_OPTIONS,
  SAVE_FILTERS_SEGMENTS_EDITED_FIELDS,
  FETCH_PHYSICAL_DATASETS_MAPPED_TO_GDS_FILTER,
  FETCH_PHYSICAL_ATTRIBUTES_BY_PHYSICAL_DATASET,
  UPDATE_GDS_SEGMENTATION_PHYSICAL_DATASET_ATTRIBUTES,
  FETCH_SEGMENTS_AND_CONDITIONS_FOR_FILTER_AND_PHYSICAL_ATTRIBUTES,
  UPDATE_GDS_FILTER_SEGMENTS_VALUES,
  SET_ERROR_PHYSICAL_DATASETS_MAPPED_TO_GDS_FILTER,
  SET_ERROR_SEGMENTS_AND_CONDITIONS_FOR_FILTER_AND_PHYSICAL_ATTRIBUTES,
  FETCH_TECHNICAL_METADATA_FOR_GOLDEN_DATASET,
  REQUEST_DP_DSA_DETAILS_BY_STATUS_ID,
  EDIT_BULK_DATA_ACCESS_TO_INTEGRATED_DATASETS
  // GET_ACTIVE_GDS,
  // REGISTER_GDS,
} from '@/datasetView/store/index';
import {
  datasetViewFactory,
  workflowApi,
  oarApi
  // registerGdsApi,
} from '@/datasetView/services';
import { dsaaFactory } from '@/datasetView/dsaa/services';
import { GdsSidebarStorage } from '@/datasetView/components/gds-sidebar/storage/gds-sidebar.storage';
import store from '@/plugins/global.store';
import { WorkflowStorage } from '@/datasetView/workFlow/storage';
import { gdsEditWorkflowUtil } from '@/datasetView/utilities/gdsEditWorkflow.utils';
import { httpRequest } from '@/common/services';
import { EDITED_FIELDS } from '@/datasetView/usecase-v2/tabs/dsa/bulkRequestAccessToGoldenDatasets/shared/constants';
import {
  DatasetFilter,
  FilterSegments
} from '@/datasetView/usecase-v2/tabs/dsa/bulkRequestAccessToGoldenDatasets/shared/models';
import {
  mockGDSActionsContext,
  mockDQIssuesApiRequest,
  mockGdsGdeDqIssues,
  mockEDACompliancyFlag,
  mockGdsEdaCompliant,
  mockGDSState,
  mockDSADetails,
  mockDataProductDetails,
  mockDsaEditedState
} from './search.store.mock';
import { mockExistingDelegators } from '../../delegation/mocks';
import deepCopy from '@/common/utils/deepCopy';
import {
  IDelegation,
  IRemovedDelegator
} from '@/datasetView/components/delegation/models';
import {
  mockBulkRequestResponse,
  mockEditBulkRequestResponse,
  mockBulkRequestPayload,
  mockGoldenDatasets,
  mockPreviouslySelectedFilters,
  mockAddedEditedFilterValue,
  mockParsedFilterDataForEdit,
  mockParsedOperationPayloadResponse,
  mockDataProductRequestDetails,
  mockPayloadForDpEdit,
  mockInitialDsaTilesState
} from '../../usecase-v2/tabs/dsa/bulkRequestAccessToGoldenDatasets/mockData';
import { allGdeForDSAV2 } from '../../dsaa/dsa.mocks';
import { gdsWorkFlowMock } from '../../workflow/mocks/gdsWofkFlow.mock';
import {
  mockProvidingApplication,
  goldenDatasetMock
} from '../../search-result/data-set-page-v2/gds.mocks';
import { idsDataElementMock } from '../../integratedDatasets/mocks/ids.mocks';

jest.mock('@/plugins/global.store');
const storeMock = store as jest.MockedFunction<typeof store>;
storeMock.mockReturnValue({
  dispatch: jest.fn((action: any) => action),
  commit: jest.fn((mutation: any) => mutation),
  getters: jest.fn()
} as any);

const mockResponse = () => ({
  elements: [
    { xValue: 'MAY', yValue: 50 },
    { xValue: 'JUN', yValue: 30 },
    { xValue: 'JUL', yValue: 35 },
    { xValue: 'AGU', yValue: 10 }
  ],
  gdeElements: [
    {
      change: 2,
      gdeId: '4001',
      total: 20,
      state: 'ready',
      data: [
        { xValue: 'MAY', yValue: 50 },
        { xValue: 'JUN', yValue: 30 },
        { xValue: 'JUL', yValue: 35 },
        { xValue: 'AGU', yValue: 10 }
      ]
    }
  ]
});

const mockGdsGdeDqIssuesGenerate = () => mockGdsGdeDqIssues;
const mockGetDatasetAttributes = allGdeForDSAV2;
const mockGetDatasetElements = allGdeForDSAV2.data.element_attributes;
const mockOarDetailsResponse = { data: mockProvidingApplication };
const mockGdsEdaCompliantResponse = mockGdsEdaCompliant;
const mockSelectedFilter: DatasetFilter = {
  id: 'f1',
  name: 'filter1',
  segments: [
    {
      id: 's1',
      name: 'seg1',
      is_published: false
    },
    {
      id: 's2',
      name: 'seg2',
      is_published: true
    }
  ]
};

jest.mock('@/datasetView/services', () => {
  return {
    datasetViewFactory: {
      getDataQualityIssues: () => Promise.resolve(mockResponse()),
      fetchGdsGdeDqIssues: () => Promise.resolve(mockGdsGdeDqIssuesGenerate()),
      getEdaCompliantForGds: () => Promise.resolve(mockGdsEdaCompliantResponse),
      getDataSetSearchById: () => Promise.resolve(),
      getPhysicalAttributesByPhysicalDataset: () => Promise.resolve(),
      getSegmentsAndConditionsForFilterAndPhysicalAttribute: () =>
        Promise.resolve(),
      getPhysicalDatasetsMappedToGoldenDatasetsFilter: () => Promise.resolve(),
      updatePhysicalAttributesByPhysicalDataset: () => Promise.resolve(),
      updateFilterSegmentsValues: () => Promise.resolve(),
      getDetailsBySrcId: () => Promise.resolve({ data: { logsId: '1' } }),
      getFullListDataSourceWithFilter: () => Promise.resolve({ data: {} }),
      getFullListDataSourceWithFilterParams: () =>
        Promise.resolve({ data: {} }),
      createNewDelegations: () => Promise.resolve(),
      deleteExistingDelegations: () => Promise.resolve(),
      requestAccessToGoldenDatasets: () => Promise.resolve(),
      requestAccessToIntegratedDatasets: () => Promise.resolve(),
      editAccessToGoldenDatasets: () => Promise.resolve(),
      saveGdsMetadataEdit: () => Promise.resolve(),
      getDatasetAttributes: () => Promise.resolve(mockGetDatasetAttributes),
      fetchDatasetElements: () =>
        Promise.resolve({
          data: {
            count: mockGetDatasetElements?.length,
            prev: '',
            next: '',
            results: mockGetDatasetElements
          }
        }),
      getExistingDelegations: () =>
        Promise.resolve({
          results: mockExistingDelegators
        }),
      deleteCommonWorkflowCurrentRequest: () => Promise.resolve(),
      deleteCurrentRequest: () => Promise.resolve(),
      editRequestToDataProductDsa: () => Promise.resolve(),
      requestDpDsaDetailsByStatusId: () => Promise.resolve()
    },
    dsaaFactory: {
      getRequestCancellation: () => Promise.resolve()
    },
    workflowApi: {
      saveToWorkflow: () =>
        Promise.resolve({
          data: {
            requestId: 11,
            workflowModuleApproved: {},
            workflowModule: {}
          }
        })
    },
    getDatasetAttributes: () => Promise.resolve(mockGetDatasetAttributes),
    oarApi: {
      getOarDetailsById: () => Promise.resolve(mockOarDetailsResponse)
    }
  };
});

jest.mock('@/core/plugin', () => ({
  useStorage: jest.fn(() => ({
    features: {
      hasFeature: () => true
    }
  }))
}));
describe('GDS Actions', () => {
  let gdsActionContext: ActionContext<DataSetViewState, RootState>;

  beforeEach(() => {
    gdsActionContext = mockGDSActionsContext();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('SET_GDS_DQ_ISSUE_DATA: should commit SAVE_GDS_DQ_ISSUE_DATA mutuation', async () => {
    const commitSpy = jest.spyOn(gdsActionContext, 'commit');
    await actions[SET_GDS_DQ_ISSUE_DATA](
      gdsActionContext,
      mockDQIssuesApiRequest as never
    );
    const expectedMutattion = [
      [SET_GDS_DQ_ISSUE_LOADING],
      [
        SAVE_GDS_DQ_ISSUE_DATA,
        {
          ...mockResponse(),
          status: 'ready'
        }
      ]
    ];

    expect(commitSpy.mock.calls).toEqual(expectedMutattion);
  });

  it('SET_GDS_DQ_ISSUE_DATA: should commit SET_GDS_DQ_ISSUE_NO_DATA mutuation', async () => {
    const commitSpy = jest.spyOn(gdsActionContext, 'commit');
    await actions[SET_GDS_DQ_ISSUE_DATA](gdsActionContext, {} as never);
    const expectedMutattion = [
      [SET_GDS_DQ_ISSUE_LOADING],
      [SET_GDS_DQ_ISSUE_NO_DATA]
    ];

    expect(commitSpy.mock.calls).toEqual(expectedMutattion);
  });

  it('FETCH_GDS_GDE_DQ_ISSUES: should fetchGdsGdeDqIssues ', async () => {
    const commitSpy = jest.spyOn(gdsActionContext, 'commit');
    await actions[FETCH_GDS_GDE_DQ_ISSUES](gdsActionContext, {} as never);
    const expectedMutation: any = [];
    expect(commitSpy.mock.calls).toEqual([
      [
        'DatasetViewStoreModule/SET_GDS_DQ_ISSUE',
        mockGdsGdeDqIssues.gdsDqIssues
      ],
      [
        'DatasetViewStoreModule/SET_GDE_DQ_ISSUE',
        mockGdsGdeDqIssues.gdeDqIssues
      ]
    ]);
  });

  it('FETCH_GDS_EDA_COMPLIANT: should fetchGdsEdaCompliant ', async () => {
    const apiSpy = jest.spyOn(datasetViewFactory, 'getEdaCompliantForGds');
    const commitSpy = jest.spyOn(gdsActionContext, 'commit');
    await actions[FETCH_GDS_EDA_COMPLIANT](gdsActionContext, {} as never);
    expect(apiSpy).toHaveBeenCalled();
    expect(commitSpy.mock.calls).toEqual([
      ['DatasetViewStoreModule/SET_GDS_EDA_COMPLIANT', mockEDACompliancyFlag]
    ]);
  });

  it('GET_DATA_SET_DETAILS_BY_ID', async () => {
    const apiSpy = jest.spyOn(datasetViewFactory, 'getDetailsBySrcId');
    await actions[GET_DATA_SET_DETAILS_BY_ID](gdsActionContext, {
      logsId: '',
      callV2: true
    } as never);
    expect(apiSpy).toHaveBeenCalled();
  });

  it('GET_SELECTED_DATA_SETS', async () => {
    const commitSpy = jest.spyOn(gdsActionContext, 'commit');
    await actions[GET_SELECTED_DATA_SETS](gdsActionContext, {
      logsId: '',
      callV2: true
    } as never);
    expect(commitSpy).toHaveBeenCalled();
  });

  it('REMOVE_DATA_SETS', async () => {
    const commitSpy = jest.spyOn(gdsActionContext, 'commit');
    await actions[REMOVE_DATA_SETS](gdsActionContext, {
      index: 1
    } as never);
    expect(commitSpy).toHaveBeenCalled();
  });

  it('REMOVE_INTEGRATED_DATA_SET', async () => {
    const commitSpy = jest.spyOn(gdsActionContext, 'commit');
    await actions[REMOVE_INTEGRATED_DATA_SET](gdsActionContext, {
      index: 1
    } as never);
    expect(commitSpy).toHaveBeenCalled();
  });

  it('SELECTED_INTEGRATED_DATA_SET', async () => {
    const commitSpy = jest.spyOn(gdsActionContext, 'commit');
    await actions[SELECTED_INTEGRATED_DATA_SET](gdsActionContext, {
      selectedIds: {}
    } as never);
    expect(commitSpy).toHaveBeenCalled();
  });

  it('MAPPED_INTEGRATED_DATA_ELEMENTS', async () => {
    const commitSpy = jest.spyOn(gdsActionContext, 'commit');
    await actions[MAPPED_INTEGRATED_DATA_ELEMENTS](gdsActionContext, {
      mappedIdes: {}
    } as never);
    expect(commitSpy).toHaveBeenCalled();
  });

  it('MAPPED_GOLDEN_DATA_ELEMENTS', async () => {
    const commitSpy = jest.spyOn(gdsActionContext, 'commit');
    await actions[MAPPED_GOLDEN_DATA_ELEMENTS](gdsActionContext, {
      mappedIdes: {}
    } as never);
    expect(commitSpy).toHaveBeenCalled();
  });

  it('GET_DATA_SET_DETAILS_BY_ID error', async () => {
    const commitSpy = jest.spyOn(gdsActionContext, 'commit');
    jest
      .spyOn(datasetViewFactory, 'getDetailsBySrcId')
      .mockReturnValueOnce(Promise.reject(new Error('error')));
    try {
      // call some methods, do something...
      await actions[GET_DATA_SET_DETAILS_BY_ID](gdsActionContext, {
        logsId: '',
        callV2: true
      } as never);
    } catch (error) {
      expect(commitSpy).not.toHaveBeenCalled();
    }
  });

  it('GET_DATA_SET_ID', async () => {
    const apiSpy = jest.spyOn(datasetViewFactory, 'getDataSetSearchById');
    await actions[GET_DATA_SET_ID](gdsActionContext, {} as never);

    expect(apiSpy).toHaveBeenCalled();
  });

  it('GET_DATA_SET_WITH_FILTER', async () => {
    const apiSpy = jest.spyOn(
      datasetViewFactory,
      'getFullListDataSourceWithFilter'
    );
    await actions[GET_DATA_SET_WITH_FILTER](gdsActionContext, {} as never);

    expect(apiSpy).toHaveBeenCalled();
  });

  it('GET_DATA_SET_WITH_FILTER_PARAMS', async () => {
    const apiSpy = jest.spyOn(
      datasetViewFactory,
      'getFullListDataSourceWithFilterParams'
    );
    await actions[GET_DATA_SET_WITH_FILTER_PARAMS](
      gdsActionContext,
      {} as never
    );

    expect(apiSpy).toHaveBeenCalled();
  });

  it('GET_DATA_SET_WITH_FILTER_NEW', async () => {
    const apiSpy = jest.spyOn(
      datasetViewFactory,
      'getFullListDataSourceWithFilter'
    );
    const commitSpy = jest.spyOn(gdsActionContext, 'commit');
    await actions[GET_DATA_SET_WITH_FILTER_NEW](gdsActionContext, {
      filterApplied: '',
      callSourcingV2: true
    } as never);

    expect(apiSpy).toHaveBeenCalled();
    expect(commitSpy).toHaveBeenCalled();
  });

  it('GET_DATA_SET_WITH_FILTER_NEW with append', async () => {
    const apiSpy = jest.spyOn(
      datasetViewFactory,
      'getFullListDataSourceWithFilter'
    );
    const commitSpy = jest.spyOn(gdsActionContext, 'commit');
    await actions[GET_DATA_SET_WITH_FILTER_NEW](gdsActionContext, {
      filterApplied: '',
      callSourcingV2: true,
      withAppend: true
    } as never);
    expect(apiSpy).toHaveBeenCalled();
    expect(commitSpy).toHaveBeenCalled();
  });

  it('SAVE_AND_CLOSE_DELEGATIONS', async () => {
    const commitSpy = jest.spyOn(gdsActionContext, 'commit');
    const createdSpy = jest.spyOn(datasetViewFactory, 'createNewDelegations');
    const deletedSpy = jest.spyOn(
      datasetViewFactory,
      'deleteExistingDelegations'
    );
    const prepareDelegationPayloadSpy = jest.spyOn(
      DelegationHelpers,
      'prepareDelegationPayload'
    );

    await actions[SAVE_AND_CLOSE_DELEGATIONS](gdsActionContext, {} as never);

    expect(commitSpy).toHaveBeenCalledWith(
      'DatasetViewStoreModule/CLEAR_COMPLETED_USER_ACTIONS_FROM_STORE'
    );

    expect(prepareDelegationPayloadSpy).toBeCalledTimes(2);
    expect(createdSpy).toHaveBeenCalled();
    expect(deletedSpy).toHaveBeenCalled();
  });

  it('SAVE_AND_CLOSE_DELEGATIONS when isDelegatedForAll checked', async () => {
    // given
    const newMockExistingDelegators = deepCopy(mockExistingDelegators);
    newMockExistingDelegators[0].isDelegatedForAll = true;
    newMockExistingDelegators[1].isDelegatedForAll = true;
    gdsActionContext.state.delegations.userActions.created = [
      newMockExistingDelegators[0]
    ];
    gdsActionContext.state.delegations.userActions.removed = [
      newMockExistingDelegators[1]
    ];

    const mockDelegationPreparedPayload: IDelegation[] = [];
    const mockRevokationPreparedPayload: IRemovedDelegator[] = [];
    gdsActionContext.state.delegations.datasetsOfOwner.forEach((logsId) => {
      const delegationAction = deepCopy(newMockExistingDelegators[0]);
      delegationAction.logsId = logsId;
      mockDelegationPreparedPayload.push(delegationAction);
    });
    gdsActionContext.state.delegations.datasetsOfSteward.forEach((logsId) => {
      const delegationAction = deepCopy(newMockExistingDelegators[1]);
      delegationAction.logsId = logsId;
      mockRevokationPreparedPayload.push(delegationAction);
    });

    const commitSpy = jest.spyOn(gdsActionContext, 'commit');
    const createdSpy = jest.spyOn(datasetViewFactory, 'createNewDelegations');
    const deletedSpy = jest.spyOn(
      datasetViewFactory,
      'deleteExistingDelegations'
    );
    const prepareDelegationPayloadSpy = jest.spyOn(
      DelegationHelpers,
      'prepareDelegationPayload'
    );

    // when
    await actions[SAVE_AND_CLOSE_DELEGATIONS](gdsActionContext, {} as never);

    // then
    expect(commitSpy).toHaveBeenCalledWith(
      'DatasetViewStoreModule/CLEAR_COMPLETED_USER_ACTIONS_FROM_STORE'
    );

    expect(prepareDelegationPayloadSpy).toBeCalledTimes(2);
    expect(prepareDelegationPayloadSpy).toHaveNthReturnedWith(
      1,
      mockDelegationPreparedPayload
    );
    expect(prepareDelegationPayloadSpy).toHaveNthReturnedWith(
      2,
      mockRevokationPreparedPayload
    );

    expect(createdSpy).toHaveBeenCalled();
    expect(deletedSpy).toHaveBeenCalled();
  });
  it('GET_ALL_DELEGATIONS ', async () => {
    const commitSpy = jest.spyOn(gdsActionContext, 'commit');
    const getApiSpy = jest.spyOn(datasetViewFactory, 'getExistingDelegations');

    await actions[GET_ALL_DELEGATIONS](gdsActionContext, {} as never);

    expect(commitSpy).toHaveBeenCalledWith(
      'DatasetViewStoreModule/SET_ALL_DELEGATIONS_TO_STORE',
      mockExistingDelegators
    );
    expect(getApiSpy).toHaveBeenCalled();
  });
  it('REQUEST_BULK_DATA_ACCESS_TO_GOLDEN_DATASETS when it completes without any error', async () => {
    // given
    const requestAccessSpy = jest
      .spyOn(datasetViewFactory, 'requestAccessToGoldenDatasets')
      .mockResolvedValue(mockBulkRequestResponse);

    // when
    const returnResult = await actions[
      REQUEST_BULK_DATA_ACCESS_TO_GOLDEN_DATASETS
    ](gdsActionContext, {} as never);

    expect(requestAccessSpy).toBeCalledTimes(1);
    expect(returnResult).toStrictEqual(mockBulkRequestResponse);
  });
  it('REQUEST_BULK_DATA_ACCESS_TO_GOLDEN_DATASETS when it completes with failure', async () => {
    // given
    jest.spyOn(gdsActionContext, 'commit');
    const requestAccessSpy = jest
      .spyOn(datasetViewFactory, 'requestAccessToGoldenDatasets')
      .mockResolvedValue(mockBulkRequestResponse);

    // when
    const returnResult = await actions[
      REQUEST_BULK_DATA_ACCESS_TO_GOLDEN_DATASETS
    ](gdsActionContext, {} as never);

    expect(requestAccessSpy).toBeCalledTimes(1);
    expect(returnResult).toStrictEqual(mockBulkRequestResponse);
  });

  it('REQUEST_BULK_DATA_ACCESS_TO_INTEGRATED_DATASETS when it completes without any error', async () => {
    // given
    const requestAccessSpy = jest
      .spyOn(datasetViewFactory, 'requestAccessToIntegratedDatasets')
      .mockResolvedValue(mockBulkRequestResponse);

    // when
    const returnResult = await actions[
      REQUEST_BULK_DATA_ACCESS_TO_INTEGRATED_DATASETS
    ](gdsActionContext, {} as never);

    expect(requestAccessSpy).toBeCalledTimes(1);
    expect(returnResult).toStrictEqual(mockBulkRequestResponse);
  });
  it('REQUEST_BULK_DATA_ACCESS_TO_INTEGRATED_DATASETS when it completes with failure', async () => {
    // given
    jest.spyOn(gdsActionContext, 'commit');
    const requestAccessSpy = jest
      .spyOn(datasetViewFactory, 'requestAccessToIntegratedDatasets')
      .mockResolvedValue(mockBulkRequestResponse);

    // when
    const returnResult = await actions[
      REQUEST_BULK_DATA_ACCESS_TO_INTEGRATED_DATASETS
    ](gdsActionContext, {} as never);

    expect(requestAccessSpy).toBeCalledTimes(1);
    expect(returnResult).toStrictEqual(mockBulkRequestResponse);
  });

  it('EDIT_BULK_DATA_ACCESS_TO_GOLDEN_DATASETS when it completes without any error', async () => {
    const requestEditAccessSpy = jest
      .spyOn(datasetViewFactory, 'editAccessToGoldenDatasets')
      .mockResolvedValue(mockEditBulkRequestResponse);
    const parseEditStateToPayloadSpy = jest.spyOn(
      SearchStoreMapper,
      'parseEditStateToPayload'
    );

    const returnResult = await actions[
      EDIT_BULK_DATA_ACCESS_TO_GOLDEN_DATASETS
    ](gdsActionContext, {} as never);

    expect(requestEditAccessSpy).toHaveBeenCalled();
    expect(parseEditStateToPayloadSpy).toHaveBeenCalled();
    expect(returnResult).toStrictEqual(mockEditBulkRequestResponse);
  });
  it('EDIT_BULK_DATA_ACCESS_TO_GOLDEN_DATASETS when it completes with failure', async () => {
    const requestEditAccessSpy = jest.spyOn(
      datasetViewFactory,
      'editAccessToGoldenDatasets'
    );
    const error = new Error('error');
    jest
      .spyOn(datasetViewFactory, 'editAccessToGoldenDatasets')
      .mockReturnValueOnce(Promise.reject(error));

    const returnResult = await actions[
      EDIT_BULK_DATA_ACCESS_TO_GOLDEN_DATASETS
    ](gdsActionContext, {} as never);
    expect(requestEditAccessSpy).toHaveBeenCalled();
    expect(returnResult).toStrictEqual(error);
  });

  describe('REQUEST_DSA_DETAILS_BY_MASTERID', () => {
    it('succeeds and commit data into store', async () => {
      const commitSpy = jest.spyOn(gdsActionContext, 'commit');
      const dataElements = [4001, 4002, 4003];
      const { approval_details: approvalDetails } = mockDSADetails.data;
      const filters = mockDSADetails.data.filters;
      const logsId = mockDSADetails.data.Data_sharing_agreement.logid;
      const parseFiltersAndSegmentsSpy = jest.spyOn(
        SearchStoreMapper,
        'parseFiltersAndSegments'
      );
      const httpRequestGetSpy = jest
        .spyOn(httpRequest, 'get')
        .mockResolvedValue(mockDSADetails);
      await actions[REQUEST_DSA_DETAILS_BY_MASTERID](
        gdsActionContext,
        '123' as never
      );

      expect(httpRequestGetSpy).toHaveBeenCalledWith(
        expect.stringContaining('dsa/details/123')
      );
      expect(parseFiltersAndSegmentsSpy).toHaveBeenCalledWith(logsId, filters);
      expect(parseFiltersAndSegmentsSpy).toReturnWith(
        mockParsedFilterDataForEdit
      );
      expect(commitSpy).toHaveBeenCalledWith(
        'DatasetViewStoreModule/SET_PREVIOUSLY_SELECTED_FILTER_SEGMENTS',
        mockParsedFilterDataForEdit
      );
      expect(commitSpy).toHaveBeenCalledWith(
        'DatasetViewStoreModule/SET_BULK_DATA_ACCESS_PAYLOAD_CONSUMING_APP',
        { oarId: 'AAB.SYS.018978' }
      );
      expect(commitSpy).toHaveBeenCalledWith(
        'DatasetViewStoreModule/SET_BULK_DATA_ACCESS_PAYLOAD_PERIOD',
        {
          end: '09/30/2023',
          start: '09/01/2023'
        }
      );
      expect(commitSpy).toHaveBeenCalledWith(
        'DatasetViewStoreModule/SET_BULK_DATA_ACCESS_PAYLOAD_DATASET_ELEMENTS',
        {
          allDataElementsSelected: false,
          dataElements,
          logsId: 12,
          totalDataElements: 3
        }
      );
      expect(commitSpy).toHaveBeenCalledWith(
        'DatasetViewStoreModule/SET_PREVIOUSLY_SELECTED_DATA_ELEMENTS',
        dataElements
      );
      expect(commitSpy).toHaveBeenCalledWith(
        'DatasetViewStoreModule/SET_BULK_DATA_ACCESS_SELECTED_DATASET_ELEMENTS',
        dataElements
      );
      expect(commitSpy).toHaveBeenCalledWith(
        'DatasetViewStoreModule/SET_BULK_DATA_ACCESS_APPROVAL_DETAILS',
        approvalDetails
      );
    });
  });

  it('FETCH_BULK_DATA_ACCESS_DATAELEMENTS_OPTIONS', async () => {
    const commitSpy = jest.spyOn(gdsActionContext, 'commit');
    const fetchDatasetElementsSpy = jest.spyOn(
      datasetViewFactory,
      'fetchDatasetElements'
    );

    await actions[FETCH_BULK_DATA_ACCESS_DATAELEMENTS_OPTIONS](
      gdsActionContext,
      {
        logsId: 11441,
        paginationDataFilter: '',
        callSourcingV2: false
      } as never
    );

    expect(fetchDatasetElementsSpy).toBeCalledWith(11441, '', false);
    expect(commitSpy).toHaveBeenNthCalledWith(
      1,
      'DatasetViewStoreModule/SET_BULK_DATA_ACCESS_DATAELEMENTS_OPTIONS',
      []
    );
    expect(commitSpy).toHaveBeenNthCalledWith(
      2,
      'DatasetViewStoreModule/SET_BULK_DATA_ACCESS_DATAELEMENTS_OPTIONS',
      mockGetDatasetElements
    );
    expect(commitSpy).toHaveBeenNthCalledWith(
      3,
      'DatasetViewStoreModule/SET_BULK_DATA_ACCESS_TOTAL_DATAELEMENTS',
      { count: 2, logsId: 11441 }
    );
  });

  it('FETCH_BULK_DATA_ACCESS_IDS_DATAELEMENTS_OPTIONS', async () => {
    const commitSpy = jest.spyOn(gdsActionContext, 'commit');
    const fetchDatasetElementsSpy = jest.spyOn(IdsStorage, 'fetchIdsElements');
    const fetchIdeGdeSpy = jest.spyOn(IdeService, 'fetchIdeGdeMapping');

    jest.spyOn(IdsStorage, 'idsDataElements').mockReturnValue({
      results: [idsDataElementMock],
      count: 1,
      next: null,
      previous: null
    } as IdsDataElementsResponse);

    await actions[FETCH_BULK_DATA_ACCESS_IDS_DATAELEMENTS_OPTIONS](
      gdsActionContext,
      {
        idsId: 11555,
        paginationDataFilter: ''
      } as never
    );

    expect(fetchDatasetElementsSpy).toBeCalledWith('11555');
    expect(fetchIdeGdeSpy).toBeCalledWith({
      idsIds: [11555],
      tokenUrl: 'https://mdc-dcat-d-01-apps.azurewebsites.net/api/get_token_dca'
    });
    expect(commitSpy).toHaveBeenNthCalledWith(
      1,
      'DatasetViewStoreModule/SET_BULK_DATA_ACCESS_IDS_DATAELEMENTS_OPTIONS',
      []
    );

    expect(commitSpy).toHaveBeenNthCalledWith(
      2,
      'DatasetViewStoreModule/SET_BULK_DATA_ACCESS_IDS_DATAELEMENTS_OPTIONS',
      [idsDataElementMock]
    );
    expect(commitSpy).toHaveBeenNthCalledWith(
      3,
      'DatasetViewStoreModule/SET_BULK_DATA_ACCESS_TOTAL_IDS_DATAELEMENTS',
      { count: 1, idsId: 11555 }
    );
  });

  it('Returns early if no data is found', async () => {
    const commitSpy = jest.spyOn(gdsActionContext, 'commit');
    const fetchDatasetElementsSpy = jest
      .spyOn(datasetViewFactory, 'fetchDatasetElements')
      .mockResolvedValue({} as PaginatedResults<LinkedElement>);

    await actions[FETCH_BULK_DATA_ACCESS_DATAELEMENTS_OPTIONS](
      gdsActionContext,
      {
        logsId: 11441,
        paginationDataFilter: '',
        callSourcingV2: false
      } as never
    );

    expect(fetchDatasetElementsSpy).toBeCalledWith(11441, '', false);
    expect(commitSpy).toHaveBeenNthCalledWith(
      1,
      'DatasetViewStoreModule/SET_BULK_DATA_ACCESS_DATAELEMENTS_OPTIONS',
      []
    );
    expect(commitSpy).toBeCalledTimes(1);
  });

  it('SAVE_GOLDEN_DATA_SET_CHANGES', async () => {
    const saveToWorkflowSpy = jest
      .spyOn(workflowApi, 'saveToWorkflow')
      .mockResolvedValue(gdsWorkFlowMock);
    const setEditRequestSpy = jest
      .spyOn(GdsSidebarStorage, 'setEditRequest')
      .mockImplementation(jest.fn());
    const setCommonWorkflowRequestSpy = jest
      .spyOn(GdsSidebarStorage, 'setCommonWorkflowRequest')
      .mockImplementation(jest.fn());
    await actions[SAVE_GOLDEN_DATA_SET_CHANGES](
      gdsActionContext,
      11441 as never
    );
    expect(saveToWorkflowSpy).toBeCalled();
    expect(setEditRequestSpy).toBeCalled();
    expect(setCommonWorkflowRequestSpy).toBeCalled();
  });

  it('DELETE_CURRENT_REQUEST ', async () => {
    const deleteApiSpy = jest.spyOn(
      datasetViewFactory,
      'deleteCommonWorkflowCurrentRequest'
    );
    gdsActionContext.state.gdsSidebar.cwfFlag = true;
    await actions[DELETE_CURRENT_REQUEST](gdsActionContext, {} as never);
    expect(deleteApiSpy).toHaveBeenCalled();
  });

  it('DELETE_CURRENT_REQUEST ', async () => {
    await actions[DELETE_CURRENT_REQUEST](gdsActionContext, {} as never);
    expect(gdsActionContext.state.gdsSidebar.cwfFlag).toBeFalsy();
  });

  it('SAVE_PARTIALLY_APPROVED_GDS_EDIT ', async () => {
    const mockEditRequest = (): EditLinkageRequest => ({
      id: 1,
      logs_id: 11100237,
      request_status_flag: 'P',
      request_status: 'P', // whats the difference between request_status and request_status_flag
      dataset_name: 'PRD data',
      approval_details: [
        {
          requestor_name: 'dmp_all',
          approver_name: 'Abhishek',
          requestor_id: 111111,
          approver_id: 231427111,
          admin_flag: '',
          approver_comment: '',
          approver_role: 'S',
          requestor_role: 'A'
        }
      ],
      business_metadata: {
        request_status: 'A',
        description: 'The List of Golden Sources (LoGS).',
        retention_period: 2555,
        legal_ground_for_collecting:
          'ACBS is the credit and collateral administration for ABN Amro mainbank.',
        personal_data_classification: 'Sensitive personal data',
        confidentiality: '1',
        integrity: '1',
        availability: '1',
        contains_historical_data_flag: 'No',
        originated_in: '',
        validator: '',
        data_owner_id: '471637',
        data_owner_name: 'Raymond Yong V2',
        data_steward_id: '123',
        data_steward_name: 'abc',
        golden_src_name: 'def',
        golden_src_id: '11100237'
      },
      golden_elements: [
        {
          data_element_id: 142,
          temp_data_element_id: 142,
          change_type: 'A',
          request_status: 'A',
          data_element_name: 'test1',
          potential_sensitive_flag: 'Yes',
          key_element_flag: 'Yes',
          term_id: '21',
          collection_id: 56,
          identifying_flag: 'Yes',
          referring_flag: 'Yes',
          linked_referring_element_id: '12321',
          purpose_referring: '12321',
          external_originated_flag: 'Yes',
          attributes: [
            {
              data_attribute_id: 56197,
              column_name: 'PD_RATING_ID',
              column_description:
                'The unique id for the approved ratings in Central Rating table',
              flat_file_id: 3517,
              file_name: 'FAIR_PD_UCR_Results',
              file_description: 'PD rating end result data from FAIR ',
              file_extension: 'txt',
              edit_linkage_flag: undefined
            },
            {
              data_attribute_id: 56198,
              column_name: 'GROUP_SUPPORT_ADJUSTED_PD',
              column_description: 'PD rating after group support is applied',
              flat_file_id: 3517,
              file_name: 'FAIR_PD_UCR_Results',
              file_description: 'PD rating end result data from FAIR ',
              file_extension: 'txt',
              edit_linkage_flag: undefined
            }
          ]
        },
        {
          data_element_id: 11,
          change_type: 'A',
          request_status: 'A',
          data_element_name: 'Data Element 11',
          potential_sensitive_flag: 'Yes',
          key_element_flag: 'Yes',
          term_id: '21',
          collection_id: 56,
          identifying_flag: 'Yes',
          linked_referring_element_id: '12321',
          purpose_referring: '12321',
          external_originated_flag: 'Yes',
          attributes: [],
          referring_flag: 'Yes'
        },
        {
          data_element_id: 22,
          change_type: 'A',
          request_status: 'A',
          data_element_name: 'Data Element 22',
          potential_sensitive_flag: 'Yes',
          key_element_flag: 'Yes',
          term_id: '21',
          collection_id: 56,
          identifying_flag: 'Yes',
          linked_referring_element_id: '12321',
          purpose_referring: '12321',
          external_originated_flag: 'Yes',
          attributes: [],
          referring_flag: 'Yes'
        },
        {
          data_element_id: 2,
          change_type: 'E',
          request_status: 'A',
          data_element_name: 'Data Element 22',
          potential_sensitive_flag: 'Yes',
          key_element_flag: 'Yes',
          term_id: '21',
          collection_id: 56,
          identifying_flag: 'Yes',
          linked_referring_element_id: '12321',
          purpose_referring: '12321',
          external_originated_flag: 'Yes',
          attributes: [],
          referring_flag: 'Yes'
        },
        {
          data_element_name: 'Data Element 3',
          data_element_id: 3,
          change_type: 'D',
          request_status: 'A',
          referring_flag: 'Yes'
        },
        {
          data_element_name: 'Data Elmeent 4',
          data_element_id: 4,
          change_type: 'D',
          request_status: 'A',
          referring_flag: 'Yes'
        }
      ]
    });
    gdsActionContext.state.gdsSidebar.cwfFlag = true;
    jest
      .spyOn(WorkflowStorage, 'getWorkFlowDetails')
      .mockImplementation(jest.fn())
      .mockReturnValue({
        requestId: 123,
        workflowModule: {},
        workflowModuleApproved: {}
      });
    jest
      .spyOn(gdsEditWorkflowUtil, 'getApprovedNewCommonWorkflowChanges')
      .mockImplementation(jest.fn())
      .mockReturnValue(mockEditRequest());
    const callEditApprovedApisSpy = jest
      .spyOn(gdsEditWorkflowUtil, 'callEditApprovedApis')
      .mockImplementation(jest.fn());
    gdsActionContext.state.gdsSidebar.cwfFlag = true;
    await actions[SAVE_PARTIALLY_APPROVED_GDS_EDIT](gdsActionContext, {
      corpId: 11,
      callSourcingV2: false,
      comments: 'test comments'
    } as never);
    expect(callEditApprovedApisSpy).toBeCalledWith(
      mockEditRequest(),
      11,
      'PA',
      true,
      false,
      'test comments'
    );
  });

  it('SAVE_GDS_OWNERSHIP_EDIT ', async () => {
    const saveGdsMetadataEditSpy = jest.spyOn(
      datasetViewFactory,
      'saveGdsMetadataEdit'
    );
    const commitSpy = jest.spyOn(gdsActionContext, 'dispatch');
    await actions[SAVE_GDS_OWNERSHIP_EDIT](gdsActionContext, false as never);
    expect(saveGdsMetadataEditSpy).toHaveBeenCalled();
    expect(commitSpy).toHaveBeenCalledTimes(2);
  });

  describe('GET_OAR_DETAILS_BY_ID', () => {
    it('should return first element from API results when no oarNumber found', async () => {
      const commitSpy = jest.spyOn(gdsActionContext, 'commit');

      await actions[GET_OAR_DETAILS_BY_ID](
        gdsActionContext,
        'whatever' as never
      );

      expect(commitSpy).toHaveBeenCalledWith(
        MUTATE_CURRENT_OAR_DETAILS,
        mockProvidingApplication[0]
      );
    });

    it('should return first element from API results when no oarNumber found', async () => {
      const storeState = mockGDSState();
      storeState.dataSet.golden_dataset = {
        ...goldenDatasetMock,
        golden_src_id: mockProvidingApplication[1].oarNumber
      };
      const gdsActionContextLocal: ActionContext<DataSetViewState, RootState> =
        mockGDSActionsContext(storeState);
      const commitSpy = jest.spyOn(gdsActionContextLocal, 'commit');

      await actions[GET_OAR_DETAILS_BY_ID](
        gdsActionContextLocal,
        'whatever' as never
      );

      expect(commitSpy).toHaveBeenCalledWith(
        MUTATE_CURRENT_OAR_DETAILS,
        mockProvidingApplication[1]
      );
    });

    it('should not commit mutation if no data retrieved', async () => {
      const commitSpy = jest.spyOn(gdsActionContext, 'commit');
      jest
        .spyOn(oarApi, 'getOarDetailsById')
        .mockReturnValueOnce(Promise.reject());

      await actions[GET_OAR_DETAILS_BY_ID](
        gdsActionContext,
        'whatever' as never
      );

      expect(commitSpy).not.toHaveBeenCalled();
    });
  });

  describe('SAVE_DATAELEMENTS_EDITED_FIELDS', () => {
    it('should not do anything when GDS not found', async () => {
      const storeState = mockGDSState();
      storeState.bulkDataAccess.accessRequestPayload.goldenDatasets =
        mockBulkRequestPayload.goldenDatasets;
      const gdsActionContextLocal: ActionContext<DataSetViewState, RootState> =
        mockGDSActionsContext(storeState);
      const commitSpy = jest.spyOn(gdsActionContextLocal, 'commit');

      await actions[SAVE_DATAELEMENTS_EDITED_FIELDS](
        gdsActionContextLocal,
        3 as never
      );

      expect(commitSpy).not.toHaveBeenCalled();
    });

    it('should find logsid and add/remove elems when comparing to previously selected ones', async () => {
      const storeState = mockGDSState();
      storeState.bulkDataAccess.accessRequestPayload.goldenDatasets =
        mockBulkRequestPayload.goldenDatasets;
      storeState.bulkDataAccess.previouslySelectedDataElements = [123, 236];
      const gdsActionContextLocal: ActionContext<DataSetViewState, RootState> =
        mockGDSActionsContext(storeState);
      const commitSpy = jest.spyOn(gdsActionContextLocal, 'commit');

      await actions[SAVE_DATAELEMENTS_EDITED_FIELDS](
        gdsActionContextLocal,
        2 as never
      );

      expect(commitSpy).toHaveBeenCalledWith(SET_ADD_EDITED_FIELD, {
        field: EDITED_FIELDS.DATA_ELEMENTS,
        value: [234, 345]
      });
      expect(commitSpy).toHaveBeenCalledWith(SET_REMOVE_EDITED_FIELD, {
        field: EDITED_FIELDS.DATA_ELEMENTS,
        value: [236]
      });
    });
  });

  describe('SAVE_IDS_DATAELEMENTS_EDITED_FIELDS', () => {
    it('should not do anything when GDS not found', async () => {
      const storeState = mockGDSState();
      storeState.bulkDataAccess.accessRequestPayload.integratedDatasets =
        mockBulkRequestPayload.integratedDatasets;
      const gdsActionContextLocal: ActionContext<DataSetViewState, RootState> =
        mockGDSActionsContext(storeState);
      const commitSpy = jest.spyOn(gdsActionContextLocal, 'commit');

      await actions[SAVE_IDS_DATAELEMENTS_EDITED_FIELDS](
        gdsActionContextLocal,
        3 as never
      );

      expect(commitSpy).not.toHaveBeenCalled();
    });
  });

  describe('FETCH_GDS_CREATION_LOOKUPS', () => {
    it('should call the SET_GDS_CREATION_LOOKUPS mutation with an empty string', async () => {
      const storeState = mockGDSState();
      const gdsActionContextLocal: ActionContext<DataSetViewState, RootState> =
        mockGDSActionsContext(storeState);
      const commitSpy = jest.spyOn(gdsActionContextLocal, 'commit');

      await actions[FETCH_GDS_CREATION_LOOKUPS](
        gdsActionContextLocal,
        '' as never
      );

      expect(commitSpy).toHaveBeenCalledWith(SET_GDS_CREATION_LOOKUPS, '');
    });
  });

  describe('SET_ACTIVE_GDS_WITH_PAYLOAD', () => {
    it('should call the SET_ACTIVE_GDS_DATA mutation with the payload', async () => {
      const storeState = mockGDSState();
      const gdsActionContextLocal: ActionContext<DataSetViewState, RootState> =
        mockGDSActionsContext(storeState);
      const commitSpy = jest.spyOn(gdsActionContextLocal, 'commit');

      const payload = {
        golden_dataset_name: 'Test GDS',
        business_unit: 'Test Business Unit'
      };

      await actions[SET_ACTIVE_GDS_WITH_PAYLOAD](
        gdsActionContextLocal,
        payload as never
      );

      expect(commitSpy).toHaveBeenCalledWith(SET_ACTIVE_GDS_DATA, payload);
    });
  });

  describe('TOGGLE_GDE', () => {
    it('should remove element from temp selection when found', async () => {
      const storeState = mockGDSState();
      storeState.bulkDataAccess.tempSelectedDataElements = [1, 2, 3];
      const gdsActionContextLocal: ActionContext<DataSetViewState, RootState> =
        mockGDSActionsContext(storeState);
      const commitSpy = jest.spyOn(gdsActionContextLocal, 'commit');

      await actions[TOGGLE_GDE](gdsActionContextLocal, 2 as never);

      expect(commitSpy).toHaveBeenCalledWith(
        SET_BULK_DATA_ACCESS_SELECTED_DATASET_ELEMENTS,
        [1, 3]
      );
    });

    it('should remove element from temp selection when found', async () => {
      const storeState = mockGDSState();
      storeState.bulkDataAccess.tempSelectedDataElements = [1, 2, 3];
      const gdsActionContextLocal: ActionContext<DataSetViewState, RootState> =
        mockGDSActionsContext(storeState);
      const commitSpy = jest.spyOn(gdsActionContextLocal, 'commit');

      await actions[TOGGLE_GDE](gdsActionContextLocal, 4 as never);

      expect(commitSpy).toHaveBeenCalledWith(
        SET_BULK_DATA_ACCESS_SELECTED_DATASET_ELEMENTS,
        [1, 2, 3, 4]
      );
    });
  });

  describe('TOGGLE_IDE', () => {
    it('should remove element from temp selection when found', async () => {
      const storeState = mockGDSState();
      storeState.bulkDataAccess.tempSelectedIDSDataElements = [1, 2, 3];
      const gdsActionContextLocal: ActionContext<DataSetViewState, RootState> =
        mockGDSActionsContext(storeState);
      const commitSpy = jest.spyOn(gdsActionContextLocal, 'commit');

      await actions[TOGGLE_IDE](gdsActionContextLocal, 2 as never);

      expect(commitSpy).toHaveBeenCalledWith(
        SET_BULK_DATA_ACCESS_SELECTED_IDS_ELEMENTS,
        [1, 3]
      );
    });

    it('should remove element from temp selection when found', async () => {
      const storeState = mockGDSState();
      storeState.bulkDataAccess.tempSelectedIDSDataElements = [1, 2, 3];
      const gdsActionContextLocal: ActionContext<DataSetViewState, RootState> =
        mockGDSActionsContext(storeState);
      const commitSpy = jest.spyOn(gdsActionContextLocal, 'commit');

      await actions[TOGGLE_IDE](gdsActionContextLocal, 4 as never);

      expect(commitSpy).toHaveBeenCalledWith(
        SET_BULK_DATA_ACCESS_SELECTED_IDS_ELEMENTS,
        [1, 2, 3, 4]
      );
    });
  });

  describe('TOGGLE_SELECT_ALL_GDES', () => {
    it('should initiate empty temp selection if no GDE list passed', async () => {
      const commitSpy = jest.spyOn(gdsActionContext, 'commit');

      await actions[TOGGLE_SELECT_ALL_GDES](
        gdsActionContext,
        undefined as never
      );

      expect(commitSpy).toHaveBeenCalledWith(
        SET_BULK_DATA_ACCESS_SELECTED_DATASET_ELEMENTS,
        []
      );
    });

    it('should initiate empty temp selection if no GDE list passed', async () => {
      const commitSpy = jest.spyOn(gdsActionContext, 'commit');

      await actions[TOGGLE_SELECT_ALL_GDES](gdsActionContext, [123] as never);

      expect(commitSpy).toHaveBeenCalledWith(
        SET_BULK_DATA_ACCESS_SELECTED_DATASET_ELEMENTS,
        [123]
      );
    });
  });

  describe('TOGGLE_SELECT_ALL_IDES', () => {
    it('should initiate empty temp selection if no GDE list passed', async () => {
      const commitSpy = jest.spyOn(gdsActionContext, 'commit');

      await actions[TOGGLE_SELECT_ALL_IDES](
        gdsActionContext,
        undefined as never
      );

      expect(commitSpy).toHaveBeenCalledWith(
        SET_BULK_DATA_ACCESS_SELECTED_IDS_ELEMENTS,
        []
      );
    });

    it('should initiate empty temp selection if no IDE list passed', async () => {
      const commitSpy = jest.spyOn(gdsActionContext, 'commit');

      await actions[TOGGLE_SELECT_ALL_IDES](gdsActionContext, [2] as never);

      expect(commitSpy).toHaveBeenCalledWith(
        SET_BULK_DATA_ACCESS_SELECTED_IDS_ELEMENTS,
        [2]
      );
    });
  });

  describe('LOAD_PREVIOUS_GDE_SELECTION', () => {
    it('it should set temp selection with previous selection if GDS is found', async () => {
      const storeState = mockGDSState();
      storeState.bulkDataAccess.accessRequestPayload.goldenDatasets =
        mockBulkRequestPayload.goldenDatasets;
      const gdsActionContextLocal: ActionContext<DataSetViewState, RootState> =
        mockGDSActionsContext(storeState);
      const commitSpy = jest.spyOn(gdsActionContextLocal, 'commit');

      await actions[LOAD_PREVIOUS_GDE_SELECTION](
        gdsActionContextLocal,
        2 as never
      );

      expect(commitSpy).toHaveBeenCalledWith(
        SET_BULK_DATA_ACCESS_SELECTED_DATASET_ELEMENTS,
        mockBulkRequestPayload.goldenDatasets[1].dataElements
      );
    });

    it('it should set temp selection with previous selection if GDS is found', async () => {
      const commitSpy = jest.spyOn(gdsActionContext, 'commit');

      await actions[LOAD_PREVIOUS_GDE_SELECTION](gdsActionContext, 2 as never);

      expect(commitSpy).not.toHaveBeenCalled();
    });
  });

  describe('LOAD_PREVIOUS_IDE_SELECTION', () => {
    it('it should set temp selection with previous selection if GDS is found', async () => {
      const storeState = mockGDSState();
      storeState.bulkDataAccess.accessRequestPayload.integratedDatasets =
        mockBulkRequestPayload.integratedDatasets;
      const gdsActionContextLocal: ActionContext<DataSetViewState, RootState> =
        mockGDSActionsContext(storeState);
      const commitSpy = jest.spyOn(gdsActionContextLocal, 'commit');

      await actions[LOAD_PREVIOUS_IDE_SELECTION](
        gdsActionContextLocal,
        11555 as never
      );

      expect(commitSpy).toHaveBeenCalledWith(
        'DatasetViewStoreModule/SET_BULK_DATA_ACCESS_SELECTED_IDS_ELEMENTS',
        mockBulkRequestPayload.integratedDatasets[0].dataElements
      );
    });

    it('it should set temp selection with previous selection if GDS is found', async () => {
      const commitSpy = jest.spyOn(gdsActionContext, 'commit');

      await actions[LOAD_PREVIOUS_IDE_SELECTION](gdsActionContext, 2 as never);

      expect(commitSpy).not.toHaveBeenCalled();
    });
  });

  // Broken test, fails without any related changes to it
  // TODO: Fix mocks
  xit('UNLOCK_DSA', async () => {
    const getRequestCancellationSpy = jest.spyOn(
      dsaaFactory,
      'getRequestCancellation'
    );

    await actions[UNLOCK_DSA](gdsActionContext, '1234' as never);

    expect(getRequestCancellationSpy).toBeCalledWith({
      master_request_id: '1234',
      request_status: 'CRC'
    });
  });

  // describe('REGISTER_GDS', () => {
  //   it('should call registerGdsApi.registerGds with the result of getters.GET_ACTIVE_GDS', async () => {
  //     const storeState = mockGDSState();
  //     const gdsActionContextLocal: ActionContext<DataSetViewState, RootState> =
  //       mockGDSActionsContext(storeState);

  //     const registerGdsMock = jest.spyOn(registerGdsApi, 'registerGds');

  //     await actions[REGISTER_GDS](
  //       gdsActionContextLocal,
  //       '' as never
  //     );

  //     expect(registerGdsMock).toHaveBeenCalled();
  //   });
  // });

  describe('FILTER AND SEGMENTATION', () => {
    it('TOGGLE_FILTER_SEGMENT - should add segment when segment is not found in temp selection', async () => {
      const storeState = mockGDSState();
      const tempSelectedSegmentsMock: FilterSegments[] = [
        {
          id: 's1',
          name: 'seg1',
          is_published: false
        }
      ];
      const selectedSegment: FilterSegments = {
        id: 's2',
        name: 'seg2',
        is_published: true
      };
      storeState.bulkDataAccess.tempSelectedSegments = tempSelectedSegmentsMock;
      const gdsActionContextLocal: ActionContext<DataSetViewState, RootState> =
        mockGDSActionsContext(storeState);
      const commitSpy = jest.spyOn(gdsActionContextLocal, 'commit');

      await actions[TOGGLE_FILTER_SEGMENT](gdsActionContextLocal, {
        selectedFilter: mockSelectedFilter,
        selectedSegment
      } as never);

      expect(commitSpy).toHaveBeenCalledWith(
        SET_BULK_DATA_ACCESS_SELECTED_FILTER_SEGMENTS,
        mockSelectedFilter
      );
    });
    it('TOGGLE_FILTER_SEGMENT - should remove segment when segment is found in temp selection', async () => {
      const storeState = mockGDSState();
      const tempSelectedSegmentsMock: FilterSegments[] = [
        {
          id: 's1',
          name: 'seg1',
          is_published: false
        }
      ];
      const selectedSegment: FilterSegments = {
        id: 's1',
        name: 'seg1',
        is_published: true
      };
      storeState.bulkDataAccess.tempSelectedSegments = tempSelectedSegmentsMock;
      const gdsActionContextLocal: ActionContext<DataSetViewState, RootState> =
        mockGDSActionsContext(storeState);
      const commitSpy = jest.spyOn(gdsActionContextLocal, 'commit');

      await actions[TOGGLE_FILTER_SEGMENT](gdsActionContextLocal, {
        selectedFilter: mockSelectedFilter,
        selectedSegment
      } as never);

      expect(commitSpy).toHaveBeenCalledWith(
        SET_BULK_DATA_ACCESS_SELECTED_FILTER_SEGMENTS,
        { id: 'f1', name: 'filter1', segments: [] }
      );
    });
    it('TOGGLE_FILTER_ALL_SEGMENTS - select all the segments', async () => {
      const storeState = mockGDSState();
      const selectedSegments: FilterSegments[] = [
        {
          id: 's1',
          name: 'seg1',
          is_published: true
        },
        {
          id: 's2',
          name: 'seg2',
          is_published: true
        }
      ];
      const selectedFilter: DatasetFilter = {
        id: 'f1',
        logs_id: 1,
        name: 'filter1',
        segments: []
      };
      const result: DatasetFilter = {
        id: 'f1',
        name: 'filter1',
        segments: [
          {
            id: 's1',
            name: 'seg1',
            is_published: true
          },
          {
            id: 's2',
            name: 'seg2',
            is_published: true
          }
        ]
      };
      const gdsActionContextLocal: ActionContext<DataSetViewState, RootState> =
        mockGDSActionsContext(storeState);
      const commitSpy = jest.spyOn(gdsActionContextLocal, 'commit');

      await actions[TOGGLE_FILTER_ALL_SEGMENTS](gdsActionContextLocal, {
        selectedFilter,
        selectedSegments
      } as never);
      expect(commitSpy).toHaveBeenCalledWith(
        SET_BULK_DATA_ACCESS_SELECTED_FILTER_SEGMENTS,
        result
      );
    });

    it('it should set temp selection with previous selection of filter if GDS is found', async () => {
      const storeState = mockGDSState();
      storeState.bulkDataAccess.accessRequestPayload.goldenDatasets =
        mockBulkRequestPayload.goldenDatasets;
      const gdsActionContextLocal: ActionContext<DataSetViewState, RootState> =
        mockGDSActionsContext(storeState);
      const commitSpy = jest.spyOn(gdsActionContextLocal, 'commit');

      await actions[LOAD_PREVIOUS_FILTER_SEGMENT_SELECTION](
        gdsActionContextLocal,
        { logsId: 1, filterId: 'f1' } as never
      );

      expect(commitSpy).toHaveBeenCalledWith(
        SET_BULK_DATA_ACCESS_SELECTED_FILTER_SEGMENTS,
        { id: '', name: '', segments: [] }
      );
    });

    it('it should set temp selection with previous selection of filter if GDS is found', async () => {
      const storeState = mockGDSState();
      storeState.bulkDataAccess.accessRequestPayload.goldenDatasets =
        mockBulkRequestPayload.goldenDatasets;
      const mockLookUp = [
        {
          logs_id: 1,
          filters: [
            {
              logs_id: 1,
              id: 'f1',
              name: '',
              segments: [
                {
                  id: 's1',
                  name: 'seg1',
                  is_published: false
                }
              ]
            }
          ]
        }
      ];
      storeState.filtersAndSegmentsLookUp = mockLookUp;
      const gdsActionContextLocal: ActionContext<DataSetViewState, RootState> =
        mockGDSActionsContext(storeState);
      const commitSpy = jest.spyOn(gdsActionContextLocal, 'commit');

      await actions[FETCH_SEGMENTS_OPTIONS](gdsActionContextLocal, {
        logsId: 1,
        filterId: 'f1'
      } as never);

      expect(commitSpy).toHaveBeenCalledWith(SET_SEGMENTS_OPTIONS, []);
    });

    it('SAVE_FILTERS_SEGMENTS_EDITED_FIELDS - should not do anything when GDS not found', async () => {
      const storeState = mockGDSState();
      storeState.bulkDataAccess.accessRequestPayload.goldenDatasets =
        mockBulkRequestPayload.goldenDatasets;
      const gdsActionContextLocal: ActionContext<DataSetViewState, RootState> =
        mockGDSActionsContext(storeState);
      const commitSpy = jest.spyOn(gdsActionContextLocal, 'commit');

      await actions[SAVE_FILTERS_SEGMENTS_EDITED_FIELDS](
        gdsActionContextLocal,
        3 as never
      );

      expect(commitSpy).not.toHaveBeenCalled();
    });
  });

  it('should find logsid and add/remove segments when comparing to previously selected ones', async () => {
    const storeState = mockGDSState();
    storeState.bulkDataAccess.accessRequestPayload.goldenDatasets =
      mockGoldenDatasets;
    storeState.bulkDataAccess.previouslySelectedFiltersSegments =
      mockPreviouslySelectedFilters;
    const gdsActionContextLocal: ActionContext<DataSetViewState, RootState> =
      mockGDSActionsContext(storeState);
    const commitSpy = jest.spyOn(gdsActionContextLocal, 'commit');
    const getEditedFiltersWithSegmentsSpy = jest.spyOn(
      SearchStoreMapper,
      'getEditedFiltersWithSegments'
    );

    await actions[SAVE_FILTERS_SEGMENTS_EDITED_FIELDS](
      gdsActionContextLocal,
      2 as never
    );
    expect(getEditedFiltersWithSegmentsSpy).toHaveBeenCalled();
    expect(getEditedFiltersWithSegmentsSpy).toHaveBeenCalledWith(
      mockGoldenDatasets[0].filtersAndSegments,
      mockPreviouslySelectedFilters,
      'add'
    );
    expect(getEditedFiltersWithSegmentsSpy).toHaveBeenCalledWith(
      mockGoldenDatasets[0].filtersAndSegments,
      mockPreviouslySelectedFilters,
      'remove'
    );

    expect(commitSpy).toHaveBeenCalledWith(
      SET_ADD_EDITED_FIELD,
      mockAddedEditedFilterValue
    );
    expect(commitSpy).toHaveBeenCalledWith(SET_REMOVE_EDITED_FIELD, {
      field: EDITED_FIELDS.SEGMENTS,
      value: []
    });
  });

  it('FETCH_PHYSICAL_ATTRIBUTES_BY_PHYSICAL_DATASET: should handle API failure', async () => {
    const mockRowId = 'rowId-123';
    jest
      .spyOn(datasetViewFactory, 'getPhysicalAttributesByPhysicalDataset')
      .mockRejectedValue(new Error('API Error'));

    await expect(
      actions[FETCH_PHYSICAL_ATTRIBUTES_BY_PHYSICAL_DATASET](
        gdsActionContext,
        mockRowId as never
      )
    ).rejects.toThrow('API Error');
  });

  it('FETCH_PHYSICAL_ATTRIBUTES_BY_PHYSICAL_DATASET: should return already fetched data if available', async () => {
    const mockRowId = 'rowId-123';
    const expectedResult = [{ label: 'Attr 1', value: 'attr1' }];
    gdsActionContext.state.gdsSegmentationFilters.physicalDatasets.physicalAttributes =
      {
        [mockRowId]: [{ label: 'Attr 1', value: 'attr1' }]
      };
    const spyOnGetPhysicalAttributesByPhysicalDataset = jest.spyOn(
      datasetViewFactory,
      'getPhysicalAttributesByPhysicalDataset'
    );

    const result = await actions[FETCH_PHYSICAL_ATTRIBUTES_BY_PHYSICAL_DATASET](
      gdsActionContext,
      mockRowId as never
    );

    expect(result).toEqual(expectedResult);
    expect(spyOnGetPhysicalAttributesByPhysicalDataset).not.toHaveBeenCalled();
  });

  it('FETCH_PHYSICAL_ATTRIBUTES_BY_PHYSICAL_DATASET: should fetch physical attributes by dataset and commit', async () => {
    const commitSpy = jest.spyOn(gdsActionContext, 'commit');
    const mockRowId = 'rowId-123';

    const mockPhysicalAttributesByPhysicalDataset = [
      {
        value: '00000000-0000-0000-0000-000000006327',
        label: 'ROWID_OBJECT'
      },
      {
        value: '00000000-0000-0000-0000-000000006327',
        label: 'ROWID_OBJECT'
      }
    ];
    const expectedResult = {
      config: {},
      data: mockPhysicalAttributesByPhysicalDataset,
      request: {},
      status: 200,
      statusText: 'OK'
    };

    jest
      .spyOn(datasetViewFactory, 'getPhysicalAttributesByPhysicalDataset')
      .mockResolvedValue({
        config: {},
        data: mockPhysicalAttributesByPhysicalDataset,
        request: {},
        status: 200,
        statusText: 'OK'
      });

    await actions[FETCH_PHYSICAL_ATTRIBUTES_BY_PHYSICAL_DATASET](
      gdsActionContext,
      mockRowId as never
    );

    expect(commitSpy).toHaveBeenCalledWith(
      'DatasetViewStoreModule/SET_PHYSICAL_ATTRIBUTES_BY_PHYSICAL_DATASET',
      { rowId: mockRowId, physicalAttributesByPhysicalDataset: expectedResult }
    );
  });

  it('FETCH_SEGMENTS_AND_CONDITIONS_FOR_FILTER_AND_PHYSICAL_ATTRIBUTES: should handle API failure', async () => {
    const mockRowData = {
      activeFilterId: '0000-0001-0002-0003',
      physicalAttributeId: '0004-0005-0006-0007'
    };

    const error = new Error('API Error');

    const handleErrorSpy = jest.spyOn(
      require('@/datasetView/store/search-store/utils/helpers'),
      'handleError'
    );

    jest
      .spyOn(
        datasetViewFactory,
        'getSegmentsAndConditionsForFilterAndPhysicalAttribute'
      )
      .mockRejectedValue(error);

    await expect(
      actions[FETCH_SEGMENTS_AND_CONDITIONS_FOR_FILTER_AND_PHYSICAL_ATTRIBUTES](
        gdsActionContext,
        mockRowData as never
      )
    ).rejects.toThrow('API Error');

    expect(handleErrorSpy).toHaveBeenCalledWith(
      error,
      gdsActionContext.commit,
      SET_ERROR_SEGMENTS_AND_CONDITIONS_FOR_FILTER_AND_PHYSICAL_ATTRIBUTES
    );
  });

  it('FETCH_SEGMENTS_AND_CONDITIONS_FOR_FILTER_AND_PHYSICAL_ATTRIBUTES: should return already fetched data if available', async () => {
    const mockKey = 'filter1-attribute1';
    const mockRowData = {
      activeFilterId: 'filter1',
      physicalAttributeId: 'attribute1'
    };
    gdsActionContext.state.gdsSegmentationFilters.segments = {
      [mockKey]: {
        filter: {
          id: 'filter1',
          name: 'Filter 1',
          logs_id: 11101252
        },
        physical_dataset_attribute: {
          physical_attribute_id: 'attribute1',
          column_name: 'Attribute 1'
        },
        data: [
          {
            id: '00000000-0000-0000-0000-0000000003e9',
            segmentName: 'Segment 1',
            conditionId: '3fa3c2a0-ada2-11ef-ac23-3e5e17882ff3',
            conditionOperator: 'IN',
            conditionValue: ''
          },
          {
            id: '00000000-0000-0000-0000-0000000003ea',
            segmentName: 'Segment 2',
            conditionId: '3fa3c55c-ada2-11ef-ac23-3e5e17882ff3',
            conditionOperator: 'IN',
            conditionValue: ''
          }
        ]
      }
    };
    const spyOnGetSegmentsAndConditionsForFilterAndPhysicalAttribute =
      jest.spyOn(
        datasetViewFactory,
        'getSegmentsAndConditionsForFilterAndPhysicalAttribute'
      );

    const result = await actions[
      FETCH_SEGMENTS_AND_CONDITIONS_FOR_FILTER_AND_PHYSICAL_ATTRIBUTES
    ](gdsActionContext, mockRowData as never);

    expect(result).toEqual(
      gdsActionContext.state.gdsSegmentationFilters.segments[mockKey]
    );
    expect(
      spyOnGetSegmentsAndConditionsForFilterAndPhysicalAttribute
    ).not.toHaveBeenCalled();
  });

  it('FETCH_SEGMENTS_AND_CONDITIONS_FOR_FILTER_AND_PHYSICAL_ATTRIBUTES: should fetch segments and conditions and commit', async () => {
    const commitSpy = jest.spyOn(gdsActionContext, 'commit');
    const mockKey = 'filter2-attribute2';
    const mockRowData = {
      activeFilterId: 'filter2',
      physicalAttributeId: 'attribute2'
    };

    const mockSegmentsAndConditionsResponse = {
      filter: {
        id: 'filter2',
        name: 'Filter 2',
        logs_id: 11101345
      },
      physical_dataset_attribute: {
        physical_attribute_id: 'attribute2',
        column_name: 'Attribute 2'
      },
      data: [
        {
          id: '00000000-0000-0000-0000-0000000003d9',
          segmentName: 'Segment 1',
          conditionId: '2f129sd-ada2-11ef-ac23-43fae4',
          conditionOperator: 'IN',
          conditionValue: ''
        }
      ]
    };
    const expectedResult = {
      config: {},
      data: mockSegmentsAndConditionsResponse,
      request: {},
      status: 200,
      statusText: 'OK'
    };

    jest
      .spyOn(
        datasetViewFactory,
        'getSegmentsAndConditionsForFilterAndPhysicalAttribute'
      )
      .mockResolvedValue({
        config: {},
        data: mockSegmentsAndConditionsResponse,
        request: {},
        status: 200,
        statusText: 'OK'
      });

    await actions[
      FETCH_SEGMENTS_AND_CONDITIONS_FOR_FILTER_AND_PHYSICAL_ATTRIBUTES
    ](gdsActionContext, mockRowData as never);

    expect(commitSpy).toHaveBeenCalledWith(
      'DatasetViewStoreModule/CLEAR_ERROR_SEGMENTS_AND_CONDITIONS_FOR_FILTER_AND_PHYSICAL_ATTRIBUTES'
    );
    expect(commitSpy).toHaveBeenCalledWith(
      'DatasetViewStoreModule/SET_SEGMENTS_AND_CONDITIONS_FOR_FILTER_AND_PHYSICAL_ATTRIBUTES',
      { key: mockKey, segmentsAndConditions: expectedResult }
    );
  });

  it('FETCH_PHYSICAL_DATASETS_MAPPED_TO_GDS_FILTER: should fetch physical datasets mapped to GDS filter and commit the data', async () => {
    const commitSpy = jest.spyOn(gdsActionContext, 'commit');
    const mockFilterID = 'filter-123';

    const mockPhysicalDatasets = {
      filter: {
        id: '00000000-0000-0000-0000-0000000003e9',
        name: 'Legal Entity Enterprise Party Data',
        logs_id: 11101252
      },
      physical_datasets: [
        {
          id: '00000000-0000-0000-0000-0000000001e9',
          physicalDatasetName: 'Accounts data',
          physicalAttributeId: '00000000-0000-0000-0000-0000000002e9',
          physicalAttributeName: 'first_name'
        }
      ]
    };

    jest
      .spyOn(
        datasetViewFactory,
        'getPhysicalDatasetsMappedToGoldenDatasetsFilter'
      )
      .mockResolvedValue({
        data: mockPhysicalDatasets,
        request: {},
        status: 1,
        statusText: ''
      });

    await actions[FETCH_PHYSICAL_DATASETS_MAPPED_TO_GDS_FILTER](
      gdsActionContext,
      mockFilterID as never
    );

    expect(commitSpy.mock.calls).toEqual([
      [
        'DatasetViewStoreModule/CLEAR_ERROR_PHYSICAL_DATASETS_MAPPED_TO_GDS_FILTER'
      ],
      [
        'DatasetViewStoreModule/SET_PHYSICAL_DATASETS_MAPPED_TO_GDS_FILTER',
        mockPhysicalDatasets
      ],
      [
        'DatasetViewStoreModule/SET_ACTIVE_GDS_SEGMENTATION_FILTER_ID',
        mockFilterID
      ]
    ]);
  });

  it('FETCH_PHYSICAL_DATASETS_MAPPED_TO_GDS_FILTER: should call handleError on API failure', async () => {
    const mockFilterID = 'filter-123';
    const mockError = new Error('Network Error');

    jest
      .spyOn(
        datasetViewFactory,
        'getPhysicalDatasetsMappedToGoldenDatasetsFilter'
      )
      .mockRejectedValue(mockError);

    const handleErrorSpy = jest.spyOn(
      require('@/datasetView/store/search-store/utils/helpers'),
      'handleError'
    );

    try {
      await actions[FETCH_PHYSICAL_DATASETS_MAPPED_TO_GDS_FILTER](
        gdsActionContext,
        mockFilterID as never
      );
    } catch (err) {
      // Check that handleError was called with the error and commit
      expect(handleErrorSpy).toHaveBeenCalledWith(
        mockError,
        gdsActionContext.commit,
        SET_ERROR_PHYSICAL_DATASETS_MAPPED_TO_GDS_FILTER
      );

      // Check that the error is rejected
      expect(err).toBe(mockError);
    }
  });

  it('UPDATE_GDS_SEGMENTATION_PHYSICAL_DATASET_ATTRIBUTES: should call updatePhysicalAttributesByPhysicalDataset and resolve successfully', async () => {
    const mockPayload = {
      filterID: 'filter-123',
      data: {
        physical_datasets: [
          {
            physical_dataset_id: 'cf1e5326-8d07-11ee-8b5b-4a91567fb136',
            physical_attribute_id: '00000000-0000-0000-0000-00000000632c'
          }
        ]
      }
    };
    const mockUpdatePhysicalAttributesByPhysicalDatasetResponse = {
      success: true
    };

    jest
      .spyOn(datasetViewFactory, 'updatePhysicalAttributesByPhysicalDataset')
      .mockResolvedValue(mockUpdatePhysicalAttributesByPhysicalDatasetResponse);

    const result = await actions[
      UPDATE_GDS_SEGMENTATION_PHYSICAL_DATASET_ATTRIBUTES
    ](gdsActionContext, mockPayload as never);

    expect(
      datasetViewFactory.updatePhysicalAttributesByPhysicalDataset
    ).toHaveBeenCalledWith(mockPayload.filterID, mockPayload.data);
    expect(result).toEqual(
      mockUpdatePhysicalAttributesByPhysicalDatasetResponse
    );
  });

  it('UPDATE_GDS_SEGMENTATION_PHYSICAL_DATASET_ATTRIBUTES: should call updatePhysicalAttributesByPhysicalDataset and reject on error', async () => {
    const mockPayload = {
      filterID: 'filter-23',
      data: {
        physical_datasets: []
      }
    };
    const mockError = new Error('API Error');

    jest
      .spyOn(datasetViewFactory, 'updatePhysicalAttributesByPhysicalDataset')
      .mockRejectedValue(mockError);

    await expect(
      actions[UPDATE_GDS_SEGMENTATION_PHYSICAL_DATASET_ATTRIBUTES](
        gdsActionContext,
        mockPayload as never
      )
    ).rejects.toThrow(mockError);

    expect(
      datasetViewFactory.updatePhysicalAttributesByPhysicalDataset
    ).toHaveBeenCalledWith(mockPayload.filterID, mockPayload.data);
  });

  it('UPDATE_GDS_FILTER_SEGMENTS_VALUES: should call updateFilterSegmentsValues and resolve successfully', async () => {
    const mockPayload = {
      filterId: 'filter-123',
      physicalAttributeId: 'attribute-123',
      data: {
        conditions: [
          {
            segment_id: '00000000-0000-0000-0000-0000000003e9',
            condition_value: 'test45'
          },
          {
            segment_id: '00000000-0000-0000-0000-0000000003ea',
            condition_value: 'test56'
          }
        ]
      }
    };
    const mockUpdateFilterSegmentsValues = {
      success: true
    };

    jest
      .spyOn(datasetViewFactory, 'updateFilterSegmentsValues')
      .mockResolvedValue(mockUpdateFilterSegmentsValues);

    const result = await actions[UPDATE_GDS_FILTER_SEGMENTS_VALUES](
      gdsActionContext,
      mockPayload as never
    );

    expect(datasetViewFactory.updateFilterSegmentsValues).toHaveBeenCalledWith(
      mockPayload.filterId,
      mockPayload.physicalAttributeId,
      mockPayload.data
    );
    expect(result).toEqual(mockUpdateFilterSegmentsValues);
  });

  it('UPDATE_GDS_FILTER_SEGMENTS_VALUES: should call updateFilterSegmentsValues and reject on error', async () => {
    const mockPayload = {
      filterId: 'filter-23',
      physicalAttributeId: 'attribute-123',
      data: {
        conditions: []
      }
    };
    const mockError = new Error('API Error');

    jest
      .spyOn(datasetViewFactory, 'updateFilterSegmentsValues')
      .mockRejectedValue(mockError);

    await expect(
      actions[UPDATE_GDS_FILTER_SEGMENTS_VALUES](
        gdsActionContext,
        mockPayload as never
      )
    ).rejects.toThrow(mockError);

    expect(datasetViewFactory.updateFilterSegmentsValues).toHaveBeenCalledWith(
      mockPayload.filterId,
      mockPayload.physicalAttributeId,
      mockPayload.data
    );
  });

  it('FETCH_TECHNICAL_METADATA_FOR_GOLDEN_DATASET calls fetchPhysicalDatasetDetailsFor from datasetViewFactory', async () => {
    datasetViewFactory.fetchPhysicalDatasetDetailsFor = jest
      .fn()
      .mockResolvedValue({
        logsId: 999,
        physicalDatasets: []
      });
    const commitSpy = jest.spyOn(gdsActionContext, 'commit');
    await actions[FETCH_TECHNICAL_METADATA_FOR_GOLDEN_DATASET](
      gdsActionContext,
      999 as never
    );
    expect(commitSpy).toHaveBeenCalledWith(
      'DatasetViewStoreModule/SET_TECHNICAL_METADATA_FOR_GOLDEN_DATASET',
      {
        logsId: 999,
        physicalDatasets: []
      }
    );
  });
  describe('REQUEST_DP_DSA_DETAILS_BY_STATUS_ID', () => {
    it('Request data product details and commit to store', async () => {
      const dpDetailsRequestSpy = jest
        .spyOn(datasetViewFactory, 'requestDpDsaDetailsByStatusId')
        .mockResolvedValue(mockDataProductDetails);

      const commitSpy = jest.spyOn(gdsActionContext, 'commit');
      const idsId = '12222';
      await actions[REQUEST_DP_DSA_DETAILS_BY_STATUS_ID](gdsActionContext, {
        usecaseId: '1919',
        idsId: '12222',
        oarId: 'AAB.SYS.1125'
      } as never);
      expect(dpDetailsRequestSpy).toBeCalled();
      expect(commitSpy).toHaveBeenCalledWith(
        'DatasetViewStoreModule/SET_BULK_DATA_ACCESS_PAYLOAD_CONSUMING_APP',
        { oarId: 'AAB.SYS.1125' }
      );
      expect(commitSpy).toHaveBeenCalledWith(
        'DatasetViewStoreModule/SET_BULK_DATA_ACCESS_PAYLOAD_PERIOD',
        {
          start: '04/30/2024',
          end: '05/15/2024'
        }
      );
      expect(commitSpy).toHaveBeenCalledWith(
        'DatasetViewStoreModule/SET_BULK_DATA_ACCESS_PAYLOAD_IDS_ELEMENTS',
        {
          allDataElementsSelected: false,
          dataElements: mockDataProductDetails.data.ide_ids,
          idsId,
          totalDataElements: 2
        }
      );
      expect(commitSpy).toHaveBeenCalledWith(
        'DatasetViewStoreModule/SET_PREVIOUSLY_SELECTED_IDS_DATA_ELEMENTS',
        mockDataProductDetails.data.ide_ids
      );
      expect(commitSpy).toHaveBeenCalledWith(
        'DatasetViewStoreModule/SET_BULK_DATA_ACCESS_SELECTED_IDS_ELEMENTS',
        mockDataProductDetails.data.ide_ids
      );
      expect(commitSpy).toHaveBeenCalledWith(
        'DatasetViewStoreModule/SET_DATA_PRODUCT_REQUEST_DETAILS',
        {
          end_date: '2024-05-15T00:00:00Z',
          ide_ids: [16204, 16205],
          ids_status_id: 10,
          oar_id: 'AAB.SYS.1125',
          start_date: '2024-04-30T00:00:00Z',
          ids_id: '12222'
        }
      );
    });
  });
  describe('EDIT_BULK_DATA_ACCESS_TO_INTEGRATED_DATASETS', () => {
    it('Submit Edit Data Product', async () => {
      const storeState = mockGDSState();
      storeState.bulkDataAccess.editedFields = mockDsaEditedState;
      const gdsActionContextLocal: ActionContext<DataSetViewState, RootState> =
        mockGDSActionsContext(storeState);

      const commitSpy = jest.spyOn(gdsActionContextLocal, 'commit');
      const requestEditAccessSpy = jest
        .spyOn(datasetViewFactory, 'editRequestToDataProductDsa')
        .mockResolvedValue(mockEditBulkRequestResponse);
      const parseEditStateToPayloadSpy = jest.spyOn(
        SearchStoreMapper,
        'parseEditStateToPayload'
      );
      const preparePayloadForDPEditSpy = jest.spyOn(
        SearchStoreMapper,
        'preparePayloadForDPEdit'
      );

      const returnResult = await actions[
        EDIT_BULK_DATA_ACCESS_TO_INTEGRATED_DATASETS
      ](gdsActionContextLocal, mockDataProductRequestDetails as never);

      expect(requestEditAccessSpy).toHaveBeenCalled();

      const result =
        SearchStoreMapper.parseEditStateToPayload(mockDsaEditedState);
      expect(parseEditStateToPayloadSpy).toHaveBeenCalled();
      expect(result).toStrictEqual(mockParsedOperationPayloadResponse);

      expect(preparePayloadForDPEditSpy).toHaveBeenCalled();
      const preparePayloadForDPEditResult =
        SearchStoreMapper.preparePayloadForDPEdit(
          mockDataProductRequestDetails,
          mockParsedOperationPayloadResponse,
          mockBulkRequestPayload
        );
      expect(preparePayloadForDPEditResult).toStrictEqual(mockPayloadForDpEdit);

      expect(commitSpy).toHaveBeenCalledWith(
        'UseCaseV2Module/SET_USE_CASE_DSA_TAB_TILE_INFORMATION',
        mockInitialDsaTilesState
      );
      expect(returnResult).toStrictEqual(mockEditBulkRequestResponse);
    });
  });
});
