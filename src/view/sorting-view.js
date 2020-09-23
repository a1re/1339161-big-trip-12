import AbstractView from "./abstract-view.js";

export default class SortingView extends AbstractView {
  /**
   * Конструктор заголовков сортировки таблицы.
   *
   * @param  {Array} sortingList - Список методов сортировки.
   */
  constructor(sortingList) {
    super();

    this._sortHandler = this._sortHandler.bind(this);
    this._sortingList = sortingList;
  }

  /**
   * Геттер шаблона заголовков сортировки таблицы.
   * @return {String} - Шаблон в виде строки с HTML-кодом.
   */
  get template() {
    const selectedSorting = this._sortingList.find((sorting) => sorting.isActive);

    let template = `<form class="trip-events__trip-sort  trip-sort" action="#" method="get">
            <span class="trip-sort__item  trip-sort__item--day">
              ${this._isDayColumnShown(selectedSorting.id) ? `Day` : ``}
            </span>`;

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

  /**
   * Сеттер обаботчика нажатия на заголовок для сортровки.
   *
   * @param  {Function} callback - Коллбек сортировки.
   */
  set sortPointsHandler(callback) {
    this._callback.sortPoints = callback;
    const sortingLabels = this.element.querySelectorAll(`.trip-sort__btn`);
    sortingLabels.forEach((label) => {
      label.addEventListener(`click`, this._sortHandler);
    });
  }


  /**
   * Обработчик нажатия на заголовок для сортровки.
   *
   * @param  {Object} evt - Объект события в DOM.
   */
  _sortHandler(evt) {
    this._callback.sortPoints(evt.target.getAttribute(`for`));

    const dayColumn = this.element.querySelector(`.trip-sort__item--day`);

    if (this._isDayColumnShown(evt.target.getAttribute(`for`))) {
      dayColumn.innerText = `Day`;
    } else {
      dayColumn.innerText = ``;
    }
  }

  /**
   * Проверка показывать ли заголовок стобца Day.
   * @param  {String}  selectedSorting - Id выбранной сортировки.
   * @return {Boolean}                 - True если нужно показывать,
   *                                     False — если нет.
   */
  _isDayColumnShown(selectedSorting) {
    const groupedSortingColumn = this._sortingList
      .find((sorting) => sorting.isGrouped === true);

    return selectedSorting === groupedSortingColumn.id;
  }
}
