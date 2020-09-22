import AbstractView from "./abstract-view.js";

export default class FiltersView extends AbstractView {
  constructor(filterList) {
    super();

    this._filterHandler = this._filterHandler.bind(this);
    this._filterList = filterList;
  }

  get template() {
    let template = `<form class="trip-filters" action="#" method="get">`;

    this._filterList.forEach((filter) => {
      template += `<div class="trip-filters__filter">
                <input
                  id="${filter.id}"
                  class="trip-filters__filter-input  visually-hidden"
                  type="radio" name="trip-filter"
                  value="${filter.id}" ${filter.isActive ? `checked` : ``}>
                <label
                  class="trip-filters__filter-label"
                  for="${filter.id}">${filter.title}</label>
              </div>`;
    });

    template += `<button class="visually-hidden" type="submit">Accept filter</button>
            </form>`;

    return template;
  }

  set filterEventsHandler(callback) {
    this._callback.filterEvents = callback;
    const filterLabels = this.element.querySelectorAll(`.trip-filters__filter-label`);
    filterLabels.forEach((label) => {
      label.addEventListener(`click`, this._filterHandler);
    });
  }

  _filterHandler(evt) {
    this._callback.filterEvents(evt.target.getAttribute(`for`));
  }
}
