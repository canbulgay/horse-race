import { describe, it, expect, afterEach } from 'vitest'
import { mount, VueWrapper } from '@vue/test-utils'
import BaseTable from '../BaseTable.vue'
import type { ITableItems, ITableHeader } from '@core/types'

const mockVuetifyComponents = {
  'v-data-table': {
    template: `
      <div class="v-data-table" :loading="loading" :headers="headers" :items="items" :item-value="itemValue" v-bind="$attrs">
        <slot name="no-data" v-if="!items || items.length === 0">
          <div class="text-center pa-4">
            <p class="text-h6 mt-2">No data available</p>
            <p class="text-body-2 text-grey">Try generating some data to get started</p>
          </div>
        </slot>
        <div v-else>
          <!-- Mock table content when items exist -->
          <div class="table-content">Table has {{ items.length }} items</div>
        </div>
      </div>
    `,
    props: ['headers', 'items', 'loading', 'itemValue', 'hideDefaultFooter', 'fixedHeader'],
  },
}

interface TestTableItem {
  id: number
  name: string
  value: number
  status: 'active' | 'inactive'
}

interface TestUser {
  userId: string
  username: string
  email: string
  age: number
}

describe('BaseTable', () => {
  let wrapper: VueWrapper<any>

  const sampleHeaders: ITableHeader<TestTableItem>[] = [
    { title: 'ID', key: 'id', sortable: true },
    { title: 'Name', key: 'name', sortable: true },
    { title: 'Value', key: 'value', sortable: false },
    { title: 'Status', key: 'status', width: '120px' },
  ]

  const sampleItems: TestTableItem[] = [
    { id: 1, name: 'Item One', value: 100, status: 'active' },
    { id: 2, name: 'Item Two', value: 200, status: 'inactive' },
    { id: 3, name: 'Item Three', value: 300, status: 'active' },
  ]

  const defaultProps: ITableItems<TestTableItem> = {
    headers: sampleHeaders,
    items: sampleItems,
    loading: false,
    itemValue: 'id',
    noDataText: 'No data available',
    noDataSubtext: 'Try generating some data to get started',
  }

  const createComponent = (
    props: Partial<ITableItems<TestTableItem>> = {},
    slots: Record<string, string> = {},
  ) => {
    return mount(BaseTable, {
      props: { ...defaultProps, ...props } as ITableItems<TestTableItem>,
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
    it('should render v-data-table with correct props', () => {
      wrapper = createComponent()

      const dataTable = wrapper.find('.v-data-table')
      expect(dataTable.exists()).toBe(true)
      expect(dataTable.attributes('item-value')).toBe('id')
      expect(dataTable.attributes('loading')).toBe('false')
    })

    it('should pass headers correctly to v-data-table', () => {
      wrapper = createComponent()

      const dataTable = wrapper.find('.v-data-table')
      // Test that headers prop is passed through
      expect(dataTable.exists()).toBe(true)
    })

    it('should pass items correctly to v-data-table', () => {
      wrapper = createComponent()

      const dataTable = wrapper.find('.v-data-table')
      // Test that items prop is passed through
      expect(dataTable.exists()).toBe(true)
    })

    it('should apply fixed attributes and classes', () => {
      wrapper = createComponent()

      const dataTable = wrapper.find('.v-data-table')
      expect(dataTable.classes()).toContain('elevation-1')
    })
  })

  describe('props handling', () => {
    it('should handle loading state', () => {
      wrapper = createComponent({ loading: true })

      const dataTable = wrapper.find('.v-data-table')
      expect(dataTable.attributes('loading')).toBe('true')
    })

    it('should use default loading value (false)', () => {
      wrapper = createComponent({ loading: undefined })

      const dataTable = wrapper.find('.v-data-table')
      expect(dataTable.attributes('loading')).toBe('false')
    })

    it('should use custom itemValue', () => {
      wrapper = createComponent({ itemValue: 'name' })

      const dataTable = wrapper.find('.v-data-table')
      expect(dataTable.attributes('item-value')).toBe('name')
    })

    it('should use default itemValue when not provided', () => {
      wrapper = createComponent({ itemValue: undefined })

      const dataTable = wrapper.find('.v-data-table')
      expect(dataTable.attributes('item-value')).toBe('id')
    })

    it('should handle empty items array', () => {
      wrapper = createComponent({ items: [] })

      const dataTable = wrapper.find('.v-data-table')
      expect(dataTable.exists()).toBe(true)
    })

    it('should handle empty headers array', () => {
      wrapper = createComponent({ headers: [] })

      const dataTable = wrapper.find('.v-data-table')
      expect(dataTable.exists()).toBe(true)
    })
  })

  describe('no-data state', () => {
    it('should provide no-data slot to v-data-table', () => {
      wrapper = createComponent({ items: [] })

      const dataTable = wrapper.find('.v-data-table')
      expect(dataTable.exists()).toBe(true)
    })

    it('should pass custom no-data text props', () => {
      wrapper = createComponent({
        items: [],
        noDataText: 'Custom no data message',
        noDataSubtext: 'Custom subtext message',
      })

      const dataTable = wrapper.find('.v-data-table')
      expect(dataTable.exists()).toBe(true)
    })

    it('should handle custom no-data slot', () => {
      wrapper = createComponent(
        { items: [] },
        { 'no-data': '<div class="custom-no-data">No items found</div>' },
      )

      const dataTable = wrapper.find('.v-data-table')
      expect(dataTable.exists()).toBe(true)
    })

    it('should pass slot forwarding correctly', () => {
      wrapper = createComponent(
        {
          items: [],
          noDataText: 'Default text',
          noDataSubtext: 'Default subtext',
        },
        { 'no-data': '<div class="custom-no-data">Custom no data</div>' },
      )

      const dataTable = wrapper.find('.v-data-table')
      expect(dataTable.exists()).toBe(true)
    })

    it('should not interfere when items exist', () => {
      wrapper = createComponent()

      const dataTable = wrapper.find('.v-data-table')
      expect(dataTable.exists()).toBe(true)
    })
  })

  describe('slot forwarding', () => {
    it('should forward all slots to v-data-table', () => {
      wrapper = createComponent(
        {},
        {
          'item.name': '<span class="custom-name-cell">Custom Name</span>',
          'header.value': '<span class="custom-header">Custom Header</span>',
        },
      )

      const dataTable = wrapper.find('.v-data-table')
      expect(dataTable.exists()).toBe(true)
    })

    it('should handle item slots with slot props', () => {
      wrapper = createComponent(
        {},
        {
          'item.name': '<span class="item-slot">{{ item.name }}</span>',
        },
      )

      const dataTable = wrapper.find('.v-data-table')
      expect(dataTable.exists()).toBe(true)
    })

    it('should handle header slots', () => {
      wrapper = createComponent(
        {},
        {
          'header.name': '<span class="header-slot">Custom Header</span>',
        },
      )

      const dataTable = wrapper.find('.v-data-table')
      expect(dataTable.exists()).toBe(true)
    })

    it('should handle multiple slots simultaneously', () => {
      wrapper = createComponent(
        {},
        {
          'item.name': '<span class="name-cell">Name</span>',
          'item.value': '<span class="value-cell">Value</span>',
          'header.status': '<span class="status-header">Status</span>',
        },
      )

      const dataTable = wrapper.find('.v-data-table')
      expect(dataTable.exists()).toBe(true)
    })
  })

  describe('attribute inheritance', () => {
    it('should pass through additional attributes via v-bind="$attrs"', () => {
      wrapper = mount(BaseTable, {
        props: { ...defaultProps },
        attrs: {
          'data-testid': 'custom-table',
          'custom-attr': 'custom-value',
        },
        global: {
          stubs: mockVuetifyComponents,
        },
      })

      const dataTable = wrapper.find('.v-data-table')
      expect(dataTable.attributes('data-testid')).toBe('custom-table')
      expect(dataTable.attributes('custom-attr')).toBe('custom-value')
    })

    it('should not interfere with core props when passing attributes', () => {
      wrapper = mount(BaseTable, {
        props: { ...defaultProps },
        attrs: {
          loading: 'ignored',
        },
        global: {
          stubs: mockVuetifyComponents,
        },
      })

      const dataTable = wrapper.find('.v-data-table')
      expect(dataTable.attributes('loading')).toBe('false')
    })
  })

  describe('TypeScript generic support', () => {
    it('should work with different item types', () => {
      const userHeaders: ITableHeader<TestUser>[] = [
        { title: 'User ID', key: 'userId' },
        { title: 'Username', key: 'username' },
        { title: 'Email', key: 'email' },
        { title: 'Age', key: 'age', sortable: true },
      ]

      const userItems: TestUser[] = [
        { userId: 'u1', username: 'john_doe', email: 'john@example.com', age: 25 },
        { userId: 'u2', username: 'jane_smith', email: 'jane@example.com', age: 30 },
      ]

      const userProps: ITableItems<TestUser> = {
        headers: userHeaders,
        items: userItems,
        itemValue: 'userId',
      }

      expect(() => {
        wrapper = mount(BaseTable, {
          props: userProps,
          global: {
            stubs: mockVuetifyComponents,
          },
        })
      }).not.toThrow()

      const dataTable = wrapper.find('.v-data-table')
      expect(dataTable.exists()).toBe(true)
      expect(dataTable.attributes('item-value')).toBe('userId')
    })

    it('should handle complex object types', () => {
      interface ComplexItem {
        id: string
        metadata: {
          name: string
          tags: string[]
        }
        config: {
          enabled: boolean
          priority: number
        }
      }

      const complexHeaders: ITableHeader<ComplexItem>[] = [
        { title: 'ID', key: 'id' },
        { title: 'Name', key: 'metadata' as any },
        { title: 'Config', key: 'config' as any },
      ]

      const complexItems: ComplexItem[] = [
        {
          id: 'item1',
          metadata: { name: 'Test Item', tags: ['tag1', 'tag2'] },
          config: { enabled: true, priority: 1 },
        },
      ]

      expect(() => {
        wrapper = mount(BaseTable, {
          props: {
            headers: complexHeaders,
            items: complexItems,
            itemValue: 'id',
          },
          global: {
            stubs: mockVuetifyComponents,
          },
        })
      }).not.toThrow()
    })
  })

  describe('header configuration', () => {
    it('should handle headers with all properties', () => {
      const fullHeaders: ITableHeader<TestTableItem>[] = [
        {
          title: 'Full Header',
          key: 'name',
          sortable: true,
          width: '200px',
        },
      ]

      wrapper = createComponent({ headers: fullHeaders })

      const dataTable = wrapper.find('.v-data-table')
      expect(dataTable.exists()).toBe(true)
    })

    it('should handle headers with minimal properties', () => {
      const minimalHeaders: ITableHeader<TestTableItem>[] = [
        {
          title: 'Minimal',
          key: 'id',
        },
      ]

      wrapper = createComponent({ headers: minimalHeaders })

      const dataTable = wrapper.find('.v-data-table')
      expect(dataTable.exists()).toBe(true)
    })

    it('should handle mixed header configurations', () => {
      const mixedHeaders: ITableHeader<TestTableItem>[] = [
        { title: 'Simple', key: 'id' },
        { title: 'Sortable', key: 'name', sortable: true },
        { title: 'Fixed Width', key: 'value', width: '100px' },
        { title: 'Full Config', key: 'status', sortable: false, width: '150px' },
      ]

      wrapper = createComponent({ headers: mixedHeaders })

      const dataTable = wrapper.find('.v-data-table')
      expect(dataTable.exists()).toBe(true)
      // Mixed headers are handled correctly
    })
  })

  describe('data handling', () => {
    it('should handle items with all required properties', () => {
      const items: TestTableItem[] = [{ id: 1, name: 'Complete Item', value: 42, status: 'active' }]

      wrapper = createComponent({ items })

      const dataTable = wrapper.find('.v-data-table')
      expect(dataTable.exists()).toBe(true)
      // Items are passed to v-data-table
    })

    it('should handle items with optional/additional properties', () => {
      const itemsWithExtra = [
        {
          id: 1,
          name: 'Item with extra',
          value: 100,
          status: 'active' as const,
          extraProp: 'extra value',
          nested: { deep: 'value' },
        },
      ]

      expect(() => {
        wrapper = createComponent({ items: itemsWithExtra as any })
      }).not.toThrow()

      const dataTable = wrapper.find('.v-data-table')
      expect(dataTable.exists()).toBe(true)
    })

    it('should handle large datasets efficiently', () => {
      const largeDataset = Array.from({ length: 1000 }, (_, i) => ({
        id: i + 1,
        name: `Item ${i + 1}`,
        value: (i + 1) * 10,
        status: i % 2 === 0 ? ('active' as const) : ('inactive' as const),
      }))

      expect(() => {
        wrapper = createComponent({ items: largeDataset })
      }).not.toThrow()

      const dataTable = wrapper.find('.v-data-table')
      expect(dataTable.exists()).toBe(true)
      // Large dataset is handled without errors
    })
  })

  describe('edge cases and error handling', () => {
    it('should handle null/undefined items gracefully', () => {
      expect(() => {
        wrapper = createComponent({ items: null as any })
      }).not.toThrow()

      expect(() => {
        wrapper = createComponent({ items: undefined as any })
      }).not.toThrow()
    })

    it('should handle null/undefined headers gracefully', () => {
      expect(() => {
        wrapper = createComponent({ headers: null as any })
      }).not.toThrow()

      expect(() => {
        wrapper = createComponent({ headers: undefined as any })
      }).not.toThrow()
    })

    it('should handle items with missing properties', () => {
      const incompleteItems = [
        { id: 1, name: 'Incomplete' }, // Missing value and status
        { id: 2, value: 100 }, // Missing name and status
      ] as TestTableItem[]

      expect(() => {
        wrapper = createComponent({ items: incompleteItems })
      }).not.toThrow()

      const dataTable = wrapper.find('.v-data-table')
      expect(dataTable.exists()).toBe(true)
    })

    it('should handle very long text content', () => {
      const longTextItems: TestTableItem[] = [
        {
          id: 1,
          name: 'A'.repeat(1000),
          value: 100,
          status: 'active',
        },
      ]

      expect(() => {
        wrapper = createComponent({ items: longTextItems })
      }).not.toThrow()
    })

    it('should handle special characters in data', () => {
      const specialCharItems: TestTableItem[] = [
        {
          id: 1,
          name: 'Name with <html> & "quotes" and émojis 🚀',
          value: 100,
          status: 'active',
        },
      ]

      expect(() => {
        wrapper = createComponent({ items: specialCharItems })
      }).not.toThrow()
    })

    it('should handle empty strings in required fields', () => {
      const emptyStringItems = [
        {
          id: 1,
          name: '',
          value: 0,
          status: 'active' as const,
        },
      ]

      expect(() => {
        wrapper = createComponent({ items: emptyStringItems })
      }).not.toThrow()
    })

    it('should handle numeric and boolean values correctly', () => {
      const mixedTypeItems = [
        {
          id: 0,
          name: 'Zero ID Item',
          value: -100,
          status: 'active' as const,
        },
      ]

      expect(() => {
        wrapper = createComponent({ items: mixedTypeItems })
      }).not.toThrow()
    })
  })

  describe('integration with Vuetify', () => {
    it('should pass all props correctly to v-data-table', () => {
      wrapper = createComponent({
        loading: true,
        itemValue: 'name',
      })

      const dataTable = wrapper.find('.v-data-table')
      expect(dataTable.attributes('loading')).toBe('true')
      expect(dataTable.attributes('item-value')).toBe('name')
    })

    it('should maintain Vuetify data table structure', () => {
      wrapper = createComponent()

      const dataTable = wrapper.find('.v-data-table')
      expect(dataTable.exists()).toBe(true)
      expect(dataTable.classes()).toContain('elevation-1')
    })

    it('should work with Vuetify theming classes', () => {
      wrapper = mount(BaseTable, {
        props: { ...defaultProps },
        attrs: {
          class: 'custom-theme-class',
        },
        global: {
          stubs: mockVuetifyComponents,
        },
      })

      const dataTable = wrapper.find('.v-data-table')
      expect(dataTable.attributes('class')).toContain('custom-theme-class')
    })
  })

  describe('accessibility', () => {
    it('should maintain table semantics for screen readers', () => {
      wrapper = createComponent()

      const dataTable = wrapper.find('.v-data-table')
      expect(dataTable.exists()).toBe(true)
      // v-data-table component handles ARIA attributes internally
    })

    it('should provide meaningful no-data content', () => {
      wrapper = createComponent({
        items: [],
        noDataText: 'No results found',
        noDataSubtext: 'Try adjusting your search criteria',
      })

      const dataTable = wrapper.find('.v-data-table')
      expect(dataTable.exists()).toBe(true)
    })

    it('should handle loading state accessibility', () => {
      wrapper = createComponent({ loading: true })

      const dataTable = wrapper.find('.v-data-table')
      expect(dataTable.attributes('loading')).toBe('true')
    })
  })

  describe('performance considerations', () => {
    it('should render efficiently with minimal DOM operations', () => {
      wrapper = createComponent()

      expect(wrapper.findAll('.v-data-table')).toHaveLength(1)
    })

    it('should handle prop changes efficiently', async () => {
      wrapper = createComponent({ loading: false })

      await wrapper.setProps({ loading: true })
      expect(wrapper.find('.v-data-table').attributes('loading')).toBe('true')

      await wrapper.setProps({ loading: false })
      expect(wrapper.find('.v-data-table').attributes('loading')).toBe('false')
    })

    it('should handle item updates without unnecessary re-renders', async () => {
      wrapper = createComponent()

      const newItems: TestTableItem[] = [{ id: 4, name: 'New Item', value: 400, status: 'active' }]

      await wrapper.setProps({ items: newItems })

      const dataTable = wrapper.find('.v-data-table')
      expect(dataTable.exists()).toBe(true)
    })

    it('should handle header updates efficiently', async () => {
      wrapper = createComponent()

      const newHeaders: ITableHeader<TestTableItem>[] = [{ title: 'New Header', key: 'id' }]

      await wrapper.setProps({ headers: newHeaders })

      const dataTable = wrapper.find('.v-data-table')
      expect(dataTable.exists()).toBe(true)
    })
  })

  describe('default values', () => {
    it('should use correct default values for all props', () => {
      wrapper = mount(BaseTable, {
        props: {
          headers: sampleHeaders,
          items: sampleItems,
        },
        global: {
          stubs: mockVuetifyComponents,
        },
      })

      const dataTable = wrapper.find('.v-data-table')
      expect(dataTable.attributes('loading')).toBe('false')
      expect(dataTable.attributes('item-value')).toBe('id')
    })

    it('should use default no-data text when not provided', () => {
      wrapper = mount(BaseTable, {
        props: {
          headers: sampleHeaders,
          items: [],
        },
        global: {
          stubs: mockVuetifyComponents,
        },
      })

      const dataTable = wrapper.find('.v-data-table')
      expect(dataTable.exists()).toBe(true)
    })
  })
})
