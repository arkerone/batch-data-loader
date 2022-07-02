type BatchFunction<T, R> = (values: T[]) => Promise<R[]>
type LoadResolver<T> = (value: T | PromiseLike<T>) => void

export class DataLoader<TLoadKey, TBatchResult> {
  private resolvers: Array<LoadResolver<TBatchResult | undefined>> = []
  private loadKeys: Array<TLoadKey> = []
  private batchFunction: BatchFunction<TLoadKey, TBatchResult>
  private cache: Map<TLoadKey, TBatchResult | null> = new Map()
  private isScheduled: boolean = false

  constructor(batchFunction: BatchFunction<TLoadKey, TBatchResult>) {
    this.batchFunction = batchFunction
  }

  async load(key: TLoadKey): Promise<TBatchResult | undefined> {
    this.schedule()
    this.loadKeys.push(key)
    const promise = new Promise<TBatchResult | undefined>((resolve) => {
      this.resolvers.push(resolve)
    })

    return promise
  }

  clearCache() {
    this.cache.clear()
  }

  private async dispatch() {
    const nonCachedKeys: Array<TLoadKey> = []

    for (const key of this.loadKeys) {
      if (!this.cache.has(key)) {
        nonCachedKeys.push(key)
        this.cache.set(key, null)
      }
    }

    const values = await this.batchFunction(nonCachedKeys)

    this.loadKeys.forEach((key, index) => {
      const resolver = this.resolvers[index]
      if (resolver) {
        let value = this.cache.get(key)
        if (!value) {
          value = values.shift()
        }

        if (value) {
          this.cache.set(key, value)
        }
        resolver(value)
      }
    })
    this.reset()
  }

  private schedule() {
    if (!this.isScheduled) {
      process.nextTick(() => {
        this.dispatch()
      })
      this.isScheduled = true
    }
  }

  private reset() {
    this.resolvers = []
    this.loadKeys = []
    this.isScheduled = false
  }
}
