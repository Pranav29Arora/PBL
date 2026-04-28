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

export function getTheme() {
  return readJson(THEME_KEY, 'light')
}

export function setTheme(mode) {
  writeJson(THEME_KEY, mode)
}
