<template>
  <v-main>
    <!-- Game Header -->
    <v-app-bar color="primary" dark elevation="2">
      <v-toolbar-title class="text-h5 font-weight-bold">
        Horse Racing Championship
      </v-toolbar-title>

      <v-spacer />

      <!-- Game Progress -->
      <div v-if="gameState !== 'idle'" class="mr-4">
        <div class="text-caption">Round {{ currentRound }} / {{ TOTAL_ROUNDS }}</div>
        <v-progress-linear
          :model-value="progressPercentage"
          height="4"
          color="warning"
          bg-color="primary-darken-2"
          rounded
        />
      </div>

      <!-- Action Buttons -->
      <div class="d-flex gap-2">
        <!-- Generate Program Button -->
        <v-btn
          v-if="gameState === 'idle' || gameState === 'scheduled'"
          color="info"
          variant="elevated"
          size="large"
          @click="generateProgram"
          :loading="loading"
        >
          <v-icon start>mdi-calendar-plus</v-icon>
          Generate Program
        </v-btn>

        <!-- Start/Pause Button -->
        <v-btn
          v-if="gameState === 'scheduled' || gameState === 'racing'"
          :color="getStartPauseButtonColor()"
          variant="elevated"
          size="large"
          @click="startOrPauseRace"
          :loading="loading"
          :disabled="gameState === 'scheduled' && races.length === 0"
        >
          <v-icon start>{{ getStartPauseButtonIcon() }}</v-icon>
          {{ getStartPauseButtonText() }}
        </v-btn>

        <!-- New Game Button -->
        <v-btn
          v-if="gameState === 'completed'"
          color="success"
          variant="elevated"
          size="large"
          @click="resetGame"
          :loading="loading"
        >
          <v-icon start>mdi-refresh</v-icon>
          New Game
        </v-btn>
      </div>
    </v-app-bar>

    <!-- Main Content -->
    <v-container fluid class="pa-4">
      <div>
        <v-row>
          <v-col cols="12">
            <RaceTrack :race="currentRace" />
          </v-col>
        </v-row>

        <!-- Side panels during racing -->
        <v-row class="mt-4">
          <v-col cols="12" md="3">
            <HorseList />
          </v-col>

          <spacer />

          <v-col cols="12" md="3">
            <RaceSchedule />
          </v-col>

          <v-col cols="12" md="3">
            <GameResults />
          </v-col>
        </v-row>
      </div>
    </v-container>

    <!-- Error Snackbar -->
    <v-snackbar v-model="showError" color="error" timeout="5000" location="top right">
      {{ error }}
      <template v-slot:actions>
        <v-btn variant="text" @click="clearError">Close</v-btn>
      </template>
    </v-snackbar>
  </v-main>
</template>

<script setup lang="ts">
import { HorseList } from '@horses'
import { RaceSchedule } from '@/modules/racing'
import { GameResults } from '@/modules/results'
</script>

<style scoped>
.v-main {
  min-height: 100%;
  width: 100%;
}
</style>
