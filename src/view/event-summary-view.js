import {TRANSPORTS} from "../const.js";
import AbstractView from "./abstract-view.js";
import Itinerary from "../utils/itinerary.js";

export default class EventSummaryView extends AbstractView {
  constructor(event) {
    super();

    this._MAX_OFFERS_TO_SHOW = 3;
    this._event = event;

    this._openHandler = this._openHandler.bind(this);
  }

  get template() {
    const {type, city} = this._event;
    const isTransfer = TRANSPORTS.indexOf(type) >= 0;
    const priceBlock = this._makePriceBlock();
    const offerList = this._makeOffersList();
    const scheduleBlock = this._makeScheduleBlock();

    let template = `<div class="event">
            <div class="event__type">
              <img
                  class="event__type-icon"
                  width="42" height="42"
                  src="img/icons/${type.toLowerCase()}.png"
                  alt="Event type icon">
            </div>
            <h3 class="event__title">${type} ${(isTransfer) ? `to` : `in`} ${city}</h3>

            ${scheduleBlock}

            ${priceBlock}

            ${offerList}

            <button class="event__rollup-btn" type="button">
              <span class="visually-hidden">Open event</span>
            </button>
          </div>`;

    return template;
  }

  _makeScheduleBlock() {
    const beginDateTime = this._event.beginTime.toISOString();
    const beginTime = this._event.beginTime.toLocaleTimeString(
        `en-US`,
        {timeStyle: `short`, hour12: false}
    );

    const endDateTime = this._event.endTime.toISOString();
    const endTime = this._event.endTime.toLocaleTimeString(
        `en-US`,
        {timeStyle: `short`, hour12: false}
    );

    const duration = Itinerary.getDuration(this._event.beginTime, this._event.endTime);

    return `<div class="event__schedule">
            <p class="event__time">
              <time class="event__start-time" datetime="${beginDateTime}">${beginTime}</time>
              &mdash;
              <time class="event__end-time" datetime="${endDateTime}">${endTime}</time>
            </p>
            <p class="event__duration">${duration}</p>
          </div>`;
  }

  _makePriceBlock() {
    const {price} = this._event;

    return `<p class="event__price">
          &euro;&nbsp;<span class="event__price-value">${price}</span>
        </p>`;
  }

  _makeOffersList() {
    const offerList = Object.values(this._event.offers);
    if (offerList.length === 0) {
      return ``;
    }

    let template = `
        <h4 class="visually-hidden">Offers:</h4>
        <ul class="event__selected-offers">`;

    for (let i = 0; i < this._MAX_OFFERS_TO_SHOW && i < offerList.length; i++) {
      template += `
          <li class="event__offer">
            <span class="event__offer-title">${offerList[i].title}</span>
            &plus;
            &euro;&nbsp;<span class="event__offer-price">${offerList[i].price}</span>
          </li>`;
    }

    template += `
        </ul>`;

    return template;
  }

  _openHandler(evt) {
    evt.preventDefault();
    this._callback.open();
  }

  set openHandler(callback) {
    this._callback.open = callback;

    this.element.querySelector(`.event__rollup-btn`).addEventListener(`click`, this._openHandler);
  }
}
