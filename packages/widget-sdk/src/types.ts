export type WidgetContext = {
  el: HTMLElement
  config: Record<string, any>
  env: 'dev' | 'prod' | 'staging'
  api: {
    get: (path: string) => Promise<any>
    post: (path: string, body: any) => Promise<any>
  }
  events: {
    on: (event: string, cb: (payload: any) => void) => () => void
    emit: (event: string, payload?: any) => void
  }
  storage: {
    get: (key: string) => Promise<any>
    set: (key: string, value: any) => Promise<void>
  }
  i18n: (key: string) => string
}

export interface WidgetModule {
  mount: (ctx: WidgetContext) => Promise<void> | void
  update?: (ctx: WidgetContext) => Promise<void> | void
  unmount?: (ctx: WidgetContext) => Promise<void> | void
}