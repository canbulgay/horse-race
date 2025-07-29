export interface IBaseExpansionPanelProps<T> {
  items: T[]
  getItemKey: (item: T, index: number) => string | number
  getItemTitle: (item: T, index: number) => string
  activePanelValue?: number
}

export interface IBaseExpansionPanelEmits {
  (e: 'update:activePanelValue', value: number): void
}