import {DATETIME_FORMAT, DEFAULT_FLATPICKR_SETTINGS} from "../const.js";
import {getRandomInt, generateId, formatDate, isValidDate, parseDate} from "../utils/common.js";
import UpdatableView from "./updatable-view.js";

import he from "he";
import moment from "moment";
import flatpickr from "flatpickr";
import "../../node_modules/flatpickr/dist/flatpickr.min.css";

const PointFormMode = {
  ADDING: `ADDING`,
  EDITING: `EDITING`
};

export default class PointFormView extends UpdatableView {
  /**
   * Конструктор класса отображения формы добавления/редактирования события.
   *
   * @param  {Array} typeList         - Массив со списком типов событий.
   * @param  {Array} offerList        - Массив со списком спец. предложений.
   * @param  {Array} destinationList  - Массив со списком типов гороодв.
   * @param  {Object} [point]         - Объект с информацие о событии, если это
   *                                    форма редактирования, а не добавления.
   */
  constructor(typeList, offerList, destinationList, point = null) {
    super();

    this._typeList = typeList;
    this._offerList = offerList;
    this._destinationList = destinationList;

    if (!point) {
      const randomType = typeList[getRandomInt(0, typeList.length - 1)];
      this._point = {
        id: generateId(),
        destination: ``,
        type: randomType.id,
        beginTime: moment().startOf(`hour`).toDate(),
        endTime: moment().startOf(`hour`).add(2, `hours`).toDate(),
        isTransport: randomType.isTransport,
        price: 0,
        offers: [],
        isFavorite: false
      };
      this._mode = PointFormMode.ADDING;
      this._isSubmitEnabled = false;
      this._avalibleOfferList = [];
    } else {
      this._point = point;
      this._mode = PointFormMode.EDITING;
      this._isSubmitEnabled = true;
      this._avalibleOfferList = this._getAvalibleOffers(this._point.type);

      this._deleteHandler = this._deleteHandler.bind(this);
      this._toggleFavoriteHandler = this._toggleFavoriteHandler.bind(this);
    }

    this._beginTimePicker = null;
    this._endTimePicker = null;

    this._closeHandler = this._closeHandler.bind(this);
    this._submitHandler = this._submitHandler.bind(this);
    this._inputDestinationHandler = this._inputDestinationHandler.bind(this);
    this._inputBeginTimeHandler = this._inputBeginTimeHandler.bind(this);
    this._inputEndTimeHandler = this._inputEndTimeHandler.bind(this);
    this._inputPriceHandler = this._inputPriceHandler.bind(this);
    this._selectTypeHandler = this._selectTypeHandler.bind(this);
    this._selectOfferHandler = this._selectOfferHandler.bind(this);

    this.setHandlers();
  }

  /**
   * Получение общего шаблона отображения.
   *
   * @return {String} - Шаблон в виде строки с HTML-кодом.
   */
  get template() {
    const pointTypeSelector = this._makePointTypeSelector();
    const destinationSelector = this._makeDestinationSelector();
    const timeInput = this._makeTimeInput();
    const priceInput = this._makePriceInput();
    const offersList = this._makeOffersList();
    const favoriteButton = this._makeFavoriteButton();

    return `<form class="trip-events__item  event  event--edit" action="#" method="post">
        <header class="event__header">
          ${pointTypeSelector}

          ${destinationSelector}

          ${timeInput}

          ${priceInput}

          <button class="event__save-btn  btn  btn--blue" type="submit" ${this._isSubmitEnabled ? `` : `disabled`}>Save</button>
          <button class="event__reset-btn" type="reset">${this._mode === PointFormMode.ADDING ? `Cancel` : `Delete`}</button>

          ${this._mode === PointFormMode.EDITING ? favoriteButton : ``}

          ${this._mode === PointFormMode.EDITING ? `<button class="event__rollup-btn" type="button">
            <span class="visually-hidden">Open event</span>
          </button>` : ``}
        </header>
        ${offersList}
      </form>`;
  }

  /**
   * Сеттер обработчика закрытия формы редактирования.
   *
   * @param  {Function} callback - Коллбек закрытия формы редактирования.
   */
  set closeHandler(callback) {
    this._callback.close = callback;

    if (this._mode === PointFormMode.ADDING) {
      this.element.querySelector(`.event__reset-btn`)
        .addEventListener(`click`, this._closeHandler);
    }

    if (this._mode === PointFormMode.EDITING) {
      this.element.querySelector(`.event__rollup-btn`)
        .addEventListener(`click`, this._closeHandler);
    }
  }

  /**
   * Сеттер обработчика удаления события в форме редактирования.
   *
   * @param  {Function} callback - Коллбек сохранения события.
   */
  set deleteHandler(callback) {
    this._callback.delete = callback;

    this.element.querySelector(`.event__reset-btn`)
      .addEventListener(`click`, this._deleteHandler);
  }

  /**
   * Сеттер обработчика для кнопки добавления/удаления события в избранное.
   *
   * @param  {Function} callback - Коллбек нажатия на кнопку.
   */
  set toggleFavoriteHandler(callback) {
    this._callback.toggleFavorite = callback;

    this.element.querySelector(`.event__favorite-btn`)
      .addEventListener(`click`, this._toggleFavoriteHandler);
  }

  /**
   * Сеттер обработчика сохранения события в форме редактирования.
   *
   * @param  {Function} callback - Коллбек сохранения события.
   */
  set submitHandler(callback) {
    this._callback.submit = callback;

    this.element.addEventListener(`submit`, this._submitHandler);
  }

  /**
   * Удаление формы. Метод родительского класс переопределяется, чтобы
   * вместе с удалением обнулять и удалять дейтпикеры.
   */
  remove() {
    super.remove();
    this._destroyTimePicking();
  }

  /**
   * Обновление данных объекта события.
   *
   * @param  {Object} newData - Обновленные данные
   */
  updateData(newData) {
    if (!newData) {
      return;
    }

    this._point = Object.assign({}, this._point, newData);
  }

  /**
   * Групповая установка обработчиков разных элементов форм.
   */
  setHandlers() {
    const id = this._point.id;

    this.element.querySelector(`.event__input--destination`)
      .addEventListener(`input`, this._inputDestinationHandler);
    this.element.querySelector(`#event-price-${id}`)
      .addEventListener(`input`, this._inputPriceHandler);
    this.element.querySelector(`.event__type-list`)
      .addEventListener(`change`, this._selectTypeHandler);

    // Обработчик клика на спец. предложения ставим только если они есть
    if (this._avalibleOfferList.length > 0) {
      this.element.querySelector(`.event__available-offers`)
        .addEventListener(`change`, this._selectOfferHandler);
    }

    this.closeHandler = this._callback.close;
    this.submitHandler = this._callback.submit;

    if (this._mode === PointFormMode.EDITING) {
      this.deleteHandler = this._callback.delete;
      this.toggleFavoriteHandler = this._callback.toggleFavorite;
    }

    this._setTimePicking();
  }

  /**
   * Установка обработчиков выбора дат.
   */
  _setTimePicking() {
    this._destroyTimePicking();
    const id = this._point.id;

    const beginTimeInput = this.element.querySelector(`#event-start-time-${id}`);
    this._beginTimePicker = flatpickr(beginTimeInput, Object.assign(
        {},
        DEFAULT_FLATPICKR_SETTINGS,
        {
          defaultDate: this._point.beginTime,
          onChange: this._inputBeginTimeHandler
        }
    ));

    const endTimeInput = this.element.querySelector(`#event-end-time-${id}`);
    this._endTimePicker = flatpickr(endTimeInput, Object.assign(
        {},
        DEFAULT_FLATPICKR_SETTINGS,
        {
          defaultDate: this._point.endTime,
          onChange: this._inputEndTimeHandler
        }
    ));
  }

  /**
   * Удаление таймпикеров.
   */
  _destroyTimePicking() {
    if (this._beginTimePicker) {
      this._beginTimePicker.destroy();
      this._beginTimePicker = null;
    }

    if (this._endTimePicker) {
      this._endTimePicker.destroy();
      this._endTimePicker = null;
    }
  }

  /**
   * Шаблон формы выбора типа события.
   *
   * @return {String} - Шаблон в виде строки с HTML-кодом.
   */
  _makePointTypeSelector() {
    const selectedType = this._typeList.find((type) => type.id === this._point.type);
    const transportTypeList = this._typeList.filter((type) => type.isTransport);
    const stopTypeList = this._typeList.filter((type) => !type.isTransport);

    let template = `
      <div class="event__type-wrapper">
        <label class="event__type  event__type-btn" for="event-type-toggle-${this._point.id}">
          <span class="visually-hidden">Choose event type</span>
          <img
            class="event__type-icon"
            width="17" height="17"
            src="${selectedType.icon}"
            alt="Event type icon">
        </label>
        <input
          class="event__type-toggle  visually-hidden"
          id="event-type-toggle-${this._point.id}"
          type="checkbox">
        <div class="event__type-list">
          <fieldset class="event__type-group">
            <legend class="visually-hidden">Transfer</legend>`;

    for (const type of transportTypeList) {
      template += `
            <div class="event__type-item">
              <input
                id="event-type-${type.id}-1"
                class="event__type-input  visually-hidden"
                type="radio"
                name="event-type"
                value="${type.id}"
                ${(type.id === selectedType) ? `checked` : ``}>
              <label
                class="event__type-label  event__type-label--${type.id}"
                for="event-type-${type.id}-1">${type.title}</label>
            </div>`;
    }

    template += `
          </fieldset>
          <fieldset class="event__type-group">
            <legend class="visually-hidden">Activity</legend>`;

    for (const type of stopTypeList) {
      template += `
            <div class="event__type-item">
              <input
                id="event-type-${type.id}-1"
                class="event__type-input  visually-hidden"
                type="radio" name="event-type"
                value="${type.id}"
                ${(type.id === selectedType) ? `checked` : ``}>
              <label
                class="event__type-label  event__type-label--${type.id}"
                for="event-type-${type.id}-1">
                  ${type.title}
              </label>
            </div>`;
    }

    template += `
          </fieldset>
        </div>
      </div>`;

    return template;
  }

  /**
   * Шаблон инпута места назначения.
   *
   * @return {String} - Шаблон в виде строки с HTML-кодом.
   */
  _makeDestinationSelector() {
    const selectedType = this._typeList.find((type) => type.id === this._point.type);

    let template = `
      <div class="event__field-group  event__field-group--destination">
        <label class="event__label  event__type-output" for="event-destination-${this._point.id}">
          ${selectedType.title} ${(selectedType.isTransport) ? `to` : `in`}
        </label>
        <input
            class="event__input  event__input--destination"
            id="event-destination-${this._point.id}"
            type="text"
            name="event-destination"
            value="${he.encode(this._point.destination)}"
            list="destination-list-${this._point.id}">
        <datalist id="destination-list-${this._point.id}">`;

    this._destinationList.forEach((destination) => {
      template += `<option value="${destination.name}"></option>`;
    });

    template += `
        </datalist>
      </div>`;

    return template;
  }

  /**
   * Шаблон ввода времени.
   *
   * @return {String} - Шаблон в виде строки с HTML-кодом.
   */
  _makeTimeInput() {
    const {id} = this._point;

    const beginTime = formatDate(this._point.beginTime, DATETIME_FORMAT);
    const endTime = formatDate(this._point.endTime, DATETIME_FORMAT);

    return `
      <div class="event__field-group  event__field-group--time">
        <label class="visually-hidden" for="event-start-time-${id}">From</label>
        <input
            class="event__input  event__input--time"
            id="event-start-time-${id}"
            type="text"
            name="event-start-time"
            value="${beginTime}">
        &mdash;
        <label class="visually-hidden" for="event-end-time-${id}">To</label>
        <input
            class="event__input  event__input--time"
            id="event-end-time-${id}"
            type="text"
            name="event-end-time"
            value="${endTime}">
      </div>`;
  }

  /**
   * Шаблон ввода стоимости.
   *
   * @return {String} - Шаблон в виде строки с HTML-кодом.
   */
  _makePriceInput() {
    const {id, price} = this._point;
    return `
      <div class="event__field-group  event__field-group--price">
        <label class="event__label" for="event-price-${id}">
          <span class="visually-hidden">Price</span>
          &euro;
        </label>
        <input
            class="event__input  event__input--price"
            id="event-price-${id}"
            type="text"
            name="event-price"
            value="${price}">
      </div>`;
  }

  /**
   * Шаблон списка специальных предложений.
   *
   * @return {String} - Шаблон в виде строки с HTML-кодом.
   */
  _makeOffersList() {
    if (this._avalibleOfferList.length === 0) {
      return ``;
    }

    let template = `
        <section class="event__details">
          <section class="event__section  event__section--offers">
            <h3 class="event__section-title  event__section-title--offers">Offers</h3>
            <div class="event__available-offers">`;

    for (let i = 0; i < this._avalibleOfferList.length; i++) {
      const isChecked = this._point.offers.some((offer) => {
        return offer.title === this._avalibleOfferList[i].title &&
               offer.price === this._avalibleOfferList[i].price;
      });

      template += `
              <div class="event__offer-selector">
                <input
                    class="event__offer-checkbox  visually-hidden"
                    id="event-${this._point.id}-offer-${i}"
                    type="checkbox"
                    name="event-${this._point.id}-offer"
                    value="${this._avalibleOfferList[i].title}" ${isChecked ? `checked` : ``}>
                <label class="event__offer-label" for="event-${this._point.id}-offer-${i}">
                  <span class="event__offer-title">${this._avalibleOfferList[i].title}</span>
                  &plus;
                  &euro;&nbsp;<span class="event__offer-price">${this._avalibleOfferList[i].price}</span>
                </label>
              </div>`;
    }

    template += `
            </div>
          </section>
        </section>`;

    return template;
  }

  /**
   * Шаблон кнопки добавления в избранное.
   *
   * @return {String} - Шаблон в виде строки с HTML-кодом.
   */
  _makeFavoriteButton() {
    const {id, isFavorite} = this._point;

    return `
      <input
          id="event-favorite-${id}"
          class="event__favorite-checkbox  visually-hidden"
          type="checkbox"
          name="event-favorite" ${(isFavorite) ? `checked` : ``}>
      <label class="event__favorite-btn" for="event-favorite-${id}">
      <span class="visually-hidden">Add to favorite</span>
        <svg class="event__favorite-icon" width="28" height="28" viewBox="0 0 28 28">
          <path
              d="M14 21l-8.22899 4.3262 1.57159-9.1631L.685209 9.67376 9.8855 8.33688
              14 0l4.1145 8.33688 9.2003 1.33688-6.6574 6.48934 1.5716 9.1631L14 21z"/>
        </svg>
      </label>`;
  }

  /**
   * Получение списка выбранных предложений.
   *
   * @return {Array} - Массив с объектами выбранных предложений.
   */
  _getSelectedOffers() {
    const selectedOfferList = this.element
      .querySelectorAll(`.event__available-offers input:checked`);
    const newOffers = [];

    for (const offerItem of selectedOfferList) {
      const selectedOffer = this._avalibleOfferList.find((offer) => {
        return offer.title === offerItem.value;
      });
      newOffers.push(selectedOffer);
    }

    return newOffers;
  }

  /**
   * Получение списка доступных спец. предложений по типу.
   *
   * @param  {String} type - Типа события.
   * @return {Array}       - Массив спец. предложений (пустой, если
   *                         предложений нет)
   */
  _getAvalibleOffers(type) {
    const offerTypeObject = this._offerList.find((offer) => {
      return offer.type === type;
    });
    return offerTypeObject ? offerTypeObject.offers : [];
  }

  /**
   * Включение/выключение кнопки сабмита формы.
   *
   * @param  {Boolean} isEnabled - Флаг статуса кнопки сабмита формы.
   * @return {void}
   */
  _updateSubmitStatus(isEnabled) {
    this._isSubmitEnabled = isEnabled;

    const submit = this.element.querySelector(`.event__save-btn`);
    submit.disabled = !isEnabled;
  }

  /**
   * Вадидатор введеной стоимости.
   *
   * @param  {String/Number} price - Значение стоимости для проверки.
   * @return {Boolean}             - Результат проверки. True — если значение
   *                                 корректно, False — если нет.
   */
  _validatePrice(price) {
    if (price.length === 0 || isNaN(price) || parseInt(price, 10) < 0) {
      return false;
    }

    return true;
  }

  /**
   * Вадидатор введеной точки назначения.
   *
   * @param  {String} destination - Значение точки назначения для проверки.
   * @return {Boolean}            - Результат проверки. True — если значение
   *                                корректно, False — если нет.
   */
  _validateDestination(destination) {
    if (destination.trim().length === 0) {
      return false;
    }

    if (this._destinationList.find((destinationObject) => {
      return destinationObject.name === destination;
    })) {
      return true;
    }

    return false;
  }

  /**
   * Вадидатор введеного времени начала события.
   *
   * @param  {Date/String} beginTime - Значение точки назначения для проверки.
   * @return {Boolean}               - Результат проверки. True — если значение
   *                                   корректно, False — если нет.
   */
  _validateBeginTime(beginTime) {
    if (!isValidDate(beginTime, DATETIME_FORMAT)) {
      return false;
    }

    const endTime = this.element.querySelector(`#event-end-time-${this._point.id}`).value;
    if (parseDate(endTime, DATETIME_FORMAT) > parseDate(beginTime, DATETIME_FORMAT)) {
      return true;
    }

    return false;
  }

  /**
   * Вадидатор введеного времени завершения события.
   *
   * @param  {Date/String} endTime   - Значение точки назначения для проверки.
   * @return {Boolean}               - Результат проверки. True — если значение
   *                                   корректно, False — если нет.
   */
  _validateEndTime(endTime) {
    if (!isValidDate(endTime, DATETIME_FORMAT)) {
      return false;
    }

    const beginTime = this.element.querySelector(`#event-start-time-${this._point.id}`).value;
    if (parseDate(endTime, DATETIME_FORMAT) > parseDate(beginTime, DATETIME_FORMAT)) {
      return true;
    }

    return false;
  }

  /**
   * Валидация всех значений формы
   *
   * @return {Boolean}  - Результат проверки. True — если значения корректны, False — если нет.
   */
  _validateForm() {
    const destinationInput = this.element.querySelector(`.event__input--destination`);
    if (!this._validateDestination(destinationInput.value)) {
      return false;
    }

    const priceInput = this.element.querySelector(`.event__input--price`);
    if (!this._validatePrice(priceInput.value)) {
      return false;
    }

    const beginTimeInput = this.element.querySelector(`#event-start-time-${this._point.id}`);
    if (!this._validateBeginTime(beginTimeInput.value)) {
      return false;
    }

    const endTimeInput = this.element.querySelector(`#event-end-time-${this._point.id}`);
    if (!this._validateEndTime(endTimeInput.value)) {
      return false;
    }

    return true;
  }

  /**
   * Обработчик закрытия формы редактирования.
   *
   * @param  {Object} evt - Объект события в DOM.
   */
  _closeHandler(evt) {
    evt.preventDefault();
    this._callback.close();
  }

  /**
   * Обработчик сабмита формы.
   *
   * @param  {Object} evt - Объект события в DOM.
   */
  _submitHandler(evt) {
    evt.preventDefault();

    if (!this._isSubmitEnabled) {
      return;
    }

    this.updateData({offers: this._getSelectedOffers()});
    this._callback.submit(this._point);
  }

  /**
   * Обработчик ввода места назначения
   *
   * @param  {Object} evt - Объект события в DOM.
   */
  _inputDestinationHandler(evt) {
    if (!this._validateDestination(evt.target.value)) {
      this._updateSubmitStatus(false);
      return;
    }

    this.updateData({destination: evt.target.value});
    this._updateSubmitStatus(this._validateForm());
  }

  /**
   * Обработчик ввода времени начала события. Используется и в качестве
   * обработчика для инпута, и как коллбек для флэтпикера, поэтому зачение
   * берется не из объекта события, а через запрос к DOM.
   */
  _inputBeginTimeHandler() {
    const inputBeginTime = this.element
        .querySelector(`#event-start-time-${this._point.id}`).value;

    this.updateData({
      beginTime: parseDate(inputBeginTime, DATETIME_FORMAT)
    });

    this._updateSubmitStatus(this._validateForm());
  }

  /**
   * Обработчик ввода времени окончания события. Используется и в качестве
   * обработчика для инпута, и как коллбек для флэтпикера, поэтому зачение
   * берется не из объекта события, а через запрос к DOM.
   */
  _inputEndTimeHandler() {
    const inputEndTime = this.element
        .querySelector(`#event-end-time-${this._point.id}`).value;

    this.updateData({
      endTime: parseDate(inputEndTime, DATETIME_FORMAT)
    });
    this._updateSubmitStatus(this._validateForm());
  }

  /**
   * Обработчик ввода стоимости события.
   *
   * @param  {Object} evt - Объект события в DOM.
   */
  _inputPriceHandler(evt) {
    if (!this._validatePrice(evt.target.value)) {
      this._updateSubmitStatus(false);
      return;
    }

    this.updateData({price: parseInt(evt.target.value, 10)});
    this._updateSubmitStatus(this._validateForm());
  }

  /**
   * Обработчик выбора типа события.
   *
   * @param  {Object} evt - Объект события в DOM.
   */
  _selectTypeHandler(evt) {
    const selectedType = this._typeList.find((type) => type.id === evt.target.value);

    const typeIcon = this.element.querySelector(`.event__type-icon`);
    typeIcon.setAttribute(`src`, selectedType.icon);
    this.updateData({
      type: selectedType.id,
      isTransport: selectedType.isTransport
    });

    this._avalibleOfferList = this._getAvalibleOffers(selectedType.id);

    this.updateElement();
  }

  /**
   * Обработчик выбора спец. предложений.
   */
  _selectOfferHandler() {
    this.updateData({offers: this._getSelectedOffers()});
    this.updateElement();
  }

  /**
   * Обработчик нажатия на кнопку удаления.
   *
   * @param  {Object} evt - Объект события в DOM.
   */
  _deleteHandler() {
    this._callback.delete(this._point);
  }

  /**
   * Обработчик добавления/удаления из избранного.
   */
  _toggleFavoriteHandler() {
    this.updateData({isFavorite: !this._point.isFavorite});
    this._callback.toggleFavorite();
  }
}
