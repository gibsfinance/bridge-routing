class ThemeStore {
  isDark = $state(false)

  toggle() {
    this.isDark = !this.isDark
    if (this.isDark) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }

  init() {
    // Check system preference on init
    this.isDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    if (this.isDark) {
      document.documentElement.classList.add('dark')
    }
  }
}

export const theme = new ThemeStore()
