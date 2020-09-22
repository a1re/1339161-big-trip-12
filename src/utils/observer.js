export default class Observer {
  constructor() {
    this._observers = [];
  }

  subscribe(observer) {
    this._observers.push(observer);
  }

  forget(observer) {
    this._observers = this._observers.filter((existedObserver) => {
      return existedObserver !== observer;
    });
  }

  _notify(event, ...args) {
    this._observers.forEach((observer) => observer(event, ...args));
  }
}
