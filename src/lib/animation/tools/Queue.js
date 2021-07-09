class Queue {
  constructor (size, v) {
    this.p = 0
    this.buff = new Array(size)
    this.size = size
    if (v !== undefined) {
      this.setAll(v)
    }
  }

  setAll (v) {
    for (let i = 0; i < this.size; i++) {
      this.buff[i] = v
    }
    return this
  }

  get (i) {
    return this.buff[(this.p + i) % this.size]
  }

  rget (i) {
    return this.buff[(this.p - i + this.size - 1) % this.size]
  }

  push (v) {
    this.buff[this.p] = v
    this.p += 1
    this.p = this.p % this.size
  }
}
module.exports = Queue
