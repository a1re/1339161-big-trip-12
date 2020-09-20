import AbstractView from "./abstract-view.js";

export default class SortingView extends AbstractView {
  constructor(sortingList) {
    super();

    this._sortHandler = this._sortHandler.bind(this);
    this._sortingList = sortingList;
  }

  get template() {
    let template = `<form class="trip-events__trip-sort  trip-sort" action="#" method="get">
            <span class="trip-sort__item  trip-sort__item--day">Day</span>`;

    this._sortingList.forEach((sorting) => {
      template += `
            <div class="trip-sort__item  trip-sort__item--${sorting.id}">
              <input
                  id="${sorting.id}"
                  class="trip-sort__input  visually-hidden"
                  type="radio"
                  name="trip-sort"
                  value="${sorting.id}"
                  ${sorting.isActive ? `checked` : ``}>
              <label class="trip-sort__btn" for="${sorting.id}">
                ${sorting.title}
                <svg class="trip-sort__direction-icon" width="8" height="10" viewBox="0 0 8 10">
                  <path d="M2.888 4.852V9.694H5.588V4.852L7.91 5.068L4.238 0.00999987L0.548 5.068L2.888 4.852Z"/>
                </svg>
              </label>
            </div>`;
    });

    template += `<span class="trip-sort__item  trip-sort__item--offers">Offers</span>
          </form>`;

    return template;
  }

  set sortEventsHandler(callback) {
    this._callback.sortEvents = callback;
    const sortingLabels = this.element.querySelectorAll(`.trip-sort__btn`);
    sortingLabels.forEach((label) => {
      label.addEventListener(`click`, this._sortHandler);
    });
  }

  _sortHandler(evt) {
    this._callback.sortEvents(evt.target.getAttribute(`for`));

    const dayColumn = this.element.querySelector(`.trip-sort__item--day`);
    const showColumnSorting = this._sortingList
      .find((sorting) => sorting.isGrouped === true);

    if (showColumnSorting.id === evt.target.getAttribute(`for`)) {
      dayColumn.innerText = `Day`;
    } else {
      dayColumn.innerText = ``;
    }
  }
}
