export class Cache {
  cache = new Map<string, { time: number; value: unknown }>()
  constructor(protected ttl: number = 1000 * 60) {}
  clearStale() {
    const now = Date.now()
    for (const k of this.cache.keys()) {
      const { time } = this.cache.get(k)!
      if (now - time > this.ttl) {
        this.cache.delete(k)
      }
    }
    return now
  }
}
