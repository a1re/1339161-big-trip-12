const EVENTS_MIN = 15;
const EVENTS_MAX = 20;

import {generateEvents} from "./mock/events.js";
import {generateOffers} from "./mock/offers.js";
import {getRandomInt} from "./utils/common.js";
import {sortings} from "./utils/sortings.js";
import {filters} from "./utils/filters.js";

import TripPresenter from "./presenter/trip-presenter.js";
import HeaderPresenter from "./presenter/header-presenter.js";

import EventsModel from "./model/events-model.js";
import SortingsModel from "./model/sortings-model.js";
import FiltersModel from "./model/filters-model.js";
import OffersModel from "./model/offers-model.js";

const offerList = generateOffers();
const eventList = generateEvents(getRandomInt(EVENTS_MIN, EVENTS_MAX), offerList);
const eventsModel = new EventsModel(eventList);
const offersModel = new OffersModel(offerList);
const sortingsModel = new SortingsModel(sortings);
const filtersModel = new FiltersModel(filters);

const headerElement = document.querySelector(`.trip-main`);
const eventListElement = document.querySelector(`.trip-events`);
const newEventElement = document.querySelector(`.trip-main__event-add-btn`);

const tripPresenter = new TripPresenter(
    eventListElement,
    eventsModel,
    offersModel,
    filtersModel,
    sortingsModel
);

const headerPresenter = new HeaderPresenter(
    headerElement,
    eventsModel,
    offersModel,
    filtersModel
);

tripPresenter.init();
headerPresenter.init();

newEventElement.addEventListener(`click`, (evt) => {
  evt.preventDefault();
  tripPresenter.createNewEvent();
});
