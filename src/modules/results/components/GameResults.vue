<template>
  <GenericListComponent
    title="Race Results"
    :items="races"
    :loading="loading"
    loading-text="Loading results..."
    no-data-title="No Results Yet"
    no-data-subtext="Race results will appear here after each round."
    :headers="headers"
    table-no-data-text="No horses in this race"
    table-no-data-subtext="Something went wrong"
    :get-item-key="(race, index) => race.round"
    :get-item-title="(race, index) => `Round ${index + 1} - ${race.distance}m`"
    :get-table-items="raceHorsesWithPosition"
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
      <v-chip
        :color="item.horse.colorHex"
        size="small"
        variant="flat"
        class="text-white"
      >
        {{ item.horse.name }}
      </v-chip>
    </template>
  </GenericListComponent>
</template>

<script setup lang="ts">
import { BaseTable, GenericListComponent } from '@core/components'
import type { ITableHeader } from '@core/types'
import { onMounted, ref } from 'vue'
import type { IHorse } from '@/modules/horses'
import type { IRace } from '@/modules/racing/types'
import { useRaceStore } from '@/modules/racing'
import { storeToRefs } from 'pinia'


const headers: ITableHeader<{ position: number; horse: IHorse }>[] = [
  { title: 'Position', key: 'position', sortable: false },
  { title: 'Horse', key: 'horse', sortable: false },
]

const raceStore = useRaceStore()
const { list: races, loading } = storeToRefs(raceStore)

const raceHorsesWithPosition = (race: IRace) => {
  return race.horses.map((horse, index) => ({
    position: index + 1,
    horse: horse,
  }))
}
// Simple position colors
const getPositionColor = (position: number): string => {
  if (position === 1) return '#FFD700' // Gold
  if (position === 2) return '#C0C0C0' // Silver
  if (position === 3) return '#CD7F32' // Bronze
  return 'primary'
}

onMounted(() => {
  raceStore.load()
})
</script>

