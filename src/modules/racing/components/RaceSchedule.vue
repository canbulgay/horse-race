<template>
  <v-card class="race-list-card">
    <v-card-title class="d-flex align-center justify-space-between">
      <span class="text-h5">Race Schedule</span>
      <v-btn size="medium" color="success" class="pa-1" @click="raceMethods.generate">
        Generate Schedules
      </v-btn>
    </v-card-title>

    <v-card-text class="race-list-body">
      <div v-if="loading" class="text-center pa-4">
        <v-progress-circular indeterminate color="primary" />
        <p class="text-body-2 mt-2">Loading races...</p>
      </div>

      <div v-else-if="races.length === 0" class="text-center pa-4">
        <p class="text-h6 mt-2">No race schedules found</p>
        <p class="text-body-2 text-grey">Generate race schedules to get started</p>
      </div>

      <div v-else class="d-flex flex-column gap-4">
        <v-card v-for="race in races" :key="race.round" variant="outlined" class="mb-4">
          <v-card-title class="d-flex align-center justify-space-between bg-primary">
            <span class="text-h6 text-white">Round {{ race.round }}</span>
            <span class="text-subtitle-1 text-white"> {{ race.distance }} meters </span>
            <v-chip :color="getStatusColor(race.status)" size="small" variant="flat">
              {{ race.status || 'pending' }}
            </v-chip>
          </v-card-title>

          <v-card-text class="pa-0">
            <BaseTable
              :headers="raceHeaders"
              :items="raceHorsesWithPosition(race)"
              no-data-text="No horses in this race"
              no-data-subtext="Something went wrong"
              hide-default-footer
            >
              <template v-slot:[`item.position`]="{ item }">
                <v-chip color="primary" size="small" variant="outlined" class="font-weight-bold">
                  {{ item.position }}
                </v-chip>
              </template>

              <template v-slot:[`item.horse`]="{ item }">
                <div class="d-flex align-center gap-2">
                  <v-chip
                    :color="item.horse.colorHex"
                    size="small"
                    variant="flat"
                    class="text-white"
                  >
                    {{ item.horse.name }}
                  </v-chip>
                </div>
              </template>
            </BaseTable>
          </v-card-text>
        </v-card>
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { onMounted, watch } from 'vue'
import { storeToRefs } from 'pinia'

import { BaseTable } from '@core/components'
import { useRaceStore } from '../stores/RaceStore'

import type { ITableHeader } from '@core/types'
import type { IRace } from '../types'
import type { IHorse } from '@horses/types'

const raceStore = useRaceStore()
const { list: races, loading } = storeToRefs(raceStore)

// Headers for individual race tables
const raceHeaders: ITableHeader<{ position: number; horse: IHorse }>[] = [
  { title: 'Position', key: 'position', sortable: false },
  { title: 'Horse', key: 'horse', sortable: false },
]

const raceMethods = {
  generate: () => {
    raceStore.generate()
  },
}
// Transform race horses to include position
const raceHorsesWithPosition = (race: IRace) => {
  return race.horses.map((horse, index) => ({
    position: index + 1,
    horse: horse,
  }))
}

const getStatusColor = (status?: string): string => {
  switch (status) {
    case 'active':
      return 'success'
    case 'finished':
      return 'info'
    case 'pending':
    default:
      return 'warning'
  }
}

onMounted(() => {
  raceStore.load()
})
</script>

<style scoped>
.race-list-card {
  height: 800px;
  overflow: auto;
}
.race-list-body {
  flex: 1 1 auto;
  overflow: auto;
}
</style>
