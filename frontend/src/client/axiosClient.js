import axios from 'axios'

const baseURL = (import.meta.env.VITE_API_URL || '/api').replace(/\/$/, '')

const axiosClient = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
})

function extractError(data) {
  if (!data) return null
  if (typeof data === 'string') return data
  const detail = data.detail
  if (!detail) return null
  if (typeof detail === 'string') return detail
  if (Array.isArray(detail)) {
    return detail
      .map((d) => {
        const field = Array.isArray(d.loc) ? d.loc[d.loc.length - 1] : ''
        return field ? `${field}: ${d.msg}` : d.msg
      })
      .join('; ')
  }
  return JSON.stringify(detail)
}

axiosClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    let message
    if (error.response) {
      message =
        extractError(error.response.data) ||
        `Request failed (${error.response.status})`
    } else if (error.request) {
      message = 'Network error: could not reach the API server'
    } else {
      message = error.message || 'Unexpected error'
    }
    return Promise.reject(new Error(message))
  }
)

export default axiosClient
