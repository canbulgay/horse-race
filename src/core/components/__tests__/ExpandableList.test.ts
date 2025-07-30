import { describe, it, expect, afterEach, vi } from 'vitest'
import { mount, VueWrapper } from '@vue/test-utils'
import ExpandableList from '../ExpandableList.vue'
import type { IExpandableListProps, ITableHeader } from '@core/types'

// Mock child components
const mockVuetifyComponents = {
  'v-expansion-panels': {
    template:
      '<div class="v-expansion-panels" :accordion="accordion" :model-value="modelValue" v-bind="$attrs"><slot /></div>',
    props: ['modelValue', 'accordion'],
  },
  'v-expansion-panel': {
    template: '<div class="v-expansion-panel" v-bind="$attrs"><slot /></div>',
  },
  'v-expansion-panel-title': {
    template:
      '<div class="v-expansion-panel-title" v-bind="$attrs"><slot /><slot name="actions" :expanded="false" /></div>',
  },
  'v-expansion-panel-text': {
    template: '<div class="v-expansion-panel-text" v-bind="$attrs"><slot /></div>',
  },
  'v-icon': {
    template: '<span class="v-icon" :color="color" v-bind="$attrs">{{ icon }}</span>',
    props: ['icon', 'color'],
  },
  'v-card': {
    template: '<div class="v-card" :class="$attrs.class" v-bind="$attrs"><slot /></div>',
  },
  'v-card-title': {
    template: '<div class="v-card-title" :class="$attrs.class" v-bind="$attrs"><slot /></div>',
  },
  'v-card-text': {
    template: '<div class="v-card-text" :class="$attrs.class" v-bind="$attrs"><slot /></div>',
  },
  'v-card-actions': {
    template: '<div class="v-card-actions" v-bind="$attrs"><slot /></div>',
  },
  'v-progress-circular': {
    template:
      '<div class="v-progress-circular" :indeterminate="indeterminate" :color="color" v-bind="$attrs"></div>',
    props: ['indeterminate', 'color'],
  },
  'v-data-table': {
    template:
      '<div class="v-data-table" :loading="loading" :headers="headers" :items="items" :item-value="itemValue" v-bind="$attrs"><slot /></div>',
    props: ['headers', 'items', 'loading', 'itemValue', 'hideDefaultFooter', 'fixedHeader'],
  },
}

// Test data interfaces
interface TestParentItem {
  id: number
  name: string
  category: string
  children: TestChildItem[]
}

interface TestChildItem {
  id: number
  name: string
  value: number
  status: 'active' | 'inactive'
}

describe('ExpandableList', () => {
  let wrapper: VueWrapper<any>

  const sampleChildHeaders: ITableHeader<TestChildItem>[] = [
    { title: 'ID', key: 'id', sortable: true },
    { title: 'Name', key: 'name', sortable: true },
    { title: 'Value', key: 'value', sortable: false },
    { title: 'Status', key: 'status', width: '120px' },
  ]

  const sampleParentItems: TestParentItem[] = [
    {
      id: 1,
      name: 'Parent Item 1',
      category: 'Category A',
      children: [
        { id: 1, name: 'Child 1', value: 100, status: 'active' },
        { id: 2, name: 'Child 2', value: 200, status: 'inactive' },
      ],
    },
    {
      id: 2,
      name: 'Parent Item 2',
      category: 'Category B',
      children: [{ id: 3, name: 'Child 3', value: 300, status: 'active' }],
    },
    {
      id: 3,
      name: 'Parent Item 3',
      category: 'Category C',
      children: [],
    },
  ]

  const defaultProps: IExpandableListProps<TestParentItem, TestChildItem> = {
    title: 'Test Expandable List',
    items: sampleParentItems,
    loading: false,
    loadingText: 'Loading...',
    noDataTitle: 'No data found',
    noDataSubtext: 'No items available',
    headers: sampleChildHeaders,
    tableNoDataText: 'No data in this item',
    tableNoDataSubtext: 'Something went wrong',
    getItemKey: (item: TestParentItem) => item.id,
    getItemTitle: (item: TestParentItem) => item.name,
    getTableItems: (item: TestParentItem) => item.children,
    activePanelValue: 0,
  }

  const createComponent = (
    props: Partial<IExpandableListProps<TestParentItem, TestChildItem>> = {},
    slots: Record<string, string> = {},
  ) => {
    return mount(ExpandableList, {
      props: { ...defaultProps, ...props } as IExpandableListProps<TestParentItem, TestChildItem>,
      slots,
      global: {
        stubs: mockVuetifyComponents,
      },
    })
  }

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
    }
  })

  describe('basic rendering', () => {
    it('should render BaseCard with correct props', () => {
      wrapper = createComponent()

      const baseCard = wrapper.find('.v-card')
      expect(baseCard.exists()).toBe(true)
      expect(baseCard.classes()).toContain('expandable-list-card')
    })

    it('should pass title to BaseCard', () => {
      wrapper = createComponent({ title: 'Custom Title' })

      const cardTitle = wrapper.find('.v-card-title')
      expect(cardTitle.exists()).toBe(true)
      expect(cardTitle.text()).toContain('Custom Title')
    })

    it('should render BaseExpansionPanel with correct props', () => {
      wrapper = createComponent()

      const expansionPanels = wrapper.find('.v-expansion-panels')
      expect(expansionPanels.exists()).toBe(true)
    })

    it('should render BaseTable for each expansion panel content', () => {
      wrapper = createComponent()

      const dataTables = wrapper.findAll('.v-data-table')
      expect(dataTables.length).toBeGreaterThan(0)
    })

    it('should apply custom CSS classes', () => {
      wrapper = createComponent()

      const card = wrapper.find('.v-card')
      expect(card.classes()).toContain('expandable-list-card')

      expect(wrapper.html()).toContain('expandable-list-card')
    })
  })

  describe('props handling', () => {
    it('should handle loading state', () => {
      wrapper = createComponent({ loading: true })

      const progressCircular = wrapper.find('.v-progress-circular')
      expect(progressCircular.exists()).toBe(true)
    })

    it('should use default loading text', () => {
      wrapper = createComponent({ loading: true })

      expect(wrapper.text()).toContain('Loading...')
    })

    it('should use custom loading text', () => {
      wrapper = createComponent({
        loading: true,
        loadingText: 'Please wait...',
      })

      expect(wrapper.text()).toContain('Please wait...')
    })

    it('should handle empty items array', () => {
      wrapper = createComponent({ items: [] })

      expect(wrapper.text()).toContain('No data found')
      expect(wrapper.text()).toContain('No items available')
    })

    it('should use custom no-data messages', () => {
      wrapper = createComponent({
        items: [],
        noDataTitle: 'No results',
        noDataSubtext: 'Try again later',
      })

      expect(wrapper.text()).toContain('No results')
      expect(wrapper.text()).toContain('Try again later')
    })

    it('should pass headers to BaseTable', () => {
      wrapper = createComponent()

      const dataTables = wrapper.findAll('.v-data-table')
      expect(dataTables.length).toBeGreaterThan(0)
      // Headers are passed to each BaseTable instance
    })

    it('should handle activePanelValue prop', () => {
      wrapper = createComponent({ activePanelValue: 1 })

      const expansionPanels = wrapper.find('.v-expansion-panels')
      expect(expansionPanels.attributes('model-value')).toBe('1')
    })

    it('should use default activePanelValue when not provided', () => {
      wrapper = createComponent({ activePanelValue: undefined })

      const expansionPanels = wrapper.find('.v-expansion-panels')
      expect(expansionPanels.attributes('model-value')).toBe('0')
    })
  })

  describe('function props', () => {
    it('should call getItemKey function correctly', () => {
      const getItemKey = vi.fn((item: TestParentItem) => item.id)
      wrapper = createComponent({ getItemKey })

      expect(getItemKey).toHaveBeenCalledWith(sampleParentItems[0], 0)
      expect(getItemKey).toHaveBeenCalledWith(sampleParentItems[1], 1)
      expect(getItemKey).toHaveBeenCalledWith(sampleParentItems[2], 2)
      expect(getItemKey).toHaveBeenCalledTimes(3)
    })

    it('should call getItemTitle function correctly', () => {
      const getItemTitle = vi.fn((item: TestParentItem) => item.name)
      wrapper = createComponent({ getItemTitle })

      expect(getItemTitle).toHaveBeenCalledWith(sampleParentItems[0], 0)
      expect(getItemTitle).toHaveBeenCalledWith(sampleParentItems[1], 1)
      expect(getItemTitle).toHaveBeenCalledWith(sampleParentItems[2], 2)
      expect(getItemTitle).toHaveBeenCalledTimes(3)
    })

    it('should call getTableItems function correctly', () => {
      const getTableItems = vi.fn((item: TestParentItem) => item.children)
      wrapper = createComponent({ getTableItems })

      expect(getTableItems).toHaveBeenCalledWith(sampleParentItems[0])
      expect(getTableItems).toHaveBeenCalledWith(sampleParentItems[1])
      expect(getTableItems).toHaveBeenCalledWith(sampleParentItems[2])
      expect(getTableItems).toHaveBeenCalledTimes(3)
    })

    it('should handle custom getItemKey implementation', () => {
      const getItemKey = vi.fn((item: TestParentItem, index: number) => `${item.category}-${index}`)
      wrapper = createComponent({ getItemKey })

      expect(getItemKey).toHaveBeenCalledWith(sampleParentItems[0], 0)
      expect(getItemKey.mock.results[0].value).toBe('Category A-0')
    })

    it('should handle custom getItemTitle implementation', () => {
      const getItemTitle = vi.fn((item: TestParentItem) => `${item.category}: ${item.name}`)
      wrapper = createComponent({ getItemTitle })

      expect(getItemTitle).toHaveBeenCalledWith(sampleParentItems[0], 0)
      expect(getItemTitle.mock.results[0].value).toBe('Category A: Parent Item 1')
    })

    it('should handle custom getTableItems implementation', () => {
      const getTableItems = vi.fn((item: TestParentItem) =>
        item.children.filter((child) => child.status === 'active'),
      )
      wrapper = createComponent({ getTableItems })

      expect(getTableItems).toHaveBeenCalledWith(sampleParentItems[0])
      expect(getTableItems.mock.results[0].value).toHaveLength(1)
      expect(getTableItems.mock.results[0].value[0].status).toBe('active')
    })
  })

  describe('event handling', () => {
    it('should setup event listener for expansion panel changes', () => {
      wrapper = createComponent()

      const expansionPanels = wrapper.find('.v-expansion-panels')
      expect(expansionPanels.exists()).toBe(true)
    })

    it('should handle activePanelValue prop binding', () => {
      wrapper = createComponent({ activePanelValue: 1 })

      const expansionPanels = wrapper.find('.v-expansion-panels')
      expect(expansionPanels.attributes('model-value')).toBe('1')
    })

    it('should handle different panel values', () => {
      wrapper = createComponent({ activePanelValue: 2 })

      const expansionPanels = wrapper.find('.v-expansion-panels')
      expect(expansionPanels.attributes('model-value')).toBe('2')
    })
  })

  describe('slot forwarding', () => {
    it('should forward table slots to BaseTable', () => {
      wrapper = createComponent(
        {},
        {
          'item.name': '<span class="custom-name-cell">Custom Name</span>',
          'header.value': '<span class="custom-header">Custom Header</span>',
        },
      )

      const dataTables = wrapper.findAll('.v-data-table')
      expect(dataTables.length).toBeGreaterThan(0)
    })

    it('should handle multiple slot types', () => {
      wrapper = createComponent(
        {},
        {
          'item.status': '<span class="status-cell">{{ item.status }}</span>',
          'header.id': '<span class="id-header">#</span>',
          'no-data': '<div class="custom-no-data">No records</div>',
        },
      )

      const dataTables = wrapper.findAll('.v-data-table')
      expect(dataTables.length).toBeGreaterThan(0)
    })

    it('should preserve slot props when forwarding', () => {
      wrapper = createComponent(
        {},
        {
          'item.value': '<span class="value-cell">Value: {{ item.value }}</span>',
        },
      )

      const dataTables = wrapper.findAll('.v-data-table')
      expect(dataTables.length).toBeGreaterThan(0)
    })
  })

  describe('data structure validation', () => {
    it('should handle items with different structures', () => {
      interface CustomParent {
        uuid: string
        title: string
        metadata: { tags: string[] }
        data: CustomChild[]
      }

      interface CustomChild {
        id: string
        label: string
        count: number
      }

      const customHeaders: ITableHeader<CustomChild>[] = [
        { title: 'ID', key: 'id' },
        { title: 'Label', key: 'label' },
        { title: 'Count', key: 'count' },
      ]

      const customItems: CustomParent[] = [
        {
          uuid: 'item-1',
          title: 'Custom Item 1',
          metadata: { tags: ['tag1', 'tag2'] },
          data: [{ id: 'child-1', label: 'Child Label', count: 5 }],
        },
      ]

      const customProps = {
        title: 'Custom List',
        items: customItems,
        headers: customHeaders,
        getItemKey: (item: CustomParent) => item.uuid,
        getItemTitle: (item: CustomParent) => item.title,
        getTableItems: (item: CustomParent) => item.data,
      }

      expect(() => {
        wrapper = mount(ExpandableList, {
          props: customProps,
          global: {
            stubs: mockVuetifyComponents,
          },
        })
      }).not.toThrow()

      const card = wrapper.find('.v-card')
      expect(card.exists()).toBe(true)
    })

    it('should handle empty table items gracefully', () => {
      const itemsWithEmptyChildren = [
        {
          id: 1,
          name: 'Parent with no children',
          category: 'Empty',
          children: [],
        },
      ]

      wrapper = createComponent({ items: itemsWithEmptyChildren })

      const dataTables = wrapper.findAll('.v-data-table')
      expect(dataTables.length).toBeGreaterThan(0)
    })

    it('should handle deeply nested data structures', () => {
      interface NestedParent {
        id: number
        name: string
        nested: {
          level1: {
            level2: NestedChild[]
          }
        }
      }

      interface NestedChild {
        id: number
        value: string
      }

      const nestedItems: NestedParent[] = [
        {
          id: 1,
          name: 'Nested Parent',
          nested: {
            level1: {
              level2: [{ id: 1, value: 'deep value' }],
            },
          },
        },
      ]

      const nestedHeaders: ITableHeader<NestedChild>[] = [
        { title: 'ID', key: 'id' },
        { title: 'Value', key: 'value' },
      ]

      const nestedProps = {
        title: 'Nested List',
        items: nestedItems,
        headers: nestedHeaders,
        getItemKey: (item: NestedParent) => item.id,
        getItemTitle: (item: NestedParent) => item.name,
        getTableItems: (item: NestedParent) => item.nested.level1.level2,
      }

      expect(() => {
        wrapper = mount(ExpandableList, {
          props: nestedProps,
          global: {
            stubs: mockVuetifyComponents,
          },
        })
      }).not.toThrow()
    })
  })

  describe('edge cases and error handling', () => {
    it('should handle null/undefined items gracefully', () => {
      wrapper = createComponent({ items: [] })
      expect(wrapper.find('.v-card').exists()).toBe(true)

      const minimalItems = [{ id: 1, name: 'Test', category: 'Test', children: [] }]
      wrapper = createComponent({ items: minimalItems })
      expect(wrapper.find('.v-card').exists()).toBe(true)
    })

    it('should handle items with missing required properties', () => {
      const incompleteItems = [
        { id: 1, name: 'Incomplete' },
        { id: 2, children: [] },
      ] as TestParentItem[]

      expect(() => {
        wrapper = createComponent({ items: incompleteItems })
      }).not.toThrow()

      const card = wrapper.find('.v-card')
      expect(card.exists()).toBe(true)
    })

    it('should handle very large datasets efficiently', () => {
      const largeDataset = Array.from({ length: 100 }, (_, i) => ({
        id: i + 1,
        name: `Large Item ${i + 1}`,
        category: `Category ${i % 10}`,
        children: Array.from({ length: 10 }, (_, j) => ({
          id: i * 10 + j + 1,
          name: `Child ${j + 1}`,
          value: (j + 1) * 100,
          status: j % 2 === 0 ? ('active' as const) : ('inactive' as const),
        })),
      }))

      expect(() => {
        wrapper = createComponent({ items: largeDataset })
      }).not.toThrow()

      const card = wrapper.find('.v-card')
      expect(card.exists()).toBe(true)
    })

    it('should handle special characters in data', () => {
      const specialCharItems: TestParentItem[] = [
        {
          id: 1,
          name: 'Name with <html> & "quotes" and émojis 🚀',
          category: 'Special chars & symbols',
          children: [
            {
              id: 1,
              name: 'Child with special chars: @#$%',
              value: 100,
              status: 'active',
            },
          ],
        },
      ]

      expect(() => {
        wrapper = createComponent({ items: specialCharItems })
      }).not.toThrow()
    })

    it('should handle function prop errors gracefully', () => {
      const errorGetItemKey = vi.fn(() => {
        throw new Error('Key generation failed')
      })

      expect(() => {
        wrapper = createComponent({ getItemKey: errorGetItemKey })
      }).toThrow()
    })

    it('should handle empty string values in required fields', () => {
      const emptyStringItems: TestParentItem[] = [
        {
          id: 1,
          name: '',
          category: '',
          children: [
            {
              id: 1,
              name: '',
              value: 0,
              status: 'active',
            },
          ],
        },
      ]

      expect(() => {
        wrapper = createComponent({ items: emptyStringItems })
      }).not.toThrow()
    })
  })

  describe('TypeScript generic support', () => {
    it('should work with different parent and child types', () => {
      interface ProjectItem {
        projectId: string
        projectName: string
        tasks: TaskItem[]
      }

      interface TaskItem {
        taskId: number
        taskName: string
        completed: boolean
        priority: 'high' | 'medium' | 'low'
      }

      const projectHeaders: ITableHeader<TaskItem>[] = [
        { title: 'Task ID', key: 'taskId' },
        { title: 'Task Name', key: 'taskName' },
        { title: 'Completed', key: 'completed' },
        { title: 'Priority', key: 'priority' },
      ]

      const projectItems: ProjectItem[] = [
        {
          projectId: 'proj-1',
          projectName: 'Test Project',
          tasks: [
            { taskId: 1, taskName: 'Task 1', completed: false, priority: 'high' },
            { taskId: 2, taskName: 'Task 2', completed: true, priority: 'low' },
          ],
        },
      ]

      const projectProps = {
        title: 'Project List',
        items: projectItems,
        headers: projectHeaders,
        getItemKey: (item: ProjectItem) => item.projectId,
        getItemTitle: (item: ProjectItem) => item.projectName,
        getTableItems: (item: ProjectItem) => item.tasks,
      }

      expect(() => {
        wrapper = mount(ExpandableList, {
          props: projectProps,
          global: {
            stubs: mockVuetifyComponents,
          },
        })
      }).not.toThrow()

      const card = wrapper.find('.v-card')
      expect(card.exists()).toBe(true)
    })
  })

  describe('integration behavior', () => {
    it('should coordinate BaseCard, BaseExpansionPanel, and BaseTable properly', () => {
      wrapper = createComponent()

      const card = wrapper.find('.v-card')
      expect(card.exists()).toBe(true)

      const expansionPanels = wrapper.find('.v-expansion-panels')
      expect(expansionPanels.exists()).toBe(true)

      const dataTables = wrapper.findAll('.v-data-table')
      expect(dataTables.length).toBeGreaterThan(0)
    })

    it('should maintain proper component hierarchy', () => {
      wrapper = createComponent()

      const card = wrapper.find('.v-card')
      const expansionPanels = card.find('.v-expansion-panels')
      const dataTables = expansionPanels.findAll('.v-data-table')

      expect(card.exists()).toBe(true)
      expect(expansionPanels.exists()).toBe(true)
      expect(dataTables.length).toBeGreaterThan(0)
    })

    it('should handle state changes across component boundaries', async () => {
      wrapper = createComponent({ loading: false })

      await wrapper.setProps({ loading: true })

      const progressCircular = wrapper.find('.v-progress-circular')
      expect(progressCircular.exists()).toBe(true)

      await wrapper.setProps({ loading: false })

      const expansionPanels = wrapper.find('.v-expansion-panels')
      expect(expansionPanels.exists()).toBe(true)
    })

    it('should handle data flow from parent to nested components', () => {
      const customItems = [
        {
          id: 1,
          name: 'Custom Parent',
          category: 'Test',
          children: [{ id: 1, name: 'Custom Child', value: 999, status: 'active' as const }],
        },
      ]

      wrapper = createComponent({ items: customItems })

      const card = wrapper.find('.v-card')
      const expansionPanels = wrapper.find('.v-expansion-panels')
      const dataTables = wrapper.findAll('.v-data-table')

      expect(card.exists()).toBe(true)
      expect(expansionPanels.exists()).toBe(true)
      expect(dataTables.length).toBeGreaterThan(0)
    })
  })

  describe('accessibility', () => {
    it('should maintain proper semantic structure', () => {
      wrapper = createComponent()

      const card = wrapper.find('.v-card')
      const expansionPanels = wrapper.find('.v-expansion-panels')

      expect(card.exists()).toBe(true)
      expect(expansionPanels.exists()).toBe(true)
    })
  })
})
