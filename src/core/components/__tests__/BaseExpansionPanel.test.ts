import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { mount, VueWrapper } from '@vue/test-utils'
import { nextTick } from 'vue'
import BaseExpansionPanel from '../BaseExpansionPanel.vue'
import type { IBaseExpansionPanelProps } from '@core/types'

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
}

interface TestItem {
  id: number
  title: string
  status?: 'pending' | 'finished'
}

interface TestItemWithStatus extends TestItem {
  status: 'pending' | 'finished'
}

describe('BaseExpansionPanel', () => {
  let wrapper: VueWrapper<any>

  const defaultProps: IBaseExpansionPanelProps<TestItem> = {
    items: [
      { id: 1, title: 'Item 1' },
      { id: 2, title: 'Item 2' },
      { id: 3, title: 'Item 3' },
    ],
    getItemKey: (item: TestItem) => item.id,
    getItemTitle: (item: TestItem) => item.title,
    activePanelValue: 0,
  }

  const createComponent = (
    props: Partial<IBaseExpansionPanelProps<TestItem>> = {},
    slots: Record<string, string> = {},
  ) => {
    return mount(BaseExpansionPanel, {
      props: { ...defaultProps, ...props } as IBaseExpansionPanelProps<TestItem>,
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
    it('should render v-expansion-panels with correct props', () => {
      wrapper = createComponent()

      const expansionPanels = wrapper.find('.v-expansion-panels')
      expect(expansionPanels.exists()).toBe(true)
      expect(expansionPanels.attributes('accordion')).toBeDefined()
    })

    it('should render expansion panels for each item', () => {
      wrapper = createComponent()

      const panels = wrapper.findAll('.v-expansion-panel')
      expect(panels).toHaveLength(3)
    })

    it('should render panel titles correctly', () => {
      wrapper = createComponent()

      const titles = wrapper.findAll('.v-expansion-panel-title')
      expect(titles).toHaveLength(3)
      expect(titles[0].text()).toContain('Item 1')
      expect(titles[1].text()).toContain('Item 2')
      expect(titles[2].text()).toContain('Item 3')
    })

    it('should render panel content slots', () => {
      wrapper = createComponent(
        {},
        {
          content: '<div class="custom-content">Panel content</div>',
        },
      )

      const contentElements = wrapper.findAll('.v-expansion-panel-text')
      expect(contentElements).toHaveLength(3)
    })
  })

  describe('props handling', () => {
    it('should handle empty items array', () => {
      wrapper = createComponent({ items: [] })

      const panels = wrapper.findAll('.v-expansion-panel')
      expect(panels).toHaveLength(0)
    })

    it('should use custom getItemKey function', () => {
      const customItems = [
        { id: 10, title: 'Custom 1' },
        { id: 20, title: 'Custom 2' },
      ]
      const getItemKey = vi.fn((item: TestItem) => `key-${item.id}`)

      wrapper = createComponent({
        items: customItems,
        getItemKey,
      })

      expect(getItemKey).toHaveBeenCalledWith(customItems[0], 0)
      expect(getItemKey).toHaveBeenCalledWith(customItems[1], 1)
      expect(getItemKey).toHaveBeenCalledTimes(2)
    })

    it('should use custom getItemTitle function', () => {
      const customItems = [{ id: 1, title: 'Test Title' }]
      const getItemTitle = vi.fn((item: TestItem) => `Custom: ${item.title}`)

      wrapper = createComponent({
        items: customItems,
        getItemTitle,
      })

      expect(getItemTitle).toHaveBeenCalledWith(customItems[0], 0)
      expect(wrapper.find('.v-expansion-panel-title').text()).toContain('Custom: Test Title')
    })

    it('should handle activePanelValue prop', () => {
      wrapper = createComponent({ activePanelValue: 2 })

      // Check internal state is set correctly
      expect(wrapper.vm.activePanel).toBe(2)
    })

    it('should use default activePanelValue when not provided', () => {
      wrapper = createComponent({ activePanelValue: undefined })

      // Should use default value of 0
      expect(wrapper.vm.activePanel).toBe(0)
    })
  })

  describe('reactive updates', () => {
    it('should update activePanel when activePanelValue prop changes', async () => {
      wrapper = createComponent({ activePanelValue: 0 })

      expect(wrapper.vm.activePanel).toBe(0)

      await wrapper.setProps({ activePanelValue: 2 })
      expect(wrapper.vm.activePanel).toBe(2)
    })

    it('should emit update:activePanelValue when activePanel changes', async () => {
      wrapper = createComponent()

      // Simulate activePanel change
      wrapper.vm.activePanel = 1
      await nextTick()

      expect(wrapper.emitted('update:activePanelValue')).toBeTruthy()
      expect(wrapper.emitted('update:activePanelValue')?.[0]).toEqual([1])
    })

    it('should emit multiple updates correctly', async () => {
      wrapper = createComponent()

      wrapper.vm.activePanel = 1
      await nextTick()
      wrapper.vm.activePanel = 2
      await nextTick()

      const emitted = wrapper.emitted('update:activePanelValue')
      expect(emitted).toHaveLength(2)
      expect(emitted?.[0]).toEqual([1])
      expect(emitted?.[1]).toEqual([2])
    })
  })

  describe('icon handling', () => {
    it('should show default chevron icons for items without status', () => {
      wrapper = createComponent()

      const icons = wrapper.findAll('.v-icon')
      expect(icons).toHaveLength(3)
      // Icons show collapsed state by default
      icons.forEach((icon) => {
        expect(icon.text()).toBe('mdi-chevron-down')
      })
    })

    it('should show status-based icons for items with status', () => {
      const itemsWithStatus: TestItemWithStatus[] = [
        { id: 1, title: 'Finished Item', status: 'finished' },
        { id: 2, title: 'Pending Item', status: 'pending' },
      ]

      wrapper = createComponent({ items: itemsWithStatus })

      const icons = wrapper.findAll('.v-icon')
      expect(icons[0].text()).toBe('mdi-check')
      expect(icons[1].text()).toBe('mdi-clock-outline')
    })

    it('should apply correct colors to status icons', () => {
      const itemsWithStatus: TestItemWithStatus[] = [
        { id: 1, title: 'Finished Item', status: 'finished' },
        { id: 2, title: 'Pending Item', status: 'pending' },
      ]

      wrapper = createComponent({ items: itemsWithStatus })

      const icons = wrapper.findAll('.v-icon')
      expect(icons[0].attributes('color')).toBe('teal')
      expect(icons[1].attributes('color')).toBe('warning')
    })

    it('should not apply color to non-status icons', () => {
      wrapper = createComponent()

      const icons = wrapper.findAll('.v-icon')
      icons.forEach((icon) => {
        const colorAttr = icon.attributes('color')
        expect(colorAttr === undefined || colorAttr === '').toBe(true)
      })
    })
  })

  describe('hasStatus type guard', () => {
    it('should correctly identify items with status property', () => {
      const itemWithStatus = { id: 1, title: 'Test', status: 'finished' }
      const itemWithoutStatus = { id: 2, title: 'Test' }

      wrapper = createComponent()

      expect(wrapper.vm.hasStatus(itemWithStatus)).toBe(true)
      expect(wrapper.vm.hasStatus(itemWithoutStatus)).toBe(false)
    })

    it('should handle null and undefined items', () => {
      wrapper = createComponent()

      expect(wrapper.vm.hasStatus(null)).toBe(false)
      expect(wrapper.vm.hasStatus(undefined)).toBe(false)
    })

    it('should handle non-object items', () => {
      wrapper = createComponent()

      expect(wrapper.vm.hasStatus('string')).toBe(false)
      expect(wrapper.vm.hasStatus(123)).toBe(false)
      expect(wrapper.vm.hasStatus(true)).toBe(false)
    })
  })

  describe('slot content', () => {
    it('should pass item and index to content slot', () => {
      const contentSlot = vi.fn().mockReturnValue('<div>Content</div>')

      wrapper = createComponent(
        {},
        {
          content: contentSlot,
        },
      )

      const contentElements = wrapper.findAll('.v-expansion-panel-text')
      expect(contentElements).toHaveLength(3)
    })

    it('should render custom content in slots', () => {
      wrapper = createComponent(
        {},
        {
          content: '<div class="custom-slot-content">Custom Content</div>',
        },
      )

      const customContent = wrapper.findAll('.custom-slot-content')
      expect(customContent).toHaveLength(3)
    })
  })

  describe('edge cases and error handling', () => {
    it('should handle items with missing properties gracefully', () => {
      const incompleteItems = [{ id: 1 }, { title: 'No ID' } as any]

      const getItemKey = vi.fn((item: any, index: number) => item.id || index)
      const getItemTitle = vi.fn((item: any) => item.title || 'No Title')

      expect(() => {
        wrapper = createComponent({
          items: incompleteItems,
          getItemKey,
          getItemTitle,
        })
      }).not.toThrow()

      expect(getItemKey).toHaveBeenCalledTimes(2)
      expect(getItemTitle).toHaveBeenCalledTimes(2)
    })

    it('should handle very large arrays efficiently', () => {
      const largeArray = Array.from({ length: 1000 }, (_, i) => ({
        id: i,
        title: `Item ${i}`,
      }))

      expect(() => {
        wrapper = createComponent({ items: largeArray })
      }).not.toThrow()

      const panels = wrapper.findAll('.v-expansion-panel')
      expect(panels).toHaveLength(1000)
    })

    it('should handle rapid prop changes', async () => {
      wrapper = createComponent({ activePanelValue: 0 })

      await wrapper.setProps({ activePanelValue: 1 })
      await wrapper.setProps({ activePanelValue: 2 })
      await wrapper.setProps({ activePanelValue: 0 })

      expect(wrapper.vm.activePanel).toBe(0)
    })

    it('should handle negative activePanelValue', () => {
      wrapper = createComponent({ activePanelValue: -1 })

      expect(wrapper.vm.activePanel).toBe(-1)
    })

    it('should handle activePanelValue larger than items length', () => {
      wrapper = createComponent({ activePanelValue: 999 })

      expect(wrapper.vm.activePanel).toBe(999)
    })
  })

  describe('TypeScript generic support', () => {
    it('should work with different item types', () => {
      interface CustomItem {
        uuid: string
        name: string
        category: string
      }

      const customItems: CustomItem[] = [{ uuid: 'abc-123', name: 'Custom Item', category: 'test' }]

      const customProps: IBaseExpansionPanelProps<CustomItem> = {
        items: customItems,
        getItemKey: (item: CustomItem) => item.uuid,
        getItemTitle: (item: CustomItem) => `${item.category}: ${item.name}`,
        activePanelValue: 0,
      }

      expect(() => {
        wrapper = mount(BaseExpansionPanel, {
          props: customProps,
          global: {
            stubs: mockVuetifyComponents,
          },
        })
      }).not.toThrow()

      expect(wrapper.find('.v-expansion-panel-title').text()).toContain('test: Custom Item')
    })
  })

  describe('integration with Vuetify', () => {
    it('should pass accordion prop to v-expansion-panels', () => {
      wrapper = createComponent()

      const expansionPanels = wrapper.find('.v-expansion-panels')
      expect(expansionPanels.attributes('accordion')).toBeDefined()
    })

    it('should bind v-model to activePanel', () => {
      wrapper = createComponent({ activePanelValue: 1 })

      const expansionPanels = wrapper.find('.v-expansion-panels')
      expect(expansionPanels.attributes('model-value')).toBe('1')
    })

    it('should render correct number of expansion panels', () => {
      const items = Array.from({ length: 5 }, (_, i) => ({
        id: i,
        title: `Panel ${i}`,
      }))

      wrapper = createComponent({ items })

      const panels = wrapper.findAll('.v-expansion-panel')
      expect(panels).toHaveLength(5)
    })
  })

  describe('accessibility', () => {
    it('should maintain proper structure for screen readers', () => {
      wrapper = createComponent()

      const expansionPanels = wrapper.find('.v-expansion-panels')
      const panels = expansionPanels.findAll('.v-expansion-panel')

      panels.forEach((panel) => {
        expect(panel.find('.v-expansion-panel-title').exists()).toBe(true)
        expect(panel.find('.v-expansion-panel-text').exists()).toBe(true)
      })
    })

    it('should provide meaningful content in titles', () => {
      const descriptiveItems = [
        { id: 1, title: 'User Profile Settings' },
        { id: 2, title: 'Payment Information' },
        { id: 3, title: 'Privacy Settings' },
      ]

      wrapper = createComponent({ items: descriptiveItems })

      const titles = wrapper.findAll('.v-expansion-panel-title')
      expect(titles[0].text()).toContain('User Profile Settings')
      expect(titles[1].text()).toContain('Payment Information')
      expect(titles[2].text()).toContain('Privacy Settings')
    })
  })

  describe('performance considerations', () => {
    it('should not call getItemKey and getItemTitle excessively', () => {
      const getItemKey = vi.fn((item: TestItem) => item.id)
      const getItemTitle = vi.fn((item: TestItem) => item.title)

      wrapper = createComponent({
        getItemKey,
        getItemTitle,
      })

      expect(getItemKey).toHaveBeenCalledTimes(3)
      expect(getItemTitle).toHaveBeenCalledTimes(3)
    })

    it('should handle prop functions efficiently', () => {
      const getItemKey = vi.fn((item: TestItem) => item.id)
      const getItemTitle = vi.fn((item: TestItem) => item.title)

      wrapper = createComponent({
        getItemKey,
        getItemTitle,
      })

      expect(getItemKey).toHaveBeenCalledTimes(3)
      expect(getItemTitle).toHaveBeenCalledTimes(3)

      expect(getItemKey).toHaveBeenCalledWith(defaultProps.items[0], 0)
      expect(getItemKey).toHaveBeenCalledWith(defaultProps.items[1], 1)
      expect(getItemKey).toHaveBeenCalledWith(defaultProps.items[2], 2)
    })
  })
})
