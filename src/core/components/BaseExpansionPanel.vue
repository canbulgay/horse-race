<template>
  <v-expansion-panels v-model="activePanel" accordion>
    <v-expansion-panel v-for="(item, index) in items" :key="getItemKey(item, index)">
      <v-expansion-panel-title class="d-flex align-center justify-space-between">
        <span class="text-body-1 font-weight-bold">
          {{ getItemTitle(item, index) }}
        </span>
        <template v-slot:actions="{ expanded }">
          <v-icon :color="getIconColor(item, expanded)" :icon="getIcon(item, expanded)"></v-icon>
        </template>
      </v-expansion-panel-title>
      <v-expansion-panel-text>
        <slot name="content" :item="item" :index="index" v-bind="$attrs" />
      </v-expansion-panel-text>
    </v-expansion-panel>
  </v-expansion-panels>
</template>

<script setup lang="ts" generic="T">
import { ref, watch } from 'vue'
import type { IBaseExpansionPanelProps, IBaseExpansionPanelEmits } from '@core/types'

const props = withDefaults(defineProps<IBaseExpansionPanelProps<T>>(), {
  activePanelValue: 0,
})

const emit = defineEmits<IBaseExpansionPanelEmits>()

const activePanel = ref(props.activePanelValue)

watch(
  () => props.activePanelValue,
  (newValue) => {
    activePanel.value = newValue
  },
)

watch(activePanel, (newValue) => {
  emit('update:activePanelValue', newValue)
})

const getIcon = (item: T, expanded: boolean): string => {
  if (hasStatus(item)) {
    return item.status === 'finished' ? 'mdi-check' : 'mdi-clock-outline'
  }

  return expanded ? 'mdi-chevron-up' : 'mdi-chevron-down'
}

const getIconColor = (item: T, expanded: boolean): string => {
  if (hasStatus(item)) {
    return item.status === 'finished' ? 'teal' : 'warning'
  }

  return ''
}

const hasStatus = (item: T): item is T & { status: string } => {
  return typeof item === 'object' && item !== null && 'status' in item
}
</script>
