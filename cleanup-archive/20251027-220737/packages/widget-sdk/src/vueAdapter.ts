import { createApp } from 'vue'
import type { Component } from 'vue'
import type { WidgetContext, WidgetModule } from './types'

export type VueAdapterOptions<Props extends Record<string, any> = Record<string, any>> = {
  mapProps?: (ctx: WidgetContext) => Props
  beforeMount?: (ctx: WidgetContext) => void | Promise<void>
  afterMount?: (ctx: WidgetContext, app: ReturnType<typeof createApp>) => void | Promise<void>
  beforeUnmount?: (ctx: WidgetContext) => void | Promise<void>
}

export function createVueWidgetAdapter<ComponentProps extends Record<string, any> = Record<string, any>>(
  Component: Component,
  options: VueAdapterOptions<ComponentProps> = {}
): WidgetModule {
  let app: ReturnType<typeof createApp> | null = null

  const mount = async (ctx: WidgetContext) => {
    await options.beforeMount?.(ctx)

    const props = options.mapProps ? options.mapProps(ctx) : { config: ctx.config }
    app = createApp(Component, props)

    // Provide common context pieces if components want to inject them
    app.provide('widgetContext', ctx)
    app.provide('widgetI18n', ctx.i18n)

    app.mount(ctx.el)
    await options.afterMount?.(ctx, app)
  }

  const update = async (ctx: WidgetContext) => {
    // Simple strategy: remount with new props. This is safe and predictable.
    if (app) {
      app.unmount()
      const props = options.mapProps ? options.mapProps(ctx) : { config: ctx.config }
      app = createApp(Component, props)
      app.provide('widgetContext', ctx)
      app.provide('widgetI18n', ctx.i18n)
      app.mount(ctx.el)
    } else {
      await mount(ctx)
    }
  }

  const unmount = async (ctx: WidgetContext) => {
    await options.beforeUnmount?.(ctx)
    if (app) {
      app.unmount()
      // Clean container to avoid leftover DOM
      ctx.el.innerHTML = ''
      app = null
    }
  }

  return { mount, update, unmount }
}