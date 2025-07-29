<template>
  <ExpandableList
    title="Race Schedule"
    :items="races"
    :loading="loading"
    loading-text="Loading races..."
    no-data-title="No race schedules found"
    no-data-subtext="Generate race schedules to get started"
    :headers="raceHeaders"
    table-no-data-text="No horses in this race"
    table-no-data-subtext="Something went wrong"
    :get-item-key="(race, index) => race.round"
    :get-item-title="(race, index) => `Round ${index + 1} - ${race.distance}m`"
    :get-table-items="raceHorsesWithPosition"
    :active-panel-value="nextRound - 1"
  >
    <template v-slot:[`item.position`]="{ item }">
      <v-chip color="primary" size="small" variant="flat" class="font-weight-bold">
        {{ item.position }}
      </v-chip>
    </template>

    <template v-slot:[`item.horse`]="{ item }">
      <div class="d-flex align-center gap-2">
        <v-chip :color="item.horse.colorHex" size="small" variant="flat" class="text-white">
          {{ item.horse.name }}
        </v-chip>
      </div>
    </template>
  </ExpandableList>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { storeToRefs } from 'pinia'

import { ExpandableList } from '@core/components'
import { useRaceStore } from '../stores/RaceStore'

import type { ITableHeader } from '@core/types'
import type { IRace } from '../types'
import type { IHorse } from '@horses/types'

const raceStore = useRaceStore()
const { list: races, loading, nextRound } = storeToRefs(raceStore)

const raceHeaders: ITableHeader<{ position: number; horse: IHorse }>[] = [
  { title: 'Position', key: 'position', sortable: false },
  { title: 'Horse', key: 'horse', sortable: false },
]

const raceHorsesWithPosition = (race: IRace) => {
  return race.horses.map((horse, index) => ({
    position: index + 1,
    horse: horse,
  }))
}

onMounted(() => {
  raceStore.load()
})
</script>
