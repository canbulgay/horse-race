import { describe, it, expect, afterEach } from 'vitest'
import { mount, VueWrapper } from '@vue/test-utils'
import BaseCard from '../BaseCard.vue'
import type { IBaseCardProps } from '@core/types'

const mockVuetifyComponents = {
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
}

describe('BaseCard', () => {
  let wrapper: VueWrapper<any>

  const defaultProps: IBaseCardProps = {
    loading: false,
    isEmpty: false,
    loadingText: 'Loading...',
    noDataTitle: 'No data found',
    noDataSubtext: 'No items available',
    cardClass: '',
    titleClass: 'd-flex align-center justify-space-between bg-info',
    contentClass: 'pa-0',
    bodyClass: 'pa-4',
  }

  const createComponent = (
    props: Partial<IBaseCardProps> = {},
    slots: Record<string, string> = {},
  ) => {
    return mount(BaseCard, {
      props: { ...defaultProps, ...props } as IBaseCardProps,
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
    it('should render v-card with correct class', () => {
      wrapper = createComponent()

      const card = wrapper.find('.v-card')
      expect(card.exists()).toBe(true)
    })

    it('should apply custom cardClass', () => {
      wrapper = createComponent({ cardClass: 'custom-card-class' })

      const card = wrapper.find('.v-card')
      expect(card.attributes('class')).toContain('custom-card-class')
    })

    it('should render without title when title is not provided', () => {
      wrapper = createComponent()

      const cardTitle = wrapper.find('.v-card-title')
      expect(cardTitle.exists()).toBe(false)
    })

    it('should render v-card-text container', () => {
      wrapper = createComponent()

      const cardText = wrapper.find('.v-card-text')
      expect(cardText.exists()).toBe(true)
    })
  })

  describe('title section', () => {
    it('should render title when provided', () => {
      wrapper = createComponent({ title: 'Test Title' })

      const cardTitle = wrapper.find('.v-card-title')
      expect(cardTitle.exists()).toBe(true)
      expect(cardTitle.text()).toContain('Test Title')
    })

    it('should apply custom titleClass', () => {
      wrapper = createComponent({
        title: 'Test Title',
        titleClass: 'custom-title-class',
      })

      const cardTitle = wrapper.find('.v-card-title')
      expect(cardTitle.attributes('class')).toContain('custom-title-class')
    })

    it('should render title when title slot is provided even without title prop', () => {
      wrapper = createComponent({}, { title: '<span class="custom-title">Custom Title</span>' })

      const cardTitle = wrapper.find('.v-card-title')
      expect(cardTitle.exists()).toBe(true)
      expect(cardTitle.find('.custom-title').text()).toBe('Custom Title')
    })

    it('should render title-actions slot', () => {
      wrapper = createComponent(
        { title: 'Test Title' },
        {
          'title-actions': '<button class="title-action">Action</button>',
        },
      )

      const cardTitle = wrapper.find('.v-card-title')
      expect(cardTitle.find('.title-action').text()).toBe('Action')
    })

    it('should use slot content over title prop when both provided', () => {
      wrapper = createComponent(
        { title: 'Prop Title' },
        { title: '<span class="slot-title">Slot Title</span>' },
      )

      const cardTitle = wrapper.find('.v-card-title')
      expect(cardTitle.find('.slot-title').text()).toBe('Slot Title')
      expect(cardTitle.text()).not.toContain('Prop Title')
    })
  })

  describe('loading state', () => {
    it('should show loading content when loading is true', () => {
      wrapper = createComponent({ loading: true })

      const loadingDiv = wrapper.find('.v-card-text > div')
      expect(loadingDiv.classes()).toContain('text-center')
      expect(loadingDiv.classes()).toContain('pa-4')

      const progressCircular = wrapper.find('.v-progress-circular')
      expect(progressCircular.exists()).toBe(true)
    })

    it('should display default loading text', () => {
      wrapper = createComponent({ loading: true })

      expect(wrapper.text()).toContain('Loading...')
    })

    it('should display custom loading text', () => {
      wrapper = createComponent({
        loading: true,
        loadingText: 'Please wait...',
      })

      expect(wrapper.text()).toContain('Please wait...')
    })

    it('should render custom loading slot content', () => {
      wrapper = createComponent(
        { loading: true },
        { loading: '<div class="custom-loading">Custom Loading</div>' },
      )

      const customLoading = wrapper.find('.custom-loading')
      expect(customLoading.exists()).toBe(true)
      expect(customLoading.text()).toBe('Custom Loading')
    })

    it('should configure progress circular correctly', () => {
      wrapper = createComponent({ loading: true })

      const progressCircular = wrapper.find('.v-progress-circular')
      expect(progressCircular.attributes('indeterminate')).toBeDefined()
      expect(progressCircular.attributes('color')).toBe('primary')
    })

    it('should not show content when loading', () => {
      wrapper = createComponent(
        { loading: true },
        { content: '<div class="main-content">Main Content</div>' },
      )

      const mainContent = wrapper.find('.main-content')
      expect(mainContent.exists()).toBe(false)
    })
  })

  describe('empty state', () => {
    it('should show empty content when isEmpty is true and not loading', () => {
      wrapper = createComponent({
        loading: false,
        isEmpty: true,
      })

      const emptyDiv = wrapper.find('.v-card-text > div')
      expect(emptyDiv.classes()).toContain('text-center')
      expect(emptyDiv.classes()).toContain('pa-4')
    })

    it('should display default no data messages', () => {
      wrapper = createComponent({ isEmpty: true })

      expect(wrapper.text()).toContain('No data found')
      expect(wrapper.text()).toContain('No items available')
    })

    it('should display custom no data messages', () => {
      wrapper = createComponent({
        isEmpty: true,
        noDataTitle: 'No results',
        noDataSubtext: 'Try a different search',
      })

      expect(wrapper.text()).toContain('No results')
      expect(wrapper.text()).toContain('Try a different search')
    })

    it('should render custom no-data slot content', () => {
      wrapper = createComponent(
        { isEmpty: true },
        { 'no-data': '<div class="custom-empty">Nothing here</div>' },
      )

      const customEmpty = wrapper.find('.custom-empty')
      expect(customEmpty.exists()).toBe(true)
      expect(customEmpty.text()).toBe('Nothing here')
    })

    it('should not show empty state when loading is true', () => {
      wrapper = createComponent({
        loading: true,
        isEmpty: true,
      })

      expect(wrapper.text()).not.toContain('No data found')
      expect(wrapper.text()).toContain('Loading...')
    })

    it('should not show content when isEmpty', () => {
      wrapper = createComponent(
        { isEmpty: true },
        { content: '<div class="main-content">Main Content</div>' },
      )

      const mainContent = wrapper.find('.main-content')
      expect(mainContent.exists()).toBe(false)
    })
  })

  describe('content state', () => {
    it('should show content when not loading and not empty', () => {
      wrapper = createComponent(
        { loading: false, isEmpty: false },
        { content: '<div class="main-content">Main Content</div>' },
      )

      const contentDiv = wrapper.find('.v-card-text > div:last-child')
      expect(contentDiv.exists()).toBe(true)

      const mainContent = wrapper.find('.main-content')
      expect(mainContent.exists()).toBe(true)
      expect(mainContent.text()).toBe('Main Content')
    })

    it('should apply custom bodyClass to content wrapper', () => {
      wrapper = createComponent(
        {
          loading: false,
          isEmpty: false,
          bodyClass: 'custom-body-class',
        },
        { content: '<div>Content</div>' },
      )

      const contentDiv = wrapper.find('.v-card-text > div:last-child')
      expect(contentDiv.attributes('class')).toContain('custom-body-class')
    })

    it('should apply default bodyClass (pa-4)', () => {
      wrapper = createComponent(
        { loading: false, isEmpty: false },
        { content: '<div>Content</div>' },
      )

      const contentDiv = wrapper.find('.v-card-text > div:last-child')
      expect(contentDiv.attributes('class')).toContain('pa-4')
    })
  })

  describe('actions section', () => {
    it('should not render v-card-actions when actions slot is not provided', () => {
      wrapper = createComponent()

      const cardActions = wrapper.find('.v-card-actions')
      expect(cardActions.exists()).toBe(false)
    })

    it('should render v-card-actions when actions slot is provided', () => {
      wrapper = createComponent({}, { actions: '<button class="action-button">Action</button>' })

      const cardActions = wrapper.find('.v-card-actions')
      expect(cardActions.exists()).toBe(true)

      const actionButton = wrapper.find('.action-button')
      expect(actionButton.exists()).toBe(true)
      expect(actionButton.text()).toBe('Action')
    })

    it('should render multiple action elements', () => {
      wrapper = createComponent(
        {},
        {
          actions: `
            <button class="btn-save">Save</button>
            <button class="btn-cancel">Cancel</button>
          `,
        },
      )

      const cardActions = wrapper.find('.v-card-actions')
      expect(cardActions.exists()).toBe(true)
      expect(cardActions.find('.btn-save').text()).toBe('Save')
      expect(cardActions.find('.btn-cancel').text()).toBe('Cancel')
    })
  })

  describe('CSS classes and styling', () => {
    it('should apply custom contentClass to v-card-text', () => {
      wrapper = createComponent({ contentClass: 'custom-content-class' })

      const cardText = wrapper.find('.v-card-text')
      expect(cardText.attributes('class')).toContain('custom-content-class')
    })

    it('should apply default contentClass (pa-0)', () => {
      wrapper = createComponent()

      const cardText = wrapper.find('.v-card-text')
      expect(cardText.attributes('class')).toContain('pa-0')
    })

    it('should handle empty string classes gracefully', () => {
      wrapper = createComponent({
        cardClass: '',
        titleClass: '',
        contentClass: '',
        bodyClass: '',
      })

      expect(wrapper.find('.v-card').exists()).toBe(true)
      expect(wrapper.find('.v-card-text').exists()).toBe(true)
    })
  })

  describe('state priority and combinations', () => {
    it('should prioritize loading over empty state', () => {
      wrapper = createComponent({
        loading: true,
        isEmpty: true,
      })

      expect(wrapper.find('.v-progress-circular').exists()).toBe(true)
      expect(wrapper.text()).toContain('Loading...')
      expect(wrapper.text()).not.toContain('No data found')
    })

    it('should show empty state when not loading but isEmpty is true', () => {
      wrapper = createComponent({
        loading: false,
        isEmpty: true,
      })

      expect(wrapper.find('.v-progress-circular').exists()).toBe(false)
      expect(wrapper.text()).not.toContain('Loading...')
      expect(wrapper.text()).toContain('No data found')
    })

    it('should show content when neither loading nor empty', () => {
      wrapper = createComponent(
        { loading: false, isEmpty: false },
        { content: '<div class="actual-content">Actual Content</div>' },
      )

      expect(wrapper.find('.v-progress-circular').exists()).toBe(false)
      expect(wrapper.text()).not.toContain('Loading...')
      expect(wrapper.text()).not.toContain('No data found')
      expect(wrapper.find('.actual-content').exists()).toBe(true)
    })
  })

  describe('slot content rendering', () => {
    it('should render all slots together when provided', () => {
      wrapper = createComponent(
        {},
        {
          title: '<span class="slot-title">Title</span>',
          'title-actions': '<button class="title-btn">Title Action</button>',
          content: '<div class="slot-content">Content</div>',
          actions: '<button class="action-btn">Action</button>',
        },
      )

      expect(wrapper.find('.slot-title').text()).toBe('Title')
      expect(wrapper.find('.title-btn').text()).toBe('Title Action')
      expect(wrapper.find('.slot-content').text()).toBe('Content')
      expect(wrapper.find('.action-btn').text()).toBe('Action')
    })

    it('should handle complex HTML in slots', () => {
      wrapper = createComponent(
        {},
        {
          content: `
            <div class="complex-content">
              <h3>Complex Title</h3>
              <p>Paragraph content</p>
              <ul>
                <li>Item 1</li>
                <li>Item 2</li>
              </ul>
            </div>
          `,
        },
      )

      const complexContent = wrapper.find('.complex-content')
      expect(complexContent.exists()).toBe(true)
      expect(complexContent.find('h3').text()).toBe('Complex Title')
      expect(complexContent.find('p').text()).toBe('Paragraph content')
      expect(complexContent.findAll('li')).toHaveLength(2)
    })
  })

  describe('edge cases and error handling', () => {
    it('should handle undefined prop values gracefully', () => {
      wrapper = createComponent({
        title: undefined,
        loadingText: undefined,
        noDataTitle: undefined,
        noDataSubtext: undefined,
      })

      expect(wrapper.find('.v-card').exists()).toBe(true)
    })

    it('should handle null prop values gracefully', () => {
      wrapper = createComponent({
        title: null as any,
        loadingText: null as any,
        noDataTitle: null as any,
        noDataSubtext: null as any,
      })

      expect(wrapper.find('.v-card').exists()).toBe(true)
    })

    it('should handle empty string prop values', () => {
      wrapper = createComponent({
        title: '',
        loadingText: '',
        noDataTitle: '',
        noDataSubtext: '',
      })

      expect(wrapper.find('.v-card').exists()).toBe(true)
    })

    it('should handle very long text content', () => {
      const longText = 'A'.repeat(1000)
      wrapper = createComponent({
        title: longText,
        loadingText: longText,
        noDataTitle: longText,
      })

      expect(wrapper.find('.v-card').exists()).toBe(true)
    })

    it('should handle special characters in text', () => {
      wrapper = createComponent({
        title: 'Title with <special> &characters;',
        loadingText: 'Loading with émojis 🚀',
        noDataTitle: 'No data with "quotes" and \'apostrophes\'',
      })

      expect(wrapper.find('.v-card').exists()).toBe(true)
    })
  })

  describe('integration with Vuetify', () => {
    it('should render all Vuetify components correctly', () => {
      wrapper = createComponent(
        { title: 'Test', loading: true },
        { actions: '<button>Action</button>' },
      )

      expect(wrapper.find('.v-card').exists()).toBe(true)
      expect(wrapper.find('.v-card-title').exists()).toBe(true)
      expect(wrapper.find('.v-card-text').exists()).toBe(true)
      expect(wrapper.find('.v-card-actions').exists()).toBe(true)
      expect(wrapper.find('.v-progress-circular').exists()).toBe(true)
    })

    it('should pass attributes correctly to Vuetify components', () => {
      wrapper = createComponent({
        cardClass: 'elevation-2',
        titleClass: 'text-h4',
        contentClass: 'mx-4',
      })

      const card = wrapper.find('.v-card')
      const cardText = wrapper.find('.v-card-text')

      expect(card.attributes('class')).toContain('elevation-2')
      expect(cardText.attributes('class')).toContain('mx-4')
    })
  })

  describe('accessibility', () => {
    it('should maintain proper semantic structure', () => {
      wrapper = createComponent(
        { title: 'Accessible Title' },
        {
          content: '<main>Main content</main>',
          actions: '<nav>Navigation</nav>',
        },
      )

      expect(wrapper.find('.v-card-title').exists()).toBe(true)
      expect(wrapper.find('main').exists()).toBe(true)
      expect(wrapper.find('nav').exists()).toBe(true)
    })

    it('should provide meaningful loading state', () => {
      wrapper = createComponent({
        loading: true,
        loadingText: 'Loading user data, please wait...',
      })

      expect(wrapper.text()).toContain('Loading user data, please wait...')
    })

    it('should provide meaningful empty state messages', () => {
      wrapper = createComponent({
        isEmpty: true,
        noDataTitle: 'No search results found',
        noDataSubtext: 'Try adjusting your search criteria or browse all items',
      })

      expect(wrapper.text()).toContain('No search results found')
      expect(wrapper.text()).toContain('Try adjusting your search criteria or browse all items')
    })
  })

  describe('performance considerations', () => {
    it('should render efficiently with minimal DOM operations', () => {
      wrapper = createComponent({ loading: false, isEmpty: false })

      // Should only render necessary elements
      expect(wrapper.findAll('div')).toHaveLength(3) // v-card, v-card-text, content wrapper
    })

    it('should handle rapid state changes efficiently', async () => {
      wrapper = createComponent({ loading: true })

      await wrapper.setProps({ loading: false, isEmpty: true })
      expect(wrapper.text()).toContain('No data found')

      await wrapper.setProps({ isEmpty: false })
      expect(wrapper.text()).not.toContain('No data found')
    })

    it('should not re-render unnecessarily when irrelevant props change', () => {
      wrapper = createComponent({
        loading: false,
        isEmpty: false,
        cardClass: 'initial-class',
      })

      wrapper.setProps({ cardClass: 'updated-class' })

      // Content structure should remain the same, only class should change
      expect(wrapper.find('.v-card').exists()).toBe(true)
      expect(wrapper.find('.v-card-text').exists()).toBe(true)
    })
  })
})
