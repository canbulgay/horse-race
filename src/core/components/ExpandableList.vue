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
        v-model="activePanel"
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
import { ref } from 'vue'
import { BaseTable, BaseCard, BaseExpansion } from '@core/components'
import type { ITableHeader } from '@core/types'

interface Props {
  title: string
  items: T[]
  loading?: boolean
  loadingText?: string
  noDataTitle?: string
  noDataSubtext?: string
  headers: ITableHeader<U>[]
  tableNoDataText?: string
  tableNoDataSubtext?: string
  getItemKey: (item: T, index: number) => string | number
  getItemTitle: (item: T, index: number) => string
  getTableItems: (item: T) => U[]
}

withDefaults(defineProps<Props>(), {
  loading: false,
  loadingText: 'Loading...',
  noDataTitle: 'No data found',
  noDataSubtext: 'No items available',
  tableNoDataText: 'No data in this item',
  tableNoDataSubtext: 'Something went wrong',
})

const activePanel = ref(0)
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
