export class InfiniteStore {
  count = $state(0)
  constructor(
    c?: number,
    protected max?: number,
  ) {
    if (c) this.count = c
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
