<template>
  <v-main class="pa-6">
    <v-container fluid>
      <HorseList />
    </v-container>
  </v-main>
</template>

<script setup lang="ts">
import { HorseList } from '@horses'
</script>

<style scoped>
.v-main {
  min-height: 100vh;
  width: 100%;
}
</style>
