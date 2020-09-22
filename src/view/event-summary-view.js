import {TIME_FORMAT} from "../const.js";
import {formatDate} from "../utils/common.js";
import AbstractView from "./abstract-view.js";

import moment from "moment";
import he from "he";

export default class EventSummaryView extends AbstractView {
  /**
   * Конструктор класса отображения краткой сводки о собыиии..
   *
   * @param  {Object} event    - Объект с данными события.
   * @param  {Array} offerList - Массив со списком спц. предложений.
   */
  constructor(event, offerList) {
    super();

    this._MAX_OFFERS_TO_SHOW = 3;
    this._event = event;
    this._offerList = offerList;

    this._openHandler = this._openHandler.bind(this);
  }

  /**
   * Геттер шаблона отобрадения.
   */
  get template() {
    const {type, city, isTransport} = this._event;
    const priceElement = this._makePriceElement();
    const offerList = this._makeOffersList();
    const scheduleElement = this._makeScheduleElement();

    let template = `<div class="event">
            <div class="event__type">
              <img
                  class="event__type-icon"
                  width="42" height="42"
                  src="img/icons/${type.toLowerCase()}.png"
                  alt="Event type icon">
            </div>
            <h3 class="event__title">${type} ${(isTransport) ? `to` : `in`} ${he.encode(city)}</h3>

            ${scheduleElement}

            ${priceElement}

            ${offerList}

            <button class="event__rollup-btn" type="button">
              <span class="visually-hidden">Open event</span>
            </button>
          </div>`;

    return template;
  }

  /**
   * Сеттер коллбека открытия формы редактирования.
   *
   * @param  {Function} callback - Коллбек открытия формы редактирования.
   */
  set openHandler(callback) {
    this._callback.open = callback;

    this.element.querySelector(`.event__rollup-btn`).addEventListener(`click`, this._openHandler);
  }

  /**
   * Подготовка элемента вывода временных рамок события.
   *
   * @return {String} - HTML-строка с шаблоном для создания элемента.
   */
  _makeScheduleElement() {
    const beginDateTime = this._event.beginTime.toISOString();
    const beginTime = formatDate(this._event.beginTime, TIME_FORMAT);

    const endDateTime = this._event.endTime.toISOString();
    const endTime = formatDate(this._event.endTime, TIME_FORMAT);

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
   * Подготовка элемента вывода временных рамок события.
   *
   * @return {String} - Шаблон в виде строки с HTML-кодом.
   */
  _makePriceElement() {
    const {price} = this._event;

    return `<p class="event__price">
          &euro;&nbsp;<span class="event__price-value">${price}</span>
        </p>`;
  }

  /**
   * Подготовка элемента вывода выбранных спец. предложений для события.
   *
   * @return {String} - Шаблон в виде строки с HTML-кодом.
   */
  _makeOffersList() {
    const shownOffers = this._offerList.filter((offer) => this._event.offers.indexOf(offer.id) >= 0);
    if (shownOffers.length === 0) {
      return ``;
    }

    let template = `
        <h4 class="visually-hidden">Offers:</h4>
        <ul class="event__selected-offers">`;

    for (let i = 0; i < this._MAX_OFFERS_TO_SHOW && i < shownOffers.length; i++) {
      template += `
          <li class="event__offer">
            <span class="event__offer-title">${shownOffers[i].title}</span>
            &plus;
            &euro;&nbsp;<span class="event__offer-price">${shownOffers[i].price}</span>
          </li>`;
    }

    template += `
        </ul>`;

    return template;
  }

  /**
   * Вычисление длительности события по времени начала и конца. Чтобы не
   * потеряться в часовых поясах, вычисление примитивно-математическое —
   * вначале берутся таймстемпы обеих дат, вычисляется разница между ними,
   * затем поочереди делится на целые дни, целые часы и целые минуты.
   *
   * @return {String}         - Длительность события в формате строки вида
   *                           `01D 02H 03M`
   */
  _getDuration() {
    const beginMoment = moment(this._event.beginTime);
    const endMoment = moment(this._event.endTime);

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
   * Обработчик открытия формы редактирования события.
   *
   * @param  {Object} evt - Объект события в DOM.
   */
  _openHandler(evt) {
    evt.preventDefault();
    this._callback.open();
  }
}
