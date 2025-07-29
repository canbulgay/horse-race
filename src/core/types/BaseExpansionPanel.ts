export interface IBaseExpansionPanelProps<T> {
  items: T[]
  getItemKey: (item: T, index: number) => string | number
  getItemTitle: (item: T, index: number) => string
  modelValue?: number
}

export interface IBaseExpansionPanelEmits {
  (e: 'update:modelValue', value: number): void
}