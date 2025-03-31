export class InfiniteStore {
  count = $state(0)
  constructor(
    count?: number,
    protected max?: number,
  ) {
    if (count) this.count = count
  }
  increment(amount = 1) {
    this.count += amount
  }
  decrement(amount = 1) {
    this.count -= amount
  }
  set(value: number) {
    this.count = value
  }
}
