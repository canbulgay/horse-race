<template>
  <ExpandableList
    title="Race Results"
    :items="results"
    :loading="loading"
    loading-text="Loading results..."
    no-data-title="No Results Yet"
    no-data-subtext="Race results will appear here after each round is finished."
    :headers="headers"
    table-no-data-text="No horses in this race"
    table-no-data-subtext="Something went wrong"
    :get-item-key="(result, index) => result.round"
    :get-item-title="(result, index) => `Round ${result.round} - ${result.distance || 1000}m`"
    :get-table-items="raceHorsesWithPosition"
    :active-panel-value="lastFinishedRaceIndex"
  >
    <template v-slot:[`item.position`]="{ item }">
      <v-chip
        :color="getPositionColor(item.position)"
        size="small"
        variant="flat"
        class="text-white font-weight-bold"
      >
        {{ item.position }}
      </v-chip>
    </template>

    <template v-slot:[`item.horse`]="{ item }">
      <v-chip :color="item.horse.colorHex" size="small" variant="flat" class="text-white">
        {{ item.horse.name }}
      </v-chip>
    </template>
  </ExpandableList>
</template>

<script setup lang="ts">
import { ExpandableList } from '@core/components'
import type { ITableHeader } from '@core/types'
import { computed, onMounted } from 'vue'
import type { IHorse } from '@/modules/horses'
import type { IResult } from '../types'
import { useResultsStore } from '../stores/ResultsStore'
import { storeToRefs } from 'pinia'

const headers: ITableHeader<{ position: number; horse: IHorse }>[] = [
  { title: 'Position', key: 'position', sortable: false },
  { title: 'Horse', key: 'horse', sortable: false },
]

const resultsStore = useResultsStore()
const { list: results, loading } = storeToRefs(resultsStore)

const lastFinishedRaceIndex = computed(() => {
  return results.value.length - 1
})

const raceHorsesWithPosition = (result: IResult) => {
  return result.horses.map((horse, index) => ({
    position: index + 1,
    horse: horse,
  }))
}
const getPositionColor = (position: number): string => {
  if (position === 1) return '#FFD700'
  if (position === 2) return '#C0C0C0'
  if (position === 3) return '#CD7F32'
  return 'primary'
}

onMounted(() => {
  resultsStore.load()
})
</script>
