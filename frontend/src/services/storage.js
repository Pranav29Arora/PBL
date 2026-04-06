const USERS_KEY = 'stockvision_users'
const SESSION_KEY = 'stockvision_session'
const PREDICTIONS_KEY = 'stockvision_predictions'
const THEME_KEY = 'stockvision_theme'

function readJson(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return fallback
    return JSON.parse(raw)
  } catch {
    return fallback
  }
}

function writeJson(key, value) {
  localStorage.setItem(key, JSON.stringify(value))
}

export function getUsers() {
  return readJson(USERS_KEY, [])
}

export function saveUser(user) {
  const users = getUsers()
  if (users.some((u) => u.email.toLowerCase() === user.email.toLowerCase())) {
    return { ok: false, error: 'An account with this email already exists.' }
  }
  users.push({
    name: user.name,
    email: user.email.toLowerCase(),
    password: user.password,
  })
  writeJson(USERS_KEY, users)
  return { ok: true }
}

export function findUser(email, password) {
  const e = email.toLowerCase()
  return getUsers().find((u) => u.email === e && u.password === password) || null
}

export function getSession() {
  return readJson(SESSION_KEY, null)
}

export function setSession(session) {
  if (!session) {
    localStorage.removeItem(SESSION_KEY)
    return
  }
  writeJson(SESSION_KEY, session)
}

export function getPredictions() {
  const list = readJson(PREDICTIONS_KEY, [])
  return Array.isArray(list) ? list : []
}

export function appendPrediction(entry) {
  const list = getPredictions()
  list.unshift(entry)
  writeJson(PREDICTIONS_KEY, list)
  return list
}

export function getTheme() {
  return readJson(THEME_KEY, 'light')
}

export function setTheme(mode) {
  writeJson(THEME_KEY, mode)
}
