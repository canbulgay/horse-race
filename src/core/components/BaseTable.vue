<template>
  <v-data-table
    :headers="headers"
    :items="items"
    :loading="loading"
    :item-value="itemValue"
    class="elevation-1"
    hide-default-footer
    fixed-header
    v-bind="$attrs"
  >
    <template v-for="(_, slotName) in $slots" :key="slotName" #[slotName]="slotProps">
      <slot :name="slotName" v-bind="slotProps" />
    </template>

    <template #no-data v-if="!$slots['no-data']">
      <div class="text-center pa-4">
        <p class="text-h6 mt-2">{{ noDataText }}</p>
        <p class="text-body-2 text-grey">{{ noDataSubtext }}</p>
      </div>
    </template>
  </v-data-table>
</template>

<script setup lang="ts" generic="T extends Record<string, any> = any">
import type { ITableItems } from '../types'

withDefaults(defineProps<ITableItems<T>>(), {
  loading: false,
  itemValue: 'id',
  noDataText: 'No data available',
  noDataSubtext: 'Try generating some data to get started',
})
</script>
