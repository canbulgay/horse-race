<template>
  <v-main>
    <!-- Game Header -->
    <v-app-bar color="primary" dark elevation="2">
      <v-toolbar-title class="text-h5 font-weight-bold">
        Horse Racing Championship
      </v-toolbar-title>
      <v-spacer></v-spacer>
      <GenerateProgramButton class="mr-2" />
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
  </v-main>
</template>

<script setup lang="ts">
import { HorseList } from '@horses'
import { RaceSchedule, RaceTrack, GenerateProgramButton } from '@/modules/racing'
import { GameResults } from '@/modules/results'
</script>

<style scoped>
.v-main {
  min-height: 100%;
  width: 100%;
}
</style>
