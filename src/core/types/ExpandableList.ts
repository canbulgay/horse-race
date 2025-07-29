import type { ITableHeader } from './BaseTable'

export interface IExpandableListProps<T, U extends Record<string, any> = any> {
  title: string
  items: T[]
  loading?: boolean
  loadingText?: string
  noDataTitle?: string
  noDataSubtext?: string
  headers: ITableHeader<U>[]
  tableNoDataText?: string
  tableNoDataSubtext?: string
  getItemKey: (item: T, index: number) => string | number
  getItemTitle: (item: T, index: number) => string
  getTableItems: (item: T) => U[]
  activePanelValue?: number
}

export interface IExpandableListEmits {
  (e: 'update:activePanelValue', value: number): void
}