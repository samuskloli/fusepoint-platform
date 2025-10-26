import type { WidgetModule } from '../../packages/widget-sdk/src/types'
import { createVueWidgetAdapter } from '../../packages/widget-sdk/src/vueAdapter'

export async function loadCompatModule(widgetId: string): Promise<WidgetModule | null> {
  // Minimal compatibility mapping. Extend as needed during migration.
  switch (widgetId) {
    case 'stats-card': {
      const mod = await import('@/components/widgets/StatsWidget.vue')
      return createVueWidgetAdapter(mod.default, {
        mapProps: (ctx) => ({ config: ctx.config })
      })
    }
    default:
      return null
  }
}