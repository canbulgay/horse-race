<template>
  <v-card class="generic-list-card">
    <v-card-title class="d-flex align-center justify-space-between bg-info">
      <span class="text-h5">{{ title }}</span>
    </v-card-title>

    <v-card-text class="pa-0">
      <div v-if="loading" class="text-center pa-4">
        <v-progress-circular indeterminate color="primary" />
        <p class="text-body-2 mt-2">{{ loadingText }}</p>
      </div>

      <div v-else-if="items.length === 0" class="text-center pa-4">
        <p class="text-h6 mt-2">{{ noDataTitle }}</p>
        <p class="text-body-2 text-grey">{{ noDataSubtext }}</p>
      </div>

      <div v-else class="generic-list-body pa-4">
        <v-expansion-panels v-model="activePanel" accordion>
          <v-expansion-panel v-for="(item, index) in items" :key="getItemKey(item, index)">
            <v-expansion-panel-title class="d-flex align-center justify-space-between">
              <span class="text-body-1 font-weight-bold">
                {{ getItemTitle(item, index) }}
              </span>
              <template v-slot:actions="{ expanded }">
                <v-icon
                  :color="!expanded ? 'teal' : ''"
                  :icon="expanded ? 'mdi-pencil' : 'mdi-check'"
                ></v-icon>
              </template>
            </v-expansion-panel-title>
            <v-expansion-panel-text>
              <template v-slot:default>
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
            </v-expansion-panel-text>
          </v-expansion-panel>
        </v-expansion-panels>
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts" generic="T, U">
import { ref } from 'vue'
import { BaseTable } from '@core/components'
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
  tableNoDataSubtext: 'Something went wrong'
})

const activePanel = ref(0)
</script>

<style scoped>
.generic-list-card {
  height: 800px;
  overflow: auto;
}
.generic-list-body {
  flex: 1 1 auto;
  overflow: auto;
}
</style>