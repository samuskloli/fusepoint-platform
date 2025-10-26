import api from './api'

const base = '/api/linkpoints'

export default {
  async list() {
    const { data } = await api.get(base)
    return data
  },
  async listArchived() {
    const { data } = await api.get(`${base}/archived`)
    return data
  },
  async create(payload) {
    const { data } = await api.post(base, payload)
    return data
  },
  async detail(id) {
    const { data } = await api.get(`${base}/${id}`)
    return data
  },
  async update(id, payload) {
    const { data } = await api.put(`${base}/${id}`, payload)
    return data
  },
  async remove(id) {
    const { data } = await api.delete(`${base}/${id}`)
    return data
  },
  async duplicate(id) {
    const { data } = await api.post(`${base}/${id}/duplicate`)
    return data
  },
  async globalStats(range = 30) {
    const { data } = await api.get(`${base}/global-stats`, { params: { range } })
    return data
  },
  async geoStats(range = 30) {
    const { data } = await api.get(`${base}/geo-stats`, { params: { range } })
    return data
  },
  async statsByLink(range = 30) {
    const { data } = await api.get(`${base}/stats-by-link`, { params: { range } })
    return data
  },
  async reset(id, mode = 'hard') {
    const { data } = await api.post(`${base}/${id}/reset`, { mode })
    return data
  },
  async backupStatus() {
    const { data } = await api.get(`${base}/backup/status`)
    return data
  },
  async regenerateBackup(id) {
    const { data } = await api.post(`${base}/${id}/backup/regenerate`)
    return data
  },
  qrUrl(id) {
    return `${api.defaults.baseURL || ''}${base}/${id}/qr`
  },
  publicUrl(slug) {
    const w = typeof window !== 'undefined' ? window.location : null
    const originDefault = w ? w.origin : ''
    const host = w ? w.hostname : ''
    const isLocalHost = host === 'localhost' || host === '127.0.0.1'
    const devPublic = (import.meta.env.VITE_DEV_PUBLIC_URL || import.meta.env.VITE_LOCAL_NETWORK_URL || '').trim()
    const origin = (isLocalHost && devPublic && /^https?:\/\//.test(devPublic))
      ? devPublic.replace(/\/+$/, '')
      : originDefault
    return `${origin}/l/${slug}`
  },

}