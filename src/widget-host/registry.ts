export type WidgetManifest = {
  name: string
  version: string
  widgets: Array<{ id: string; entry?: string; style?: string; areas?: string[] }>
}

export async function loadManifest(pkg: string): Promise<WidgetManifest | null> {
  // Try server endpoint first
  try {
    const res = await fetch(`/api/registry/${pkg}`, { credentials: 'include' })
    if (res.ok) {
      return (await res.json()) as WidgetManifest
    }
  } catch (e) {
    // ignore network errors and fallback to local
  }
  // Fallback to local manifests under src/registry/manifests
  try {
    const mod = await import(/* @vite-ignore */ `../registry/manifests/${pkg}.json`)
    return (mod.default ?? mod) as WidgetManifest
  } catch (e) {
    console.warn('Manifest not found for package', pkg, e)
    return null
  }
}