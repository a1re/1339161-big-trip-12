import {CITIES, STOPS, TRANSPORTS, TRANSPORT_OFFERS_MAP, STOP_OFFERS_MAP} from "../const.js";
import {getRandomInt} from "../utils/common.js";
import {AbstractView} from "./abstract-view.js";

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

export class EventEditView extends AbstractView {
  constructor(event = DEFAULT_EVENT_VALUES) {
    super();
    this._event = event;

    this._closeHandler = this._closeHandler.bind(this);
    this._submitHandler = this._submitHandler.bind(this);
    this._toggleFavoriteHandler = this._toggleFavoriteHandler.bind(this);
  }

  get template() {
    const eventTypeSelector = this._makeEventTypeSelector();
    const citySelector = this._makeCitySelector();
    const timeInput = this._makeTimeInput();
    const priceInput = this._makePriceInput();
    const favoriteButton = this._makeFavoriteButton();
    const offersList = this._makeOffersList();

    return `<form class="event event--edit" action="#" method="post">
        <header class="event__header">
          ${eventTypeSelector}

          ${citySelector}

          ${timeInput}

          ${priceInput}

          <button class="event__save-btn  btn  btn--blue" type="submit">Save</button>
          <button class="event__reset-btn" type="reset">Delete</button>

          ${favoriteButton}

          <button class="event__rollup-btn" type="button">
            <span class="visually-hidden">Open event</span>
          </button>
        </header>
        ${offersList}
      </form>`;
  }

  _closeHandler(evt) {
    evt.preventDefault();
    this._callback.close();
  }

  _submitHandler(evt) {
    evt.preventDefault();
    this._callback.submit();
  }

  _toggleFavoriteHandler(evt) {
    evt.preventDefault();
    this._callback.toggleFavorite();
  }

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
                value="${transferName.toLowerCase()}"
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
                value="${activityName.toLowerCase()}"
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

  _makeCitySelector() {
    const {id, type, city} = this._event;
    const isTransfer = TRANSPORTS.indexOf(type) >= 0;

    let template = `
      <div class="event__field-group  event__field-group--destination">
        <label class="event__label  event__type-output" for="event-destination-${id}">
          ${type} ${(isTransfer) ? `to` : `in`}
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

  _makeTimeInput() {
    const {id} = this._event;

    const beginMonth = this._event.beginTime.toLocaleDateString(
        `en-GB`,
        {year: `2-digit`, month: `2-digit`, day: `2-digit`}
    );
    const beginTime = this._event.beginTime.toLocaleTimeString(
        `en-GB`,
        {timeStyle: `short`, hour12: false}
    );
    const endMonth = this._event.endTime.toLocaleDateString(
        `en-GB`,
        {year: `2-digit`, month: `2-digit`, day: `2-digit`}
    );
    const endTime = this._event.endTime.toLocaleTimeString(
        `en-GB`,
        {timeStyle: `short`, hour12: false}
    );

    return `
      <div class="event__field-group  event__field-group--time">
        <label class="visually-hidden" for="event-start-time-${id}">From</label>
        <input
            class="event__input  event__input--time"
            id="event-start-time-${id}"
            type="text"
            name="event-start-time"
            value="${beginMonth} ${beginTime}">
        &mdash;
        <label class="visually-hidden" for="event-end-time-${id}">To</label>
        <input
            class="event__input  event__input--time"
            id="event-end-time-${id}"
            type="text"
            name="event-end-time"
            value="${endMonth} ${endTime}">
      </div>`;
  }

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

  _makeOffersList() {
    const {id, type, offers} = this._event;
    const offersList = (TRANSPORTS.indexOf(type) >= 0) ? TRANSPORT_OFFERS_MAP : STOP_OFFERS_MAP;

    let template = `
        <section class="event__details">
          <section class="event__section  event__section--offers">
            <h3 class="event__section-title  event__section-title--offers">Offers</h3>
            <div class="event__available-offers">`;

    for (const [offerId, offerDetails] of offersList) {
      template += `
              <div class="event__offer-selector">
                <input
                    class="event__offer-checkbox  visually-hidden"
                    id="event-offer-${offerId}-${id}"
                    type="checkbox"
                    name="event-offer-${offerId}" ${(offers[offerId]) ? `checked` : ``}>
                <label class="event__offer-label" for="event-offer-${offerId}-${id}">
                  <span class="event__offer-title">${offerDetails.title}</span>
                  &plus;
                  &euro;&nbsp;<span class="event__offer-price">${offerDetails.price}</span>
                </label>
              </div>`;
    }

    template += `
            </div>
          </section>
        </section>`;

    return template;
  }

  set closeHandler(callback) {
    this._callback.close = callback;

    this.element.querySelector(`.event__rollup-btn`).addEventListener(`click`, this._closeHandler);
  }

  set submitHandler(callback) {
    this._callback.submit = callback;

    this.element.addEventListener(`submit`, this._submitHandler);
  }

  set toggleFavoriteHandler(callback) {
    this._callback.toggleFavorite = callback;

    this.element.querySelector(`.event__favorite-btn`).addEventListener(`click`, this._toggleFavoriteHandler);
  }
}
