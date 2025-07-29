<template>
  <v-card class="leaderboard-card">
    <v-card-title class="d-flex align-center bg-success">
      <span class="text-h5 text-white">Championship Complete!</span>
    </v-card-title>

    <v-card-text class="pa-4">
      <v-row justify="center" class="text-center">
        <v-col cols="12" md="6">
          <v-card variant="outlined" class="mb-4">
            <v-card-title class="text-h6 bg-yellow-lighten-4"> Overall Champion </v-card-title>
            <v-card-text v-if="overallWinner" class="text-center py-4">
              <v-chip
                :color="overallWinner.horse.colorHex"
                size="x-large"
                variant="flat"
                class="text-white font-weight-bold mb-2"
              >
                {{ overallWinner.horse.name }}
              </v-chip>
              <div class="text-h6">{{ overallWinner.wins }} Wins</div>
              <div class="text-body-2">{{ overallWinner.totalRounds }} Total Races</div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <div class="round-results">
        <v-row>
          <v-col v-for="result in sortedResults" :key="result.round" cols="12" sm="6" md="4" lg="3">
            <v-card variant="outlined" class="result-card">
              <v-card-title class="text-center bg-grey-lighten-4 py-2">
                <div class="text-subtitle-1 font-weight-bold">Round {{ result.round }}</div>
                <div class="text-caption">{{ result.distance || 1000 }}m</div>
              </v-card-title>

              <v-card-text class="pa-3">
                <div
                  v-for="(horse, index) in result.horses.slice(0, 3)"
                  :key="horse.id"
                  class="d-flex align-center mb-2"
                >
                  <v-chip
                    :color="getPositionColor(index + 1)"
                    size="small"
                    variant="flat"
                    class="text-white font-weight-bold me-2"
                    style="min-width: 24px"
                  >
                    {{ index + 1 }}
                  </v-chip>

                  <v-chip
                    :color="horse.colorHex"
                    size="small"
                    variant="flat"
                    class="text-white flex-grow-1"
                    style="justify-content: flex-start"
                  >
                    {{ horse.name }}
                  </v-chip>
                </div>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useResultsStore } from '@results/stores/ResultsStore'
import { storeToRefs } from 'pinia'
import type { IHorse } from '@horses/types'

const resultsStore = useResultsStore()
const { list: results } = storeToRefs(resultsStore)

const sortedResults = computed(() => {
  return [...results.value].sort((a, b) => a.round - b.round)
})

const totalRounds = computed(() => results.value.length)

const uniqueHorses = computed(() => {
  const allHorses = new Set<number>()
  results.value.forEach((result) => {
    result.horses.forEach((horse) => allHorses.add(horse.id))
  })
  return allHorses.size
})

// Calculate overall winner (horse with most wins)
const overallWinner = computed(() => {
  const horseStats = new Map<number, { horse: IHorse; wins: number; totalRounds: number }>()

  results.value.forEach((result) => {
    result.horses.forEach((horse, index) => {
      if (!horseStats.has(horse.id)) {
        horseStats.set(horse.id, { horse, wins: 0, totalRounds: 0 })
      }

      const stats = horseStats.get(horse.id)!
      stats.totalRounds++

      // First place = win
      if (index === 0) {
        stats.wins++
      }
    })
  })

  let winner = null
  let maxWins = 0

  for (const stats of horseStats.values()) {
    if (stats.wins > maxWins) {
      maxWins = stats.wins
      winner = stats
    }
  }

  return winner
})

const getPositionColor = (position: number): string => {
  if (position === 1) return '#FFD700' // Gold
  if (position === 2) return '#C0C0C0' // Silver
  if (position === 3) return '#CD7F32' // Bronze
  return 'primary'
}
</script>

<style scoped>
.leaderboard-card {
  height: 800px;
  overflow-y: auto;
}

.result-card {
  height: 100%;
  transition: transform 0.2s ease;
}

.result-card:hover {
  transform: translateY(-2px);
}

.round-results {
  margin-top: 16px;
}
</style>
