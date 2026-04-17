const SESSION_KEY = 'user_openai_api_key'

export const getUserApiKey = () => sessionStorage.getItem(SESSION_KEY) || ''

export const setUserApiKey = (value) => {
  const key = String(value || '').trim()
  if (!key) return
  sessionStorage.setItem(SESSION_KEY, key)
}

export const clearUserApiKey = () => {
  sessionStorage.removeItem(SESSION_KEY)
}

export const hasUserApiKey = () => Boolean(getUserApiKey())
