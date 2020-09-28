import {TIME_FORMAT, MAX_OFFERS_TO_SHOW} from "../const.js";
import {formatDate} from "../utils/common.js";
import AbstractView from "./abstract-view.js";

import moment from "moment";
import he from "he";

export default class PointSummaryView extends AbstractView {
  /**
   * Конструктор класса отображения краткой сводки о точке
   *
   * @param  {Object} type     - Объект с описанием типа точки.
   * @param  {Object} point    - Объект с данными точки.
   */
  constructor(type, point) {
    super();

    this._point = point;
    this._type = type;

    this._openHandler = this._openHandler.bind(this);
  }

  /**
   * Геттер шаблона отображения.
   *
   * @return {String} - Шаблон в виде строки с HTML-кодом.
   */
  get template() {
    const priceElement = this._makePriceElement();
    const offerList = this._makeOffersList();
    const scheduleElement = this._makeScheduleElement();

    return `<div class="event">
            <div class="event__type">
              <img
                  class="event__type-icon"
                  width="42" height="42"
                  src="${this._type.icon}"
                  alt="Event type icon">
            </div>
            <h3 class="event__title">
              ${this._type.title}
              ${(this._type.isTransport) ? `to` : `in`}
              ${he.encode(this._point.destination.name)}
            </h3>

            ${scheduleElement}

            ${priceElement}

            ${offerList}

            <button class="event__rollup-btn" type="button">
              <span class="visually-hidden">Open event</span>
            </button>
          </div>`;
  }

  /**
   * Сеттер обработчика открытия формы редактирования.
   *
   * @param  {Function} callback - Коллбек открытия формы редактирования.
   */
  set openHandler(callback) {
    this._callback.open = callback;

    this.element.querySelector(`.event__rollup-btn`).addEventListener(`click`, this._openHandler);
  }

  /**
   * Создание шаблона элемента вывода временных рамок нахождения в точке.
   *
   * @return {String} - HTML-строка с шаблоном для создания элемента.
   */
  _makeScheduleElement() {
    const beginDateTime = this._point.beginTime.toISOString();
    const beginTime = formatDate(this._point.beginTime, TIME_FORMAT);

    const endDateTime = this._point.endTime.toISOString();
    const endTime = formatDate(this._point.endTime, TIME_FORMAT);

    const duration = this._getDuration();

    return `<div class="event__schedule">
            <p class="event__time">
              <time class="event__start-time" datetime="${beginDateTime}">${beginTime}</time>
              &mdash;
              <time class="event__end-time" datetime="${endDateTime}">${endTime}</time>
            </p>
            <p class="event__duration">${duration}</p>
          </div>`;
  }

  /**
   * Создание шаблона элемента вывода стоимости точки
   *
   * @return {String} - Шаблон в виде строки с HTML-кодом.
   */
  _makePriceElement() {
    const {price} = this._point;

    return `<p class="event__price">
          &euro;&nbsp;<span class="event__price-value">${price}</span>
        </p>`;
  }

  /**
   * Создание шаблона элемента вывода выбранных спец. предложений для точки.
   *
   * @return {String} - Шаблон в виде строки с HTML-кодом.
   */
  _makeOffersList() {
    if (this._point.offers.length === 0) {
      return ``;
    }

    let template = `
        <h4 class="visually-hidden">Offers:</h4>
        <ul class="event__selected-offers">`;

    for (let i = 0; i < MAX_OFFERS_TO_SHOW && i < this._point.offers.length; i++) {
      template += `
          <li class="event__offer">
            <span class="event__offer-title">${this._point.offers[i].title}</span>
            &plus;
            &euro;&nbsp;<span class="event__offer-price">${this._point.offers[i].price}</span>
          </li>`;
    }

    template += `
        </ul>`;

    return template;
  }

  /**
   * Вычисление длительности нахождения в точке по времени начала и конца.
   *
   * @return {String} - Длительность нахождения в точке в формате строки
   *                    вида `01D 02H 03M`
   */
  _getDuration() {
    const beginMoment = moment(this._point.beginTime);
    const endMoment = moment(this._point.endTime);

    let days = parseInt(endMoment.diff(beginMoment, `days`), 10);
    let hours = parseInt(endMoment.diff(beginMoment, `hours`) % 24, 10);
    let minutes = parseInt(endMoment.diff(beginMoment, `minutes`) % 60, 10);

    if (days === 0) {
      days = ``;
    } else {
      days = ((days < 10) ? (`0` + days) : days) + `D`;
    }

    if (hours === 0) {
      hours = ``;
    } else {
      hours = ((hours < 10) ? (`0` + hours) : hours) + `H`;
    }

    if (minutes === 0) {
      minutes = ``;
    } else {
      minutes = ((minutes < 10) ? (`0` + minutes) : minutes) + `M`;
    }

    return `${days} ${hours} ${minutes}`;
  }

  /**
   * Обработчик открытия формы редактирования точки.
   *
   * @param  {Event} evt - Объект события в DOM.
   */
  _openHandler(evt) {
    evt.preventDefault();
    this._callback.open();
  }
}
