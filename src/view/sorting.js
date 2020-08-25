import AbstractView from "./abstract.js";
import {SortingMethod} from "../const.js";

export default class Sorting extends AbstractView {
  constructor(sortingMethod) {
    super();

    this._sortHandler = this._sortHandler.bind(this);
    this._sortingMethod = sortingMethod;
  }

  get template() {
    return `<form class="trip-events__trip-sort  trip-sort" action="#" method="get">
            <span class="trip-sort__item  trip-sort__item--day">${(this._sortingMethod === SortingMethod.EVENT) ? `Day` : ``}</span>

            <div class="trip-sort__item  trip-sort__item--event">
              <input id="sort-event" class="trip-sort__input  visually-hidden" type="radio" name="trip-sort" value="${SortingMethod.EVENT}" ${(this._sortingMethod === SortingMethod.EVENT) ? `checked` : ``}>
              <label class="trip-sort__btn" for="sort-event">Event</label>
            </div>

            <div class="trip-sort__item  trip-sort__item--time">
              <input id="sort-time" class="trip-sort__input  visually-hidden" type="radio" name="trip-sort" value="${SortingMethod.TIME}" ${(this._sortingMethod === SortingMethod.TIME) ? `checked` : ``}>
              <label class="trip-sort__btn" for="sort-time">
                Time
                <svg class="trip-sort__direction-icon" width="8" height="10" viewBox="0 0 8 10">
                  <path d="M2.888 4.852V9.694H5.588V4.852L7.91 5.068L4.238 0.00999987L0.548 5.068L2.888 4.852Z"/>
                </svg>
              </label>
            </div>

            <div class="trip-sort__item  trip-sort__item--price">
              <input id="sort-price" class="trip-sort__input  visually-hidden" type="radio" name="trip-sort" value="${SortingMethod.PRICE}" ${(this._sortingMethod === SortingMethod.PRICE) ? `checked` : ``}>
              <label class="trip-sort__btn" for="sort-price">
                Price
                <svg class="trip-sort__direction-icon" width="8" height="10" viewBox="0 0 8 10">
                  <path d="M2.888 4.852V9.694H5.588V4.852L7.91 5.068L4.238 0.00999987L0.548 5.068L2.888 4.852Z"/>
                </svg>
              </label>
            </div>

            <span class="trip-sort__item  trip-sort__item--offers">Offers</span>
          </form>`;
  }

  set sortingMethod(sortingMethod) {
    if (sortingMethod === this._sortingMethod) {
      return;
    }

    this._sortingMethod = sortingMethod;
    if (sortingMethod !== SortingMethod.EVENT) {
      this._element.querySelector(`.trip-sort__item--day`).innerText = ``;
    } else {
      this._element.querySelector(`.trip-sort__item--day`).innerText = `Day`;
    }
  }

  set sortEventsHandler(callback) {
    this._callback.sortEvents = callback;
    const sortingLabels = this.element.querySelectorAll(`.trip-sort__btn`);
    sortingLabels.forEach((label) => {
      label.addEventListener(`click`, this._sortHandler);
    });
  }

  _sortHandler(evt) {
    const sortingMethod = evt.target.getAttribute(`for`);
    this._callback.sortEvents(sortingMethod);
  }
}
