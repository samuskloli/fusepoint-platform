# @fusepoint/widget-sdk

Contrat commun pour les widgets et helpers d’adaptation.

## Contrat TypeScript

```ts
export type WidgetContext = {
  el: HTMLElement;
  config: Record<string, any>;
  env: 'dev' | 'prod' | 'staging';
  api: { get: (p: string) => Promise<any>; post: (p: string, b: any) => Promise<any> };
  events: { on: (e: string, cb: (p: any) => void) => () => void; emit: (e: string, p?: any) => void };
  storage: { get: (k: string) => Promise<any>; set: (k: string, v: any) => Promise<void> };
  i18n: (key: string) => string;
};

export interface WidgetModule {
  mount(ctx: WidgetContext): Promise<void> | void;
  update?(ctx: WidgetContext): Promise<void> | void;
  unmount?(ctx: WidgetContext): Promise<void> | void;
}
```

## Adapter Vue

```ts
import StatsWidget from '@/components/widgets/StatsWidget.vue'
import { createVueWidgetAdapter } from '@fusepoint/widget-sdk'

export default createVueWidgetAdapter(StatsWidget, {
  mapProps: (ctx) => ({ config: ctx.config })
})
```

## Comment déclarer un widget

- Créez votre widget en exposant `WidgetModule` (avec `mount/update/unmount`).
- Option 1 (recommandée) : écrivez un module directement compatible.
- Option 2 (compat) : enveloppez un composant Vue existant avec `createVueWidgetAdapter`.
- Ajoutez un manifest JSON décrivant vos widgets et leurs entrées.

## Exemple de manifest

```json
{
  "name": "fusepoint/core",
  "version": "1.0.0",
  "widgets": [
    { "id": "stats-card", "entry": "/widgets/stats-card/index.umd.js", "style": "/widgets/stats-card/style.css", "areas": ["dashboard-home"] }
  ]
}
```