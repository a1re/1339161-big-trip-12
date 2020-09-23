const EVENTS_MIN = 15;
const EVENTS_MAX = 20;

import {render, RenderPosition} from "./utils/render.js";

import {generateEvents} from "./mock/events.js";
import {generateOffers} from "./mock/offers.js";
import {generateDestinations} from "./mock/destinations.js";

import {getRandomInt} from "./utils/common.js";
import {sortings} from "./utils/sortings.js";
import {filters} from "./utils/filters.js";
import {types} from "./utils/types.js";

import EventsModel from "./model/events-model.js";
import SortingsModel from "./model/sortings-model.js";
import FiltersModel from "./model/filters-model.js";
import OffersModel from "./model/offers-model.js";
import TypesModel from "./model/types-model.js";
import DestinationsModel from "./model/destinations-model.js";

import TripEventsView from "./view/trip-events-view.js";

import TripPresenter from "./presenter/trip-presenter.js";
import HeaderPresenter from "./presenter/header-presenter.js";
import StatsPresenter from "./presenter/stats-presenter.js";

const destinationsModel = new DestinationsModel(generateDestinations());
const destinationList = destinationsModel.getList().map((destination) => destination.name);

const offerList = generateOffers();
const eventList = generateEvents(getRandomInt(EVENTS_MIN, EVENTS_MAX), offerList, destinationList);
const typesModel = new TypesModel(types);
const eventsModel = new EventsModel(eventList, typesModel.getList());
const offersModel = new OffersModel(offerList);
const sortingsModel = new SortingsModel(sortings);
const filtersModel = new FiltersModel(filters);

const headerElement = document.querySelector(`.trip-main`);
const pageContainerElement = document.querySelector(`.page-main .page-body__container`);
const newEventElement = document.querySelector(`.trip-main__event-add-btn`);

const tripEventsComponent = new TripEventsView();
render(pageContainerElement, tripEventsComponent, RenderPosition.BEFOREEND);

const displayTable = () => {
  statsPresenter.destroy();
  tripPresenter.init();
};

const displayStats = () => {
  tripPresenter.destroy();
  statsPresenter.init();
};

const tripPresenter = new TripPresenter(
    tripEventsComponent.element,
    eventsModel,
    destinationsModel,
    typesModel,
    offersModel,
    filtersModel,
    sortingsModel
);

const headerPresenter = new HeaderPresenter(
    headerElement,
    eventsModel,
    offersModel,
    filtersModel,
    displayTable,
    displayStats
);

const statsPresenter = new StatsPresenter(
    tripEventsComponent.element,
    eventsModel
);

tripPresenter.init();
headerPresenter.init();

newEventElement.addEventListener(`click`, (evt) => {
  evt.preventDefault();
  displayTable();
  tripPresenter.createNewEvent();
});
