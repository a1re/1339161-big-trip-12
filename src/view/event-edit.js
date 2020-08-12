import {CITIES, STOPS, TRANSPORTS, TRANSPORT_OFFERS_MAP, STOP_OFFERS_MAP} from "../const.js";
import {createElement, getRandomInt} from "../utils.js";

const DEFAULT_EVENT_VALUES = {
  id: 0,
  city: ``,
  type: TRANSPORTS[getRandomInt(0, TRANSPORTS.length - 1)],
  beginTime: new Date().setHours(new Date().getHours() + 1, 0, 0, 0),
  endTime: new Date().setHours(new Date().getHours() + 2, 0, 0, 0),
  price: 0,
  offers: [],
  isTransfer: true,
  isFavorite: false
};

export default class EventSummary {
  constructor(event = DEFAULT_EVENT_VALUES) {
    this._event = event;
    this._element = null;
  }

  get template() {
    const {id, type, isTransfer, isFavorite, city, beginTime, endTime, price, offers} = this._event;
    const offersList = (isTransfer) ? TRANSPORT_OFFERS_MAP : STOP_OFFERS_MAP;

    let template = `<form class="event event--edit" action="#" method="post">
                    <header class="event__header">
                      <div class="event__type-wrapper">
                        <label class="event__type  event__type-btn" for="event-type-toggle-${id}">
                          <span class="visually-hidden">Choose event type</span>
                          <img class="event__type-icon" width="17" height="17" src="img/icons/${type.toLowerCase()}.png" alt="Event type icon">
                        </label>
                        <input class="event__type-toggle  visually-hidden" id="event-type-toggle-${id}" type="checkbox">

                        <div class="event__type-list">
                          <fieldset class="event__type-group">
                            <legend class="visually-hidden">Transfer</legend>`;

    for (const transferName of TRANSPORTS) {
      template += `<div class="event__type-item">
                     <input id="event-type-${transferName.toLowerCase()}-1" class="event__type-input  visually-hidden" type="radio" name="event-type" value="${transferName.toLowerCase()}" ${(transferName === type) ? `checked` : ``}>
                     <label class="event__type-label  event__type-label--${transferName.toLowerCase()}" for="event-type-${transferName.toLowerCase()}-1">${transferName}</label>
                   </div>`;
    }

    template += `</fieldset>
                   <fieldset class="event__type-group">
                   <legend class="visually-hidden">Activity</legend>`;

    for (const activityName of STOPS) {
      template += `<div class="event__type-item">
                     <input id="event-type-${activityName.toLowerCase()}-1" class="event__type-input  visually-hidden" type="radio" name="event-type" value="${activityName.toLowerCase()}" ${(activityName === type) ? `checked` : ``}>
                     <label class="event__type-label  event__type-label--${activityName.toLowerCase()}" for="event-type-${activityName.toLowerCase()}-1">${activityName}</label>
                   </div>`;
    }

    template += `</fieldset>
                          </div>
                        </div>

                        <div class="event__field-group  event__field-group--destination">
                          <label class="event__label  event__type-output" for="event-destination-${id}">
                            ${type} ${(isTransfer) ? `to` : `in`}
                          </label>
                          <input class="event__input  event__input--destination" id="event-destination-${id}" type="text" name="event-destination" value="${city}" list="destination-list-1">
                          <datalist id="destination-list-${id}">`;

    CITIES.forEach((cityName) => {
      template += `<option value="${cityName}"></option>`;
    });

    template += `</datalist>
                        </div>

                        <div class="event__field-group  event__field-group--time">
                          <label class="visually-hidden" for="event-start-time-${id}">
                            From
                          </label>
                          <input class="event__input  event__input--time" id="event-start-time-${id}" type="text" name="event-start-time" value="${beginTime.toLocaleDateString(`en-GB`, {year: `2-digit`, month: `2-digit`, day: `2-digit`})} ${beginTime.toLocaleTimeString(`en-GB`, {timeStyle: `short`, hour12: false})}">
                          &mdash;
                          <label class="visually-hidden" for="event-end-time-${id}">
                            To
                          </label>
                          <input class="event__input  event__input--time" id="event-end-time-${id}" type="text" name="event-end-time" value="${endTime.toLocaleDateString(`en-GB`, {year: `2-digit`, month: `2-digit`, day: `2-digit`})} ${endTime.toLocaleTimeString(`en-GB`, {timeStyle: `short`, hour12: false})}">
                        </div>

                        <div class="event__field-group  event__field-group--price">
                          <label class="event__label" for="event-price-${id}">
                            <span class="visually-hidden">Price</span>
                            &euro;
                          </label>
                          <input class="event__input  event__input--price" id="event-price-${id}" type="text" name="event-price" value="${price}">
                        </div>

                        <button class="event__save-btn  btn  btn--blue" type="submit">Save</button>
                        <button class="event__reset-btn" type="reset">Delete</button>

                        <input id="event-favorite-${id}" class="event__favorite-checkbox  visually-hidden" type="checkbox" name="event-favorite" ${(isFavorite) ? `checked` : ``}>
                        <label class="event__favorite-btn" for="event-favorite-${id}">
                          <span class="visually-hidden">Add to favorite</span>
                          <svg class="event__favorite-icon" width="28" height="28" viewBox="0 0 28 28">
                            <path d="M14 21l-8.22899 4.3262 1.57159-9.1631L.685209 9.67376 9.8855 8.33688 14 0l4.1145 8.33688 9.2003 1.33688-6.6574 6.48934 1.5716 9.1631L14 21z"/>
                          </svg>
                        </label>

                        <button class="event__rollup-btn" type="button">
                          <span class="visually-hidden">Open event</span>
                        </button>
                      </header>`;
    if (city.length) {
      template += `<section class="event__details">
                        <section class="event__section  event__section--offers">
                          <h3 class="event__section-title  event__section-title--offers">Offers</h3>
                          <div class="event__available-offers">`;
      for (const [offerId, offerDetails] of offersList) {
        template += `<div class="event__offer-selector">
                      <input class="event__offer-checkbox  visually-hidden" id="event-offer-${offerId}-${id}" type="checkbox" name="event-offer-${offerId}" ${(offers[offerId]) ? `checked` : ``}>
                      <label class="event__offer-label" for="event-offer-${offerId}-${id}">
                        <span class="event__offer-title">${offerDetails.title}</span>
                        &plus;
                        &euro;&nbsp;<span class="event__offer-price">${offerDetails.price}</span>
                      </label>
                  </div>`;
      }
      template += `</section></section>`;
    }
    template += `</form>`;
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
