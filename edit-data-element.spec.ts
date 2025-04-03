// Import dependencies import { shallowMount } from '@vue/test-utils'; import EditDataElement from '@/datasetView/components/gds-sidebar/components/edit-data-element.vue';

// Mock dependencies jest.mock('@utils', () => ({ debounce: jest.fn((fn) => fn), }));

// Describe test suite describe('EditDataElement.vue', () => { let wrapper;

beforeEach(() => { wrapper = shallowMount(EditDataElement); });

afterEach(() => { wrapper.unmount(); });

// Test case for onSuggestionSelected it('should handle onSuggestionSelected correctly', () => { const selectedItem = { name: '123 | Test Name' }; wrapper.vm.onSuggestionSelected(selectedItem); expect(wrapper.vm.linkageReferringId.value).toBe('123'); });

// Test case for onSearch describe('onSearch', () => { it('should set suggestionList to an empty array if searchKey is empty or too short', async () => { await wrapper.vm.onSearch(''); expect(wrapper.vm.suggestionList.value).toEqual([]); });

it('should fetch linkage referring elements when searchKey is valid', async () => {
  const mockResponse = [
    { data_element_id: '001', data_element_name: 'Element One' },
    { data_element_id: '002', data_element_name: 'Element Two' },
  ];

  wrapper.vm.GdsSidebarStorage = {
    fetchLinkageReferringElements: jest.fn().mockResolvedValue(),
    getLinkageReferringElements: jest.fn().mockReturnValue(mockResponse),
  };

  await wrapper.vm.onSearch('test');

  expect(wrapper.vm.suggestionList.value).toEqual([
    '001 | Element One',
    '002 | Element Two',
  ]);
});

}); });

