import EditGoldenDataElement from '@/datasetView/components/gds-sidebar/components/edit-data-element.vue';
import { GdsSidebarStorage } from '@/datasetView/components/gds-sidebar/storage/gds-sidebar.storage';
import { shallowMount } from '@vue/test-utils';
import { mockLinkedElement } from '../../../../datasetView/store/search-store/search.store.mock';
import { mockEditRequest } from '../../../../datasetView/store/gds-sidebar.store.mock';
import { GdsSidebarMapper } from '@/datasetView/components/gds-sidebar/mapper/gds-sidebar.mapper';
import { DropdownData, LinkedElement } from '@/datasetView/model';
import deepCopy from '@/common/utils/deepCopy';
import { EventBus } from '../../../../../../src/common/event-bus';
import useVuelidate from '@vuelidate/core';
import i18nMod from 'vue-i18n';
import Utils from '@/common/utilities';
import { gdsEditWorkflowUtil } from '@/datasetView/utilities/gdsEditWorkflow.utils';

let wrapper: any = null;

(Utils as any).debounce = jest.fn(async (fn: any) => {
  await fn();
  return 0;
});

jest.mock('@vuelidate/core');
(useVuelidate as jest.Mock).mockReturnValue({
  value: {
    gdeName: {
      required: {
        $invalid: false
      },
      unique: {
        $invalid: false
      }
    },
    gdeLifecycleStatus: {
      required: {
        $invalid: false
      }
    },
    collectionId: {
      required: {
        $invalid: false
      }
    },
    termId: {
      required: {
        $invalid: false
      }
    },
    $validationGroups: {
      allFieldsAreValid: {
        $invalid: false
      }
    }
  }
});

jest.spyOn(i18nMod, 'useI18n').mockReturnValue({
  t: (msg: string) => msg
} as any);

jest.mock('@/core/plugin', () => ({
  useStorage: jest.fn(() => ({
    features: {
      hasFeature: () => true
    },
    user: {
      corpId: 123,
      isIdsAdmin: true
    }
  })),
  useAnalytics: jest.fn(() => ({
    startTrackingEvent: () => jest.fn()
  }))
}));

jest
  .spyOn(GdsSidebarStorage, 'getActiveGoldenDataElement')
  .mockImplementation(jest.fn())
  .mockReturnValue(mockLinkedElement);
const setActiveGoldenDataElementSpy = jest
  .spyOn(GdsSidebarStorage, 'setActiveGoldenDataElement')
  .mockImplementation(jest.fn());
jest.spyOn(GdsSidebarStorage, 'storeEditedValue').mockImplementation(jest.fn());
jest
  .spyOn(GdsSidebarStorage, 'getEditRequest')
  .mockImplementation(jest.fn())
  .mockReturnValue(mockEditRequest());
jest.spyOn(GdsSidebarStorage, 'setEditRequest').mockImplementation(jest.fn());
jest.spyOn(GdsSidebarStorage, 'setActiveMode').mockImplementation(jest.fn());
jest.spyOn(GdsSidebarStorage, 'openSidebarFor').mockImplementation(jest.fn());
jest.spyOn(GdsSidebarStorage, 'isSidebarVisible').mockImplementation(jest.fn());

const createWrapper = (propsData = {}, hasFeatureValue: boolean = true) => {
  return shallowMount(EditGoldenDataElement, {
    global: {
      mocks: {
        $t: (msg: string) => msg,
        v$: {
          gdeName: {
            required: {
              $invalid: false
            },
            unique: {
              $invalid: false
            }
          },
          gdeLifecycleStatus: {
            required: {
              $invalid: false
            }
          },
          collectionId: {
            required: {
              $invalid: false
            }
          },
          termId: {
            required: {
              $invalid: false
            }
          },
          $validationGroups: {
            allFieldsAreValid: {
              $invalid: false
            }
          }
        }
      }
    },
    props: propsData
  });
};

const createCustomWrapper = (customProps: any) => {
  return shallowMount(EditGoldenDataElement, customProps);
};

afterEach(() => {
  jest.clearAllMocks();
  wrapper.unmount();
});

describe('edit-data-element.vue', () => {
  it('toggleToDropDownMapper calls other methods correctly', async () => {
    const isCheckedToDropDownMapperSpy = jest.spyOn(
      GdsSidebarMapper,
      'isCheckedToDropDownMapper'
    );
    wrapper = createWrapper({});
    await wrapper.vm.toggleToDropDownMapper(true, 'test-prop-name');
    expect(isCheckedToDropDownMapperSpy).toBeCalledWith(true);
    expect(wrapper).toBeDefined();
  });

  it('toggleToDropDownMapper calls other methods correctly for sourcing V2', async () => {
    const storeEditedValueSpy = jest
      .spyOn(GdsSidebarStorage, 'storeEditedValue')
      .mockImplementation(jest.fn());
    wrapper = createWrapper({});

    await wrapper.vm.updateElementWhenNoReferElement();
    expect(storeEditedValueSpy).toBeCalledWith({
      referring_element_id: null,
      purpose_referring: null
    });
  });

  it('toggleToDropDownMapper calls other methods with errors', async () => {
    const errorObj = new Error('error');
    wrapper = createWrapper({});

    jest
      .spyOn(GdsSidebarStorage, 'saveGoldenDataSet')
      .mockImplementation(jest.fn())
      .mockRejectedValue(errorObj);

    const emitActionFeedbackEventSpy = jest.spyOn(
      EventBus,
      'emitActionFeedbackEvent'
    );

    try {
      await wrapper.vm.toggleToDropDownMapper(true, 'test-prop-name');
    } catch (error) {
      expect(error).toStrictEqual(errorObj);
      expect(wrapper).toBeDefined();
      expect(emitActionFeedbackEventSpy).toBeCalled();
    }
  });

  it('dataElementOptionChanged calls other methods', async () => {
    const saveGoldenDataSetSpy = jest
      .spyOn(GdsSidebarStorage, 'saveGoldenDataSet')
      .mockResolvedValue();

    wrapper = createWrapper();

    await wrapper.vm.dataElementOptionChanged({ value: 1 }, 'propName');

    expect(saveGoldenDataSetSpy).toBeCalled();
  });

  it('autoSave calls other methods with errors 1', async () => {
    (useVuelidate as jest.Mock).mockReturnValue({
      value: {
        gdeName: {
          required: {
            $invalid: false
          },
          unique: {
            $invalid: false
          }
        },
        gdeLifecycleStatus: {
          required: {
            $invalid: false
          }
        },
        collectionId: {
          required: {
            $invalid: false
          }
        },
        termId: {
          required: {
            $invalid: false
          }
        },
        $validationGroups: {
          allFieldsAreValid: {
            $invalid: true
          }
        }
      }
    });
    wrapper = createCustomWrapper({
      global: {
        mocks: {
          $t: (msg: string) => msg,
          $analytics: {
            startTrackingEvent: () => jest.fn()
          },
          v$: {
            gdeName: {
              required: {
                $invalid: false
              },
              unique: {
                $invalid: false
              }
            },
            gdeLifecycleStatus: {
              required: {
                $invalid: false
              }
            },
            collectionId: {
              required: {
                $invalid: false
              }
            },
            termId: {
              required: {
                $invalid: false
              }
            },
            $validationGroups: {
              allFieldsAreValid: {
                $invalid: true
              }
            }
          }
        }
      }
    });

    const mapDataElementsToWorkflowSpy = jest
      .spyOn(GdsSidebarMapper, 'mapDataElementsToWorkflow')
      .mockImplementation(jest.fn());
    const saveGoldenDataSetSpy = jest
      .spyOn(GdsSidebarStorage, 'saveGoldenDataSet')
      .mockImplementation(jest.fn());
    jest
      .spyOn(EventBus, 'emitActionFeedbackEvent')
      .mockImplementation(jest.fn());
    const errorSpy = jest
      .spyOn(EventBus, 'emitActionFeedbackEvent')
      .mockImplementation(jest.fn());

    await wrapper.vm.autoSave();

    expect(mapDataElementsToWorkflowSpy).not.toBeCalled();
    expect(saveGoldenDataSetSpy).not.toBeCalled();
    expect(errorSpy).not.toBeCalled();
  });

  it('autoSave calls other methods with errors 2', async () => {
    (useVuelidate as jest.Mock).mockReturnValue({
      value: {
        gdeName: {
          required: {
            $invalid: false
          },
          unique: {
            $invalid: false
          }
        },
        gdeLifecycleStatus: {
          required: {
            $invalid: false
          }
        },
        collectionId: {
          required: {
            $invalid: false
          }
        },
        termId: {
          required: {
            $invalid: false
          }
        },
        $validationGroups: {
          allFieldsAreValid: {
            $invalid: false
          }
        }
      }
    });
    wrapper = createCustomWrapper({
      global: {
        mocks: {
          $t: (msg: string) => msg,
          v$: {
            gdeName: {
              required: {
                $invalid: false
              },
              unique: {
                $invalid: false
              }
            },
            gdeLifecycleStatus: {
              required: {
                $invalid: false
              }
            },
            collectionId: {
              required: {
                $invalid: false
              }
            },
            termId: {
              required: {
                $invalid: false
              }
            },
            $validationGroups: {
              allFieldsAreValid: {
                $invalid: false
              }
            }
          }
        }
      }
    });

    const mapDataElementsToWorkflowSpy = jest
      .spyOn(GdsSidebarMapper, 'mapDataElementsToWorkflow')
      .mockImplementation(jest.fn());
    const saveGoldenDataSetSpy = jest
      .spyOn(GdsSidebarStorage, 'saveGoldenDataSet')
      .mockImplementation(jest.fn())
      .mockRejectedValue(null as never);
    jest
      .spyOn(EventBus, 'emitActionFeedbackEvent')
      .mockImplementation(jest.fn());
    const errorSpy = jest
      .spyOn(EventBus, 'emitActionFeedbackEvent')
      .mockImplementation(jest.fn());

    await wrapper.vm.autoSave();

    expect(mapDataElementsToWorkflowSpy).toBeCalled();
    expect(saveGoldenDataSetSpy).toBeCalled();
    expect(errorSpy).toBeCalled();
  });

  it('autoSave calls other methods with success 3', async () => {
    (useVuelidate as jest.Mock).mockReturnValue({
      value: {
        gdeName: {
          required: {
            $invalid: false
          },
          unique: {
            $invalid: false
          }
        },
        gdeLifecycleStatus: {
          required: {
            $invalid: false
          }
        },
        collectionId: {
          required: {
            $invalid: false
          }
        },
        termId: {
          required: {
            $invalid: false
          }
        },
        $validationGroups: {
          allFieldsAreValid: {
            $invalid: false
          }
        }
      }
    });
    wrapper = createCustomWrapper({
      global: {
        mocks: {
          $t: (msg: string) => msg,
          v$: {
            gdeName: {
              required: {
                $invalid: false
              },
              unique: {
                $invalid: false
              }
            },
            gdeLifecycleStatus: {
              required: {
                $invalid: false
              }
            },
            collectionId: {
              required: {
                $invalid: false
              }
            },
            termId: {
              required: {
                $invalid: false
              }
            },
            $validationGroups: {
              allFieldsAreValid: {
                $invalid: false
              }
            }
          }
        }
      }
    });

    const mapDataElementsToWorkflowSpy = jest
      .spyOn(GdsSidebarMapper, 'mapDataElementsToWorkflow')
      .mockImplementation(jest.fn());
    const saveGoldenDataSetSpy = jest
      .spyOn(GdsSidebarStorage, 'saveGoldenDataSet')
      .mockImplementation(jest.fn())
      .mockResolvedValue(true as never);
    jest
      .spyOn(EventBus, 'emitActionFeedbackEvent')
      .mockImplementation(jest.fn());
    const errorSpy = jest
      .spyOn(EventBus, 'emitActionFeedbackEvent')
      .mockImplementation(jest.fn());

    await wrapper.vm.autoSave();

    expect(mapDataElementsToWorkflowSpy).toBeCalled();
    expect(saveGoldenDataSetSpy).toBeCalled();
    expect(errorSpy).not.toBeCalled();
  });

  it('inlineEditInputChange calls other methods correctly', async () => {
    const mockLinkedElementCopy = deepCopy(mockLinkedElement);
    mockLinkedElementCopy.data_element_id = 0;
    const saveGoldenDataSetSpy = jest.spyOn(
      GdsSidebarStorage,
      'saveGoldenDataSet'
    );
    jest
      .spyOn(gdsEditWorkflowUtil, 'prepareEditData')
      .mockImplementationOnce(jest.fn());
    jest
      .spyOn(GdsSidebarStorage, 'getActiveGoldenDataElement')
      .mockReturnValue(mockLinkedElementCopy);
    wrapper = createWrapper({});
    await wrapper.vm.inlineEditInputChange(true, 'test-prop-name');
    expect(saveGoldenDataSetSpy).toHaveBeenCalled();
  });

  it('inlineEditSetActiveGDE sets the correct active GDE when active Gde is not the same', async () => {
    jest.useFakeTimers();
    const prepareEditDataSpy = jest
      .spyOn(gdsEditWorkflowUtil, 'prepareEditData')
      .mockImplementationOnce(jest.fn());
    const mockLinkedElementCopy = deepCopy(mockLinkedElement);
    mockLinkedElementCopy.data_element_id = 4444;
    jest
      .spyOn(GdsSidebarStorage, 'getActiveGoldenDataElement')
      .mockImplementation(jest.fn())
      .mockReturnValue(mockLinkedElementCopy);
    wrapper = createWrapper({
      gdeInlineEdit: true,
      goldenDataElement: mockLinkedElement
    });
    wrapper.vm.inlineEditSetActiveGDE();
    expect(prepareEditDataSpy).toHaveBeenCalled();
    jest.useRealTimers();
  });

  it('inlineEditSetActiveGDE sets the correct active GDE when active Gde is the same', async () => {
    jest
      .spyOn(GdsSidebarStorage, 'getActiveGoldenDataElement')
      .mockImplementation(jest.fn())
      .mockReturnValue(mockLinkedElement);
    wrapper = createWrapper({
      gdeInlineEdit: true,
      goldenDataElement: mockLinkedElement
    });
    const setActiveGdeSpy = jest
      .spyOn(wrapper.vm, 'setActiveGde')
      .mockImplementation(jest.fn());
    wrapper.vm.inlineEditSetActiveGDE();
    expect(setActiveGdeSpy).not.toBeCalled();
  });

  it('inlineEditSetActiveGDE sets the correct active GDE when active Gde unknown', async () => {
    const prepareEditDataSpy = jest
      .spyOn(gdsEditWorkflowUtil, 'prepareEditData')
      .mockImplementationOnce(jest.fn());
    jest
      .spyOn(GdsSidebarStorage, 'getActiveGoldenDataElement')
      .mockImplementation(jest.fn())
      .mockReturnValue({} as LinkedElement);
    wrapper = createWrapper({
      gdeInlineEdit: true,
      goldenDataElement: mockLinkedElement
    });
    wrapper.vm.inlineEditSetActiveGDE();
    expect(prepareEditDataSpy).toHaveBeenCalled();
  });

  it('inlineDataElementOptionChanged calls other methods correctly', async () => {
    const saveGoldenDataSetSpy = jest
      .spyOn(GdsSidebarStorage, 'saveGoldenDataSet')
      .mockResolvedValue();
    jest
      .spyOn(gdsEditWorkflowUtil, 'prepareEditData')
      .mockImplementationOnce(jest.fn());
    const dropDownDataMock: DropdownData = {
      isSelected: false,
      label: 'In Use [Temporary solution]',
      value: 'In Use [Temporary solution]'
    };
    wrapper = createWrapper({
      gdeInlineEdit: true,
      goldenDataElement: mockLinkedElement
    });

    await wrapper.vm.inlineDataElementOptionChanged(
      dropDownDataMock,
      'test-prop-name'
    );
    expect(saveGoldenDataSetSpy).toBeCalled();
  });

  it('updateAlexComponentInline calls other methods correctly', async () => {
    const saveGoldenDatasetSpy = jest
      .spyOn(GdsSidebarStorage, 'saveGoldenDataSet')
      .mockImplementation(jest.fn());
    jest
      .spyOn(gdsEditWorkflowUtil, 'prepareEditData')
      .mockImplementationOnce(jest.fn());
    wrapper = createWrapper({
      gdeInlineEdit: true,
      goldenDataElement: mockLinkedElement
    });

    await wrapper.vm.updateAlexComponentInline(
      'test-property',
      'test-prop-name'
    );

    expect(saveGoldenDatasetSpy).toHaveBeenCalled();
  });

  it('Method: editLinkage', async () => {
    jest.useFakeTimers();
    jest
      .spyOn(GdsSidebarStorage, 'getInitialElementAttribute')
      .mockReturnValue(mockLinkedElement);
    jest
      .spyOn(GdsSidebarStorage, 'setDefaultGoldenDataElement')
      .mockImplementation(jest.fn());
    wrapper = createWrapper({
      gdeInlineEdit: true,
      goldenDataElement: {
        ...mockLinkedElement,
        data_element_id: 124
      }
    });
    wrapper.vm.editLinkage();
    jest.advanceTimersByTime(1);
    expect(setActiveGoldenDataElementSpy).toHaveBeenCalled();
    jest.useRealTimers();
  });

  it('Method: editLinkage close already open sidebar', async () => {
    jest.useFakeTimers();
    jest.spyOn(global, 'setTimeout').mockImplementation(jest.fn());

    wrapper = createWrapper({
      gdeInlineEdit: true,
      goldenDataElement: mockLinkedElement
    });

    jest
      .spyOn(GdsSidebarStorage, 'isSidebarVisible')
      .mockImplementation(jest.fn())
      .mockReturnValue(true);
    const closeSidebarSpy = jest
      .spyOn(GdsSidebarStorage, 'closeSidebar')
      .mockImplementation(jest.fn());

    wrapper.vm.editLinkage();
    expect(closeSidebarSpy).toBeCalled();
  });

  it('should send data to parent on checkbox selection', async () => {
    wrapper = createWrapper({
      gdeInlineEdit: true,
      goldenDataElement: mockLinkedElement,
      selectedCheckbox: false
    });
    wrapper.vm.checkData();
    expect(wrapper.vm.selectedCheckbox).toBeTruthy();
  });

  it('revertChanges should throw error', async () => {
    wrapper = createWrapper({
      gdeInlineEdit: true,
      goldenDataElement: mockLinkedElement,
      selectedCheckbox: false
    });
    const emitActionFeedbackEventSpy = jest.spyOn(
      EventBus,
      'emitActionFeedbackEvent'
    );

    jest
      .spyOn(GdsSidebarStorage, 'setEditRequest')
      .mockImplementation(jest.fn())
      .mockRejectedValue(new Error('some error') as never);

    await wrapper.vm.revertChanges();

    expect(emitActionFeedbackEventSpy).toBeCalled();
    expect(wrapper.vm.autosaving).toBeFalsy();
  });

  it('saveAndClose should throw error', async () => {
    wrapper = createWrapper({
      gdeInlineEdit: true,
      goldenDataElement: mockLinkedElement,
      selectedCheckbox: false
    });
    const emitActionFeedbackEventSpy = jest.spyOn(
      EventBus,
      'emitActionFeedbackEvent'
    );

    jest
      .spyOn(GdsSidebarStorage, 'saveGoldenDataSet')
      .mockImplementation(jest.fn())
      .mockRejectedValue(new Error('some error') as never);
    const closeSidebarSpy = jest
      .spyOn(GdsSidebarStorage, 'closeSidebar')
      .mockImplementation(jest.fn())
      .mockRejectedValue(new Error('some error') as never);

    await wrapper.vm.saveAndClose();

    expect(emitActionFeedbackEventSpy).toBeCalled();
    expect(closeSidebarSpy).not.toBeCalled();
    expect(wrapper.vm.autosaving).toBeFalsy();
  });

  it('dataElementInputChanged function call saves information to Golden dataset', async () => {
    jest.useFakeTimers();
    const saveGoldenDataSetSpy = jest
      .spyOn(GdsSidebarStorage, 'saveGoldenDataSet')
      .mockImplementation(jest.fn());

    wrapper = createWrapper({
      gdeInlineEdit: true,
      goldenDataElement: mockLinkedElement,
      selectedCheckbox: false
    });

    wrapper.vm.dataElementInputChanged();
    expect(saveGoldenDataSetSpy).toHaveBeenCalled();
  });

  it('updateElementWhenNoReferElement method stores edited value to store', async () => {
    const storeEditedValueSpy = jest
      .spyOn(GdsSidebarStorage, 'storeEditedValue')
      .mockImplementation(jest.fn());
    wrapper.vm.updateElementWhenNoReferElement();
    expect(storeEditedValueSpy).toHaveBeenCalled();
  });

  it('should call onSearch when input changes', async () => {
    const wrapper = shallowMount(EditGoldenDataElement);
    const input = wrapper.find('input');
  
    await input.setValue('test');
    
    expect(wrapper.emitted('onSearch')).toBeTruthy();
    expect(wrapper.emitted('onSearch')?.[0]).toEqual(['test']);
  });
  
  it('should call onSuggestionSelected when a suggestion is clicked', async () => {
    const wrapper = shallowMount(EditGoldenDataElement, {
      data() {
        return {
          suggestions: ['00789 | Suggestion1', '00790 | Suggestion2']
        };
      }
    });
  
    const suggestion = wrapper.find('.suggestion-item'); // Ensure this matches your actual class
    await suggestion.trigger('click');
  
    expect(wrapper.emitted('onSuggestionSelected')).toBeTruthy();
    expect(wrapper.emitted('onSuggestionSelected')?.[0]).toEqual(['00789 | Suggestion1']);
  });
  
 
});
