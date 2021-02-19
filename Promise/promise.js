const isFunction = variable => typeof variable === 'function'

const PENDING = 'PENDING'
const FULFILLED = 'FULFILLED'
const REJECTED = 'REJECTED'

class myPromise {
  constructor(handle) {
    if (!isFunction(handle)) {
      throw new Error('myPromise must accept a function as a paramter')
    }

    this._status = PENDING

    this._value = undefined

    this._fulfilledQueues = []

    this._rejectedQueues = []

    try {
      handle(this._resolve.bind(this), this._reject.bind(this))
    } catch (err){
      this._reject(err)
    }
  }
  static resolve (value) {
    if (value instanceof myPromise) return value
    return new myPromise(resolve => resolve(value))
  }
  static reject (value) {
    return new myPromise((resolve, reject) => reject(value))
  }
  static all (list) {
    return new myPromise((resolve, reject) => {
      let values = []
      let count = 0
      for (let [i, p] of list.entrise()) {
        this.resolve(p).then(res => {
          values[i] = res
          count++
          if (count === list.length) resolve(values)
        }, err => {
          reject(err)
        })
      }
    })
  }
  static race(list) {
    return new myPromise((resolve, reject) => {
      for (let p of list) {
        this.resolve(p).then(res => {
          resolve(res)
        }, err => {
          reject(err)
        })
      }
    })
  }
  _resolve(val) {
    if (this._status !== PENDING) return
    const run = () => {
      if (this._status !== PENDING) return

      const runFulfilled = (value) => {
        let cb;
        while(cb = this._fulfilledQueues.shift()) {
          cb(value)
        }
      }
      const runRejected = (error) => {
        let cb;
        while(cb = this._rejectedQueues.shift()) {
          cb(error)
        }
      }

      if (val instanceof myPromise) {
        val.then(value => {
          this._value = value
          this._status = FULFILLED
          runFulfilled(value)
        }, err => {
          this._value = err
          this._status = REJECTED
          runRejected(err)
        })
      } else {
        this._value = val
        this._status = FULFILLED
        runFulfilled(val)
      }
    }
    setTimeout(run, 0)
  }

  _reject(err) {
    if (this._status !== PENDING) return
    const run = () => {
      this._status = REJECTED
      this._value = err
      let cb;
      while(cb = this._rejectedQueues.shift()) {
        cb(err)
      }
    }
    setTimeout(run, 0)
  }

  then(onFulfilled, onRejected) {
    const { _value, _status } = this
    return new myPromise((onFulfilledNext, onRejectedNext) => {
      let fulfilled = value => {
        try {
          if (!isFunction(onFulfilled)) {
            onFulfilledNext(value)
          } else {
            let res = onFulfilled(value)
            if (res instanceof myPromise) {
              res.then(onFulfilledNext, onRejectedNext)
            } else {
              onFulfilledNext(res)
            }
          }
        } catch (err) {
          onRejectedNext(err)
        }
      }

      let rejected = error => {
        try {
          if (!isFunction(onRejected)) {
            onRejectedNext(error)
          } else {
            let res = onRejected(error)
            if (res instanceof myPromise) {
              res.then(onFulfilledNext, onRejectedNext)
            } else {
              onFulfilledNext(res)
            }
          }
        } catch(err) {
          onRejectedNext(err)
        }
      }

      switch (_status) {
        // 当状态为pending时，将then方法回调函数加入执行队列等待执行
        case PENDING:
          this._fulfilledQueues.push(fulfilled)
          this._rejectedQueues.push(rejected)
          break
        // 当状态已经改变时，立即执行对应的回调函数
        case FULFILLED:
          fulfilled(_value)
          break
        case REJECTED:
          rejected(_value)
          break
      }
    })
  }

  catch(onRejected) {
    return this.then(undefined, onRejected)
  }

  finally (cb) {
    return this.then(
      value => myPromise.resolve(cb()).then(() => value),
      reason => myPromise.resolve(cb()).then(() => { throw reason})
    )
  }
}