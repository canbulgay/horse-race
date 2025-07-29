<template>
  <v-main>
    <!-- Game Header -->
    <v-app-bar color="primary" dark elevation="2">
      <v-toolbar-title class="text-h5 font-weight-bold">
        Horse Racing Championship
      </v-toolbar-title>
    </v-app-bar>

    <!-- Main Content -->
    <v-container fluid class="pa-4">
      <div>
        <!-- Side panels during racing -->
        <v-row class="mt-4">
          <v-col cols="12" md="3">
            <HorseList />
          </v-col>

          <v-col cols="12" md="5">
            <RaceTrack />
          </v-col>

          <v-col cols="12" md="2">
            <RaceSchedule />
          </v-col>

          <v-col cols="12" md="2">
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
import { RaceSchedule, RaceTrack } from '@/modules/racing'
import { GameResults } from '@/modules/results'
</script>

<style scoped>
.v-main {
  min-height: 100%;
  width: 100%;
}
</style>
