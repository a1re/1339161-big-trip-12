import AbstractView from "./abstract.js";

export default class Day extends AbstractView {
  constructor({dayNumber, dayDate}) {
    super();
    this._number = dayNumber;
    this._date = dayDate;
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
}
