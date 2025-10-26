import type { WidgetContext, WidgetModule } from '../../packages/widget-sdk/src/types'
import { createVueWidgetAdapter } from '../../packages/widget-sdk/src/vueAdapter'
import { loadManifest, type WidgetManifest } from './registry'
import { loadCompatModule } from './compat-registry'

export type HostProviders = {
  api?: { get: (p: string) => Promise<any>; post: (p: string, b: any) => Promise<any> }
  events?: { on: (e: string, cb: (p: any) => void) => () => void; emit: (e: string, p?: any) => void }
  storage?: { get: (k: string) => Promise<any>; set: (k: string, v: any) => Promise<void> }
  i18n?: (key: string) => string
}

type MountedInstance = { module: WidgetModule; ctx: WidgetContext }

export class WidgetHost {
  private instances = new Map<HTMLElement, MountedInstance>()
  private providers: Required<HostProviders>

  constructor(providers: HostProviders = {}) {
    this.providers = {
      api: providers.api ?? {
        get: async (p: string) => {
          const res = await fetch(p, { credentials: 'include' })
          return res.json()
        },
        post: async (p: string, b: any) => {
          const res = await fetch(p, {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(b)
          })
          return res.json()
        }
      },
      events: providers.events ?? createSimpleEmitter(),
      storage: providers.storage ?? createLocalStorageProvider(),
      i18n: providers.i18n ?? ((k: string) => k)
    }
  }

  async mountWidget(el: HTMLElement, ref: string, config: Record<string, any> = {}): Promise<void> {
    const [pkg, widgetId] = parseRef(ref)

    const module = await this.resolveModule(pkg, widgetId)
    const ctx: WidgetContext = {
      el,
      config,
      env: (import.meta as any).env?.MODE === 'production' ? 'prod' : ((import.meta as any).env?.MODE === 'staging' ? 'staging' : 'dev'),
      api: this.providers.api,
      events: this.providers.events,
      storage: this.providers.storage,
      i18n: this.providers.i18n
    }

    await module.mount(ctx)
    this.instances.set(el, { module, ctx })
  }

  async updateWidget(el: HTMLElement, config: Record<string, any>): Promise<void> {
    const inst = this.instances.get(el)
    if (!inst) return
    inst.ctx.config = config
    await (inst.module.update?.(inst.ctx) ?? inst.module.mount(inst.ctx))
  }

  async unmountWidget(el: HTMLElement): Promise<void> {
    const inst = this.instances.get(el)
    if (!inst) return
    await inst.module.unmount?.(inst.ctx)
    this.instances.delete(el)
  }

  private async resolveModule(pkg: string, widgetId: string): Promise<WidgetModule> {
    // Try internal manifest-based resolution
    const manifest = await loadManifest(pkg)
    const entry = manifest?.widgets?.find((w: WidgetManifest['widgets'][number]) => w.id === widgetId)?.entry
    if (entry) {
      try {
        const mod = await import(/* @vite-ignore */ entry)
        return (mod.default ?? mod) as WidgetModule
      } catch (e) {
        console.warn('Dynamic import failed for entry', entry, e)
      }
    }
    // Fallback: compatibility registry maps to Vue components
    const compat = await loadCompatModule(widgetId)
    if (compat) return compat
    throw new Error(`Widget not found: ${pkg}:${widgetId}`)
  }
}

function parseRef(ref: string): [string, string] {
  const parts = ref.split(':')
  if (parts.length !== 2) throw new Error(`Invalid ref '${ref}', expected 'package:widgetId'`)
  return [parts[0], parts[1]]
}

function createSimpleEmitter() {
  const listeners = new Map<string, Set<(p: any) => void>>()
  return {
    on: (event: string, cb: (p: any) => void) => {
      const set = listeners.get(event) ?? new Set()
      set.add(cb)
      listeners.set(event, set)
      return () => set.delete(cb)
    },
    emit: (event: string, payload?: any) => {
      const set = listeners.get(event)
      if (!set) return
      for (const cb of set) cb(payload)
    }
  }
}

function createLocalStorageProvider() {
  return {
    async get(key: string) {
      const raw = localStorage.getItem(`fp_widget_${key}`)
      try { return raw ? JSON.parse(raw) : null } catch { return raw }
    },
    async set(key: string, value: any) {
      localStorage.setItem(`fp_widget_${key}`, JSON.stringify(value))
    }
  }
}