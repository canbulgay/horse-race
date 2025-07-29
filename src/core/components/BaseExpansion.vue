<template>
  <v-expansion-panels v-model="activePanel" accordion>
    <v-expansion-panel v-for="(item, index) in items" :key="getItemKey(item, index)">
      <v-expansion-panel-title class="d-flex align-center justify-space-between">
        <span class="text-body-1 font-weight-bold">
          {{ getItemTitle(item, index) }}
        </span>
        <template v-slot:actions="{ expanded }">
          <v-icon
            :color="!expanded ? 'teal' : ''"
            :icon="expanded ? 'mdi-pencil' : 'mdi-check'"
          ></v-icon>
        </template>
      </v-expansion-panel-title>
      <v-expansion-panel-text>
        <slot 
          name="content" 
          :item="item" 
          :index="index"
          v-bind="$attrs"
        />
      </v-expansion-panel-text>
    </v-expansion-panel>
  </v-expansion-panels>
</template>

<script setup lang="ts" generic="T">
import { ref, watch } from 'vue'

interface Props {
  items: T[]
  getItemKey: (item: T, index: number) => string | number
  getItemTitle: (item: T, index: number) => string
  modelValue?: number
}

interface Emits {
  (e: 'update:modelValue', value: number): void
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: 0
})

const emit = defineEmits<Emits>()

const activePanel = ref(props.modelValue)

// Watch for external changes to modelValue
watch(() => props.modelValue, (newValue) => {
  activePanel.value = newValue
})

// Emit changes back to parent
watch(activePanel, (newValue) => {
  emit('update:modelValue', newValue)
})
</script>