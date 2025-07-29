<template>
  <v-card :class="cardClass">
    <v-card-title v-if="title || $slots.title" :class="titleClass">
      <slot name="title">
        <span class="text-h5">{{ title }}</span>
      </slot>
      <slot name="title-actions" />
    </v-card-title>

    <v-card-text :class="contentClass">
      <div v-if="loading" class="text-center pa-4">
        <slot name="loading">
          <v-progress-circular indeterminate color="primary" />
          <p class="text-body-2 mt-2">{{ loadingText }}</p>
        </slot>
      </div>

      <div v-else-if="isEmpty" class="text-center pa-4">
        <slot name="no-data">
          <p class="text-h6 mt-2">{{ noDataTitle }}</p>
          <p class="text-body-2 text-grey">{{ noDataSubtext }}</p>
        </slot>
      </div>

      <div v-else :class="bodyClass">
        <slot name="content" />
      </div>
    </v-card-text>

    <v-card-actions v-if="$slots.actions">
      <slot name="actions" />
    </v-card-actions>
  </v-card>
</template>

<script setup lang="ts">
import type { IBaseCardProps } from '@core/types'

withDefaults(defineProps<IBaseCardProps>(), {
  loading: false,
  isEmpty: false,
  loadingText: 'Loading...',
  noDataTitle: 'No data found',
  noDataSubtext: 'No items available',
  cardClass: '',
  titleClass: 'd-flex align-center justify-space-between bg-info',
  contentClass: 'pa-0',
  bodyClass: 'pa-4',
})
</script>
