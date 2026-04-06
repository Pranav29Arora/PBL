import axios from 'axios'

const baseURL = import.meta.env.VITE_API_URL?.trim() || ''

export const api = axios.create({
  baseURL,
  timeout: 120000,
  headers: { 'Content-Type': 'application/json' },
})

/**
 * @param {{ symbol: string }} payload
 */
export async function predictClosing(payload) {
  const { data } = await api.post('/api/predict', {
    symbol: payload.symbol.trim().toUpperCase(),
  })
  return data
}
