export interface ITableHeader<T extends Record<string, any> = any> {
  title: string
  key: keyof T & string
  sortable?: boolean
  width?: string
}

export interface ITableItems<T extends Record<string, any> = any> {
  items: T[]
  headers: ITableHeader<T>[]
  loading?: boolean
  error?: string | null
  noDataText?: string
  noDataSubtext?: string
  itemValue?: string
}
