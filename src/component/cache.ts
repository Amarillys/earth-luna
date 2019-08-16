export default class Cache {
  values = {}
  get(key: string, status: string, callback) {
    if (this.values[key] === undefined) {
      this.values[key] = {}
    }
    if (this.values[key][status] === undefined) {
      this.values[key][status] = callback(JSON.parse(status), key)
    }
    return this.values[key][status]
  }
}