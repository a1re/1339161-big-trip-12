import {createElement, getDuration} from "../utils.js";

export default class EventSummary {
  constructor(event) {
    this._MAX_OFFERS_TO_SHOW = 3;

    this._event = event;
    this._element = null;
  }

  get template() {
    const {type, isTransfer, city, beginTime, endTime, price, offers} = this._event;
    let template = `<div class="event">
            <div class="event__type">
              <img class="event__type-icon" width="42" height="42" src="img/icons/${type.toLowerCase()}.png" alt="Event type icon">
            </div>
            <h3 class="event__title">${type} ${(isTransfer) ? `to` : `in`} ${city}</h3>

            <div class="event__schedule">
              <p class="event__time">
                <time class="event__start-time" datetime="${beginTime.toISOString()}">${beginTime.toLocaleTimeString(`en-US`, {timeStyle: `short`, hour12: false})}</time>
                &mdash;
                <time class="event__end-time" datetime="${endTime.toISOString()}">${endTime.toLocaleTimeString(`en-US`, {timeStyle: `short`, hour12: false})}</time>
              </p>
              <p class="event__duration">${getDuration(beginTime, endTime)}</p>
            </div>

            <p class="event__price">
              &euro;&nbsp;<span class="event__price-value">${price}</span>
            </p>`;

    const offerList = Object.values(offers);
    if (offerList.length > 0) {
      template += `<h4 class="visually-hidden">Offers:</h4>
            <ul class="event__selected-offers">`;

      for (let i = 0; i < this._MAX_OFFERS_TO_SHOW && i < offerList.length; i++) {
        template += `<li class="event__offer">
            <span class="event__offer-title">${offerList[i].title}</span>
            &plus;
            &euro;&nbsp;<span class="event__offer-price">${offerList[i].price}</span>
          </li>`;
      }

      template += `</ul>`;
    }

    template += `<button class="event__rollup-btn" type="button">
              <span class="visually-hidden">Open event</span>
            </button>
          </div>`;

    return template;
  }

  get element() {
    if (!this._element) {
      this._element = createElement(this.template);
    }

    return this._element;
  }

  removeElement() {
    this._element = null;
  }
}
