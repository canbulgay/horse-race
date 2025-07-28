<template>
  <v-main>
    <v-nav-bar class="d-flex justify-space-between pa-4">
      <v-toolbar-title> Horse Racing Day </v-toolbar-title>
      <v-spacer />
      <v-btn> Generate Program </v-btn>
    </v-nav-bar>
    <v-container class="d-flex flex-row justify-space-between" fluid>
      <HorseList />
      <RaceSchedule />
    </v-container>
  </v-main>
</template>

<script setup lang="ts">
import { HorseList } from '@horses'
import { RaceSchedule } from '@/modules/racing'
</script>

<style scoped>
.v-main {
  min-height: 100%;
  width: 100%;
}
</style>
