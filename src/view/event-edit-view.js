import {CITIES, STOPS, TRANSPORTS, DATETIME_FORMAT, DEFAULT_FLATPICKR_SETTINGS} from "../const.js";
import {getRandomInt, formatDate, isValidDate, parseDate} from "../utils/common.js";
import UpdatableView from "./updatable-view.js";

import flatpickr from "flatpickr";
import "../../node_modules/flatpickr/dist/flatpickr.min.css";

const DEFAULT_EVENT_VALUES = {
  id: 0,
  city: ``,
  type: TRANSPORTS[getRandomInt(0, TRANSPORTS.length - 1)],
  beginTime: new Date().setHours(new Date().getHours() + 1, 0, 0, 0),
  endTime: new Date().setHours(new Date().getHours() + 2, 0, 0, 0),
  price: 0,
  offers: [],
  isFavorite: false
};

export default class EventEditView extends UpdatableView {
  /**
   * Конструктор класса отображения формы редактирования.
   *
   * @param  {Object} event    - Объект с данными события.
   * @param  {Array} offerList - Массив со списком спц. предложений.
   */
  constructor(event = DEFAULT_EVENT_VALUES, offerList) {
    super();
    this._event = event;
    this._beginTimePicker = null;
    this._endTimePicker = null;
    this._offerList = offerList;

    this._isSubmitEnabled = true;

    this._closeHandler = this._closeHandler.bind(this);
    this._submitHandler = this._submitHandler.bind(this);
    this._deleteHandler = this._deleteHandler.bind(this);
    this._toggleFavoriteHandler = this._toggleFavoriteHandler.bind(this);
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
    const eventTypeSelector = this._makeEventTypeSelector();
    const destinationSelector = this._makeDestinationSelector();
    const timeInput = this._makeTimeInput();
    const priceInput = this._makePriceInput();
    const favoriteButton = this._makeFavoriteButton();
    const offersList = this._makeOffersList();

    return `<form class="event event--edit" action="#" method="post">
        <header class="event__header">
          ${eventTypeSelector}

          ${destinationSelector}

          ${timeInput}

          ${priceInput}

          <button class="event__save-btn  btn  btn--blue" type="submit" ${this._isSubmitEnabled ? `` : `disabled`}>Save</button>
          <button class="event__reset-btn" type="reset">Delete</button>

          ${favoriteButton}

          <button class="event__rollup-btn" type="button">
            <span class="visually-hidden">Open event</span>
          </button>
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

    this.element.querySelector(`.event__rollup-btn`)
      .addEventListener(`click`, this._closeHandler);
  }

  /**
   * Сеттер обработчика сохранения события в форме редактирования.
   *
   * @param  {Function} callback - Коллбек сохранения события.
   */
  set submitHandler(callback) {
    this._callback.submit = callback;

    this.element.querySelector(`.event__reset-btn`)
      .addEventListener(`click`, this._deleteHandler);
  }

  /**
   * Сеттер обработчика удаления события в форме редактирования.
   *
   * @param  {Function} callback - Коллбек сохранения события.
   */
  set deleteHandler(callback) {
    this._callback.delete = callback;

    this.element.addEventListener(`submit`, this._submitHandler);
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
   * Обновление данных объекта события.
   *
   * @param  {Object} newData - Обновленные данные
   */
  updateData(newData) {
    if (!newData) {
      return;
    }

    this._event = Object.assign({}, this._event, newData);
  }

  /**
   * Групповая установка обработчиков разных элементов форм.
   */
  setHandlers() {
    const id = this._event.id;

    this.element.querySelector(`.event__input--destination`)
      .addEventListener(`input`, this._inputDestinationHandler);
    this.element.querySelector(`#event-price-${id}`)
      .addEventListener(`input`, this._inputPriceHandler);
    this.element.querySelector(`.event__type-list`)
      .addEventListener(`change`, this._selectTypeHandler);
    this.element.querySelector(`.event__available-offers`)
      .addEventListener(`change`, this._selectOfferHandler);

    this.closeHandler = this._callback.close;
    this.submitHandler = this._callback.submit;
    this.deleteHandler = this._callback.delete;
    this.toggleFavoriteHandler = this._callback.toggleFavorite;

    if (this._beginTimePicker) {
      this._beginTimePicker.destroy();
      this._beginTimePicker = null;
    }

    const beginTimeInput = this.element.querySelector(`#event-start-time-${id}`);
    this._beginTimePicker = flatpickr(beginTimeInput, Object.assign(
        {},
        DEFAULT_FLATPICKR_SETTINGS,
        {
          defaultDate: this._event.beginTime,
          onChange: this._inputBeginTimeHandler
        }
    ));

    if (this._endTimePicker) {
      this._endTimePicker.destroy();
      this._endTimePicker = null;
    }

    const endTimeInput = this.element.querySelector(`#event-end-time-${id}`);
    this._endTimePicker = flatpickr(endTimeInput, Object.assign(
        {},
        DEFAULT_FLATPICKR_SETTINGS,
        {
          defaultDate: this._event.endTime,
          onChange: this._inputEndTimeHandler
        }
    ));
  }

  /**
   * Получение списка выбранных предложений.
   *
   * @return {Array} - Массив с id выбранных предложений
   */
  _getSelectedOffers() {
    const selectedOffers = this.element.querySelectorAll(`.event__available-offers input:checked`);
    const newOffers = [];
    for (const offer of selectedOffers) {
      newOffers.push(parseInt(offer.value, 10));
    }

    return newOffers;
  }

  _setDatepicker() {
    if (this._datepicker) {
      this._datepicker.destroy();
      this._datepicker = null;
    }

    this._datepicker = flatpickr(

    );
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
   * Шаблон формы выбора типа события.
   *
   * @return {String} - Шаблон в виде строки с HTML-кодом.
   */
  _makeEventTypeSelector() {
    const {id, type} = this._event;

    let template = `
      <div class="event__type-wrapper">
        <label class="event__type  event__type-btn" for="event-type-toggle-${id}">
          <span class="visually-hidden">Choose event type</span>
          <img
            class="event__type-icon"
            width="17" height="17"
            src="img/icons/${type.toLowerCase()}.png"
            alt="Event type icon">
        </label>
        <input
          class="event__type-toggle  visually-hidden"
          id="event-type-toggle-${id}"
          type="checkbox">
        <div class="event__type-list">
          <fieldset class="event__type-group">
            <legend class="visually-hidden">Transfer</legend>`;

    for (const transferName of TRANSPORTS) {
      template += `
            <div class="event__type-item">
              <input
                id="event-type-${transferName.toLowerCase()}-1"
                class="event__type-input  visually-hidden"
                type="radio"
                name="event-type"
                value="${transferName}"
                ${(transferName === type) ? `checked` : ``}>
              <label
                class="event__type-label  event__type-label--${transferName.toLowerCase()}"
                for="event-type-${transferName.toLowerCase()}-1">${transferName}</label>
            </div>`;
    }

    template += `
          </fieldset>
          <fieldset class="event__type-group">
            <legend class="visually-hidden">Activity</legend>`;

    for (const activityName of STOPS) {
      template += `
            <div class="event__type-item">
              <input
                id="event-type-${activityName.toLowerCase()}-1"
                class="event__type-input  visually-hidden"
                type="radio" name="event-type"
                value="${activityName}"
                ${(activityName === type) ? `checked` : ``}>
              <label
                class="event__type-label  event__type-label--${activityName.toLowerCase()}"
                for="event-type-${activityName.toLowerCase()}-1">
                  ${activityName}
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
    const {id, type, city, isTransport} = this._event;

    let template = `
      <div class="event__field-group  event__field-group--destination">
        <label class="event__label  event__type-output" for="event-destination-${id}">
          ${type} ${(isTransport) ? `to` : `in`}
        </label>
        <input
            class="event__input  event__input--destination"
            id="event-destination-${id}"
            type="text"
            name="event-destination"
            value="${city}"
            list="destination-list-1">
        <datalist id="destination-list-${id}">`;

    CITIES.forEach((cityName) => {
      template += `<option value="${cityName}"></option>`;
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
    const {id} = this._event;

    const beginTime = formatDate(this._event.beginTime, DATETIME_FORMAT);
    const endTime = formatDate(this._event.endTime, DATETIME_FORMAT);

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
    const {id, price} = this._event;
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
   * Шаблон кнопки добавления в избранное.
   *
   * @return {String} - Шаблон в виде строки с HTML-кодом.
   */
  _makeFavoriteButton() {
    const {id, isFavorite} = this._event;

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
   * Шаблон списка специальных предложений.
   *
   * @return {String} - Шаблон в виде строки с HTML-кодом.
   */
  _makeOffersList() {
    let template = `
        <section class="event__details">
          <section class="event__section  event__section--offers">
            <h3 class="event__section-title  event__section-title--offers">Offers</h3>
            <div class="event__available-offers">`;

    this._offerList.forEach((offer) => {
      if (this._event.isTransport !== offer.isTransport) {
        return;
      }

      template += `
              <div class="event__offer-selector">
                <input
                    class="event__offer-checkbox  visually-hidden"
                    id="event-${this._event.id}-offer-${offer.id}"
                    type="checkbox"
                    name="event-${this._event.id}-offer"
                    value="${offer.id}" ${(this._event.offers.indexOf(offer.id) >= 0) ? `checked` : ``}>
                <label class="event__offer-label" for="event-${this._event.id}-offer-${offer.id}">
                  <span class="event__offer-title">${offer.title}</span>
                  &plus;
                  &euro;&nbsp;<span class="event__offer-price">${offer.price}</span>
                </label>
              </div>`;
    });

    template += `
            </div>
          </section>
        </section>`;

    return template;
  }

  /**
   * Обработчик закрытия формы реедактирования.
   *
   * @param  {Object} evt - Объект события в DOM.
   */
  _closeHandler(evt) {
    evt.preventDefault();
    this._callback.close();
  }

  /**
   * Обработчик сабмита формы редактирования.
   *
   * @param  {Object} evt - Объект события в DOM.
   */
  _submitHandler(evt) {
    evt.preventDefault();

    if (!this._isSubmitEnabled) {
      return;
    }

    this.updateData({offers: this._getSelectedOffers()});
    this._callback.submit(this._event);
  }

  /**
   * Обработчик нажатия на кнопку удаления.
   *
   * @param  {Object} evt - Объект события в DOM.
   */
  _deleteHandler() {
    this._callback.delete(this._event);
  }

  /**
   * Обработчик добавления/удаления из избранного.
   */
  _toggleFavoriteHandler() {
    this.updateData({isFavorite: !this._event.isFavorite});
    this._callback.toggleFavorite();
  }

  /**
   * Обработчик ввода места назначения
   *
   * @param  {Object} evt - Объект события в DOM.
   */
  _inputDestinationHandler(evt) {
    if (evt.target.value.length > 0) {
      this.updateData({city: evt.target.value});
      this._updateSubmitStatus(true);
    } else {
      this._updateSubmitStatus(false);
    }
  }

  /**
   * Обработчик ввода времени начала события. Используется и в качестве
   * обработчика для инпута, и как коллбек для флэтпикера, поэтому зачение
   * берется не из объекта события, а через запрос к DOM.
   */
  _inputBeginTimeHandler() {
    const inputBeginTime = this.element
        .querySelector(`#event-start-time-${this._event.id}`).value;
    const inputEndTime = this.element
        .querySelector(`#event-end-time-${this._event.id}`).value;

    if (!isValidDate(inputBeginTime, DATETIME_FORMAT)) {
      this._updateSubmitStatus(false);
      return;
    }

    if (parseDate(inputBeginTime, DATETIME_FORMAT) > parseDate(inputEndTime, DATETIME_FORMAT)) {
      this._updateSubmitStatus(false);
      return;
    }

    this.updateData({
      beginTime: parseDate(inputBeginTime, DATETIME_FORMAT),
      endTime: parseDate(inputEndTime, DATETIME_FORMAT)
    });
    this._updateSubmitStatus(true);
  }

  /**
   * Обработчик ввода времени окончания события. Используется и в качестве
   * обработчика для инпута, и как коллбек для флэтпикера, поэтому зачение
   * берется не из объекта события, а через запрос к DOM.
   */
  _inputEndTimeHandler() {
    const inputBeginTime = this.element
        .querySelector(`#event-start-time-${this._event.id}`).value;
    const inputEndTime = this.element
        .querySelector(`#event-end-time-${this._event.id}`).value;

    if (!isValidDate(inputEndTime, DATETIME_FORMAT)) {
      this._updateSubmitStatus(false);
      return;
    }

    if (parseDate(inputEndTime, DATETIME_FORMAT) < parseDate(inputBeginTime, DATETIME_FORMAT)) {
      this._updateSubmitStatus(false);
      return;
    }

    this.updateData({
      beginTime: parseDate(inputBeginTime, DATETIME_FORMAT),
      endTime: parseDate(inputEndTime, DATETIME_FORMAT)
    });
    this._updateSubmitStatus(true);
  }

  /**
   * Обработчик ввода стоимости события.
   *
   * @param  {Object} evt - Объект события в DOM.
   */
  _inputPriceHandler(evt) {
    const price = parseInt(evt.target.value, 10);
    if (evt.target.value.length > 0 && !isNaN(price)) {
      this.updateData({price});
      this._updateSubmitStatus(true);
    } else {
      this._updateSubmitStatus(false);
    }
  }

  /**
   * Обработчик выбора типа события.
   *
   * @param  {Object} evt - Объект события в DOM.
   */
  _selectTypeHandler(evt) {
    const eventIcon = this.element.querySelector(`.event__type-icon`);
    eventIcon.setAttribute(`src`, `img/icons/${evt.target.value.toLowerCase()}.png`);
    this.updateData({
      type: evt.target.value,
      isTransport: TRANSPORTS.indexOf(evt.target.value) >= 0
    });
    this.updateElement();
  }

  /**
   * Обработчик выбора спец. предложений.
   */
  _selectOfferHandler() {
    this.updateData({offers: this._getSelectedOffers()});
    this.updateElement();
  }
}
