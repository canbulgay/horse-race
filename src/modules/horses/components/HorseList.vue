<template>
  <v-card>
    <v-card-title class="d-flex align-center justify-space-between">
      <span class="text-h5">Horse List</span>
      <div class="d-flex gap-2">
        <v-btn size="medium" color="primary" @click="horseMethods.generate">
          Generate Horses
        </v-btn>
        <v-btn size="medium" color="error" @click="horseMethods.clear" :disabled="!horses.length">
          Clear All
        </v-btn>
      </div>
    </v-card-title>

    <v-card-text>
      <BaseTable
        :headers="headers"
        :items="horses || []"
        :loading="loading"
        no-data-text="No horses found"
        no-data-subtext="Generate some horses to get started"
        items-per-page="20"
        hide-default-footer
      >
        <template v-slot:[`item.color`]="{ item }">
          <v-chip :color="item.color" size="small" variant="flat" class="text-white">
            {{ item.color }}
          </v-chip>
        </template>

        <template v-slot:[`item.condition`]="{ item }">
          <v-progress-linear
            :model-value="item.condition"
            :color="getConditionColor(item.condition)"
            height="20"
            rounded
          >
            <span class="text-caption font-weight-bold">{{ item.condition }}%</span>
          </v-progress-linear>
        </template>
      </BaseTable>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'

import { useHorseStore } from '../stores/HorseStore'
import BaseTable from '@core/components/BaseTable.vue'

import type { ITableHeader } from '@core/types'
import type { IHorse } from '../types'

const horseStore = useHorseStore()

// Computed properties
const horses = computed(() => horseStore.list)
const loading = computed(() => horseStore.loading)

const headers: ITableHeader<IHorse>[] = [
  { title: 'Name', key: 'name', sortable: true },
  { title: 'Color', key: 'color', sortable: true },
  { title: 'Condition', key: 'condition', sortable: true },
]

const horseMethods = {
  generate: () => {
    horseStore.generate()
  },
  clear: () => {
    horseStore.clear()
  },
}

const getConditionColor = (condition: number): string => {
  if (condition >= 80) return 'success'
  if (condition >= 60) return 'warning'
  if (condition >= 40) return 'orange'
  return 'error'
}

onMounted(() => {
  horseStore.load()
})
</script>
