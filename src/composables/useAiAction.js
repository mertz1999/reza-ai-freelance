import { ref } from 'vue'

export const useAiAction = (action) => {
  const loading = ref(false)
  const error = ref('')
  const mode = ref('mock')
  const data = ref(null)
  const meta = ref(null)

  const run = async (...args) => {
    loading.value = true
    error.value = ''

    try {
      const response = await action(...args)
      mode.value = response.mode || 'mock'
      data.value = response.data
      meta.value = response.meta || null
      return response
    } catch (err) {
      error.value = err?.message || 'Something went wrong'
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    loading,
    error,
    mode,
    data,
    meta,
    run,
  }
}
