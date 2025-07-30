<template>
  <v-btn
    :loading="loading"
    color="white"
    variant="elevated"
    size="large"
    @click="handleGenerateProgram"
  >
    <v-icon start>mdi-refresh</v-icon>
    {{ buttonText }}
  </v-btn>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRaceStore } from '../stores/RaceStore'
import { useResultsStore } from '@results/stores/ResultsStore'
import { useRaceGame } from '../composables/useRaceGame'
import { storeToRefs } from 'pinia'

const raceStore = useRaceStore()
const resultsStore = useResultsStore()
const { isRacing, resetRace } = useRaceGame()
const { loading, list: races } = storeToRefs(raceStore)

const buttonText = computed(() => {
  return races.value.length > 0 ? 'Restart Program' : 'Generate Race Program'
})

const handleGenerateProgram = (): void => {
  if (isRacing.value) {
    resetRace()
  }
  
  raceStore.clear()
  resultsStore.clear()

  raceStore.generate()
}
</script>
