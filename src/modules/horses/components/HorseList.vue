<template>
  <BaseCard
    title="Horse List"
    :loading="loading"
    :is-empty="(horses || []).length === 0"
    loading-text="Loading horses..."
    no-data-title="No horses found"
    no-data-subtext="Generate some horses to get started"
    card-class="horse-list-card d-flex flex-column"
    body-class="horse-list-body pa-0"
  >
    <template #content>
      <BaseTable
        :headers="headers"
        :items="horses || []"
        :loading="false"
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
    </template>
  </BaseCard>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { storeToRefs } from 'pinia'

import { BaseTable, BaseCard } from '@core/components'
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
