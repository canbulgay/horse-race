<template>
  <v-card class="horse-list-card d-flex flex-column">
    <v-card-title class="d-flex align-center justify-space-between">
      <span class="text-h5">Horse List</span>
      <v-btn size="medium" color="primary" class="pa-1" @click="horseMethods.generate">
        Generate Horses
      </v-btn>
    </v-card-title>

    <v-card-text class="horse-list-body pa-0">
      <BaseTable
        :headers="headers"
        :items="horses || []"
        :loading="loading"
        no-data-text="No horses found"
        no-data-subtext="Generate some horses to get started"
        items-per-page="20"
        height="800"
      >
        <template v-slot:[`item.colorName`]="{ item }">
          <v-chip :color="item.colorHex" size="small" variant="flat" class="text-white">
            {{ item.colorName }}
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
import { onMounted } from 'vue'
import { storeToRefs } from 'pinia'

import { BaseTable } from '@core/components'
import { useHorseStore } from '../stores/HorseStore'

import type { ITableHeader } from '@core/types'
import type { IHorse } from '../types'

const horseStore = useHorseStore()
const { list: horses, loading } = storeToRefs(horseStore)

const headers: ITableHeader<IHorse>[] = [
  { title: 'Name', key: 'name', sortable: true },
  { title: 'Color', key: 'colorName', sortable: true },
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
  if (horses.value.length === 0) {
    horseStore.generate()
  }
})
</script>

<style scoped>
.horse-list-card {
  height: 800px;
}
.horse-list-body {
  flex: 1 1 auto;
  overflow-y: auto;
}
</style>
