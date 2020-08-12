import {createElement} from "../utils.js";

export default class Day {
  constructor({dayNumber, dayDate}) {
    this._number = dayNumber;
    this._date = dayDate;
    this._element = null;
  }

  get template() {
    const dayTitle = new Date(this._date);
    return `<li class="trip-days__item day">
              <div class="day__info">
                <span class="day__counter">${this._number}</span>
                <time class="day__date" datetime="${this._date}">${dayTitle.toLocaleString(`en-US`, {day: `numeric`, month: `short`})}</time>
              </div>
              <ul class="trip-events__list"></ul>
            </li>`;
  }

  get element() {
    if (!this._element) {
      this._element = createElement(this.template);
    }

    return this._element;
  }

  removeElement() {
    this._element = null;
  }
}
