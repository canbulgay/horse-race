<template>
  <v-card class="horse-race-game">
    <v-card-title class="d-flex align-center justify-space-between bg-success">
      <span v-if="currentRace" class="text-h6 text-white">
        Round {{ currentRace.round }} - {{ currentRace?.distance }}m
      </span>
      <v-btn
        v-if="canStartRace"
        :color="isRacing && !isPaused ? 'orange' : 'white'"
        variant="outlined"
        @click="handleToggleRace"
      >
        Start Game
      </v-btn>
      <v-btn
        v-if="isRacing"
        :disabled="!isRacing"
        :color="isRacing && !isPaused ? 'orange' : 'white'"
        variant="outlined"
        @click="handleToggleRace"
      >
        {{ isPaused ? 'Resume' : 'Pause' }}
      </v-btn>
    </v-card-title>

    <v-card-text class="pa-4">
      <div class="race-track">
        <div v-for="horse in raceHorses" :key="horse.id" class="track-lane">
          <div class="track">
            <v-icon
              class="horse"
              icon="mdi-horse"
              size="20"
              :color="horse.colorHex"
              :data-horse-id="horse.id"
              :style="{
                transform: `translateX(${horsePositions[horse.id] || 0}px)`,
                transition: isRacing && !isPaused ? `transform ${animationSpeed}ms linear` : 'none',
              }"
            ></v-icon>

            <div class="finish-line"></div>
          </div>

          <div class="horse-info">
            <div class="horse-name">{{ horse.name }}</div>
          </div>
        </div>
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useRaceStore } from '../stores/RaceStore'
import { useRaceGame } from '../composables/useRaceGame'
import { useResultsStore } from '@results/stores/ResultsStore'
import type { IHorse } from '@horses/types'
import type { IRace } from '../types'

const raceStore = useRaceStore()
const resultsStore = useResultsStore()
const { list: races } = storeToRefs(raceStore)
const { list: raceResults } = storeToRefs(resultsStore)

const { isRacing, isPaused, raceResult, horsePositions, toggleRace, resetRace } = useRaceGame()

const animationSpeed = ref(100)
const currentRaceIndex = ref(0)

const currentRace = computed<IRace | null>(() => {
  return races.value[currentRaceIndex.value] || null
})

const raceHorses = computed<IHorse[]>(() => {
  return currentRace.value?.horses
})

const canStartRace = computed(() => {
  return raceResults?.value.length === 0 && !isRacing.value
})

const runAllRaces = async () => {
  for (let raceIndex = 0; raceIndex < races.value.length; raceIndex++) {
    currentRaceIndex.value = raceIndex
    const race = races.value[raceIndex]

    if (race && race.status !== 'finished') {
      console.log(`Starting Round ${race.round}`)
      await toggleRace(race)

      raceStore.updateRaceStatus(race.round, 'finished')

      if (raceResult.value) {
        const raceWithResult = {
          ...race,
          horses: raceResult.value.positions.map((position) => position.horse),
        }
        resultsStore.saveResult(raceWithResult)
        console.log(`Race result for round ${race.round} saved with race data`)
      }

      if (raceIndex < races.value.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, 1000))
        resetRace()
      }
    }
  }
  console.log('All races completed!')
}

const handleToggleRace = async () => {
  if (!currentRace.value) return

  if (!isRacing.value) {
    try {
      await runAllRaces()
    } catch (error) {
      console.error('Race error:', error)
    }
  } else {
    toggleRace(currentRace.value)
  }
}

onMounted(() => {
  raceStore.load()
})
</script>

<style scoped>
.horse-race-game {
  height: 600px;
  overflow: auto;
}

.race-info {
  text-align: center;
}

.race-track {
  position: relative;
  background: linear-gradient(90deg, #e8f5e8 0%, #f0f8f0 100%);
  border: 2px solid #4caf50;
  border-radius: 8px;
  padding: 20px;
  min-height: 400px;
}

.track-lane {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
  height: 35px;
  position: relative;
  gap: 5px;
}

.track {
  flex: 1;
  height: 30px;
  background: #8bc34a;
  border: 1px solid #689f38;
  border-radius: 15px;
  position: relative;
  overflow: hidden;
  margin-right: 10px;
}

.finish-line {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 3px;
  background: white;
  z-index: 2;
}

.start-line {
  left: 5px;
}

.finish-line {
  right: 5px;
}

.horse {
  position: absolute;
  left: 8px;
  top: 20%;
  transform: translateY(-50%);
  width: 25px;
  height: 25px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  z-index: 3;
}

.horse-info {
  width: 120px;
  text-align: left;
}

.horse-name {
  font-weight: bold;
  font-size: 12px;
  color: #333;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.horse-condition {
  font-size: 11px;
  color: #666;
}

.distance-markers {
  position: absolute;
  bottom: 5px;
  left: 50px;
  right: 130px;
  display: flex;
  justify-content: space-between;
}

.marker {
  font-size: 10px;
  font-weight: bold;
  color: #333;
  background: rgba(255, 255, 255, 0.8);
  padding: 2px 6px;
  border-radius: 4px;
}

.race-result {
  text-align: center;
}
</style>
