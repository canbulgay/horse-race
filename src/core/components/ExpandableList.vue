<template>
  <BaseCard
    :title="title"
    :loading="loading"
    :is-empty="items.length === 0"
    :loading-text="loadingText"
    :no-data-title="noDataTitle"
    :no-data-subtext="noDataSubtext"
    card-class="expandable-list-card"
    body-class="expandable-list-body pa-4"
  >
    <template #content>
      <BaseExpansion
        :items="items"
        :get-item-key="getItemKey"
        :get-item-title="getItemTitle"
        :active-panel-value="activePanelValue"
        @update:active-panel-value="emit('update:activePanelValue', $event)"
      >
        <template #content="{ item }">
          <BaseTable
            :headers="headers"
            :items="getTableItems(item)"
            :no-data-text="tableNoDataText"
            :no-data-subtext="tableNoDataSubtext"
            hide-default-footer
          >
            <template v-for="(_, slot) in $slots" v-slot:[slot]="slotProps">
              <slot :name="slot" v-bind="slotProps" />
            </template>
          </BaseTable>
        </template>
      </BaseExpansion>
    </template>
  </BaseCard>
</template>

<script setup lang="ts" generic="T, U extends Record<string, any> = any">
import { BaseTable, BaseCard, BaseExpansion } from '@core/components'
import type { IExpandableListProps, IExpandableListEmits } from '@core/types'

withDefaults(defineProps<IExpandableListProps<T, U>>(), {
  loading: false,
  loadingText: 'Loading...',
  noDataTitle: 'No data found',
  noDataSubtext: 'No items available',
  tableNoDataText: 'No data in this item',
  tableNoDataSubtext: 'Something went wrong',
  activePanelValue: 0,
})

const emit = defineEmits<IExpandableListEmits>()
</script>

<style scoped>
.expandable-list-card {
  height: 800px;
  overflow: auto;
}
.expandable-list-body {
  flex: 1 1 auto;
  overflow: auto;
}
</style>
