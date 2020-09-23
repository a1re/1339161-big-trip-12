const POINTS_MIN = 15;
const POINTS_MAX = 20;

import {render, RenderPosition} from "./utils/render.js";

import {generatePoints} from "./mock/points.js";
import {generateOffers} from "./mock/offers.js";
import {generateDestinations} from "./mock/destinations.js";

import {getRandomInt} from "./utils/common.js";
import {sortings} from "./utils/sortings.js";
import {filters} from "./utils/filters.js";
import {types} from "./utils/types.js";

import PointsModel from "./model/points-model.js";
import SortingsModel from "./model/sortings-model.js";
import FiltersModel from "./model/filters-model.js";
import OffersModel from "./model/offers-model.js";
import TypesModel from "./model/types-model.js";
import DestinationsModel from "./model/destinations-model.js";

import TripPointsView from "./view/trip-points-view.js";

import TripPresenter from "./presenter/trip-presenter.js";
import HeaderPresenter from "./presenter/header-presenter.js";
import StatsPresenter from "./presenter/stats-presenter.js";

const destinationsModel = new DestinationsModel(generateDestinations());
const destinationList = destinationsModel.getList().map((destination) => destination.name);

const offerList = generateOffers(types);
const pointList = generatePoints(getRandomInt(POINTS_MIN, POINTS_MAX), offerList, destinationList);

const typesModel = new TypesModel(types);
const pointsModel = new PointsModel(pointList, typesModel.getList());
const offersModel = new OffersModel(offerList);
const sortingsModel = new SortingsModel(sortings);
const filtersModel = new FiltersModel(filters, pointsModel);

const headerElement = document.querySelector(`.trip-main`);
const pageContainerElement = document.querySelector(`.page-main .page-body__container`);
const newPointElement = document.querySelector(`.trip-main__event-add-btn`);

const tripPointsComponent = new TripPointsView();
render(pageContainerElement, tripPointsComponent, RenderPosition.BEFOREEND);

const displayTable = () => {
  statsPresenter.destroy();
  tripPresenter.init();
};

const displayStats = () => {
  tripPresenter.destroy();
  statsPresenter.init();
};

const tripPresenter = new TripPresenter(
    tripPointsComponent.element,
    pointsModel,
    destinationsModel,
    typesModel,
    offersModel,
    filtersModel,
    sortingsModel
);

const headerPresenter = new HeaderPresenter(
    headerElement,
    pointsModel,
    filtersModel,
    displayTable,
    displayStats
);

const statsPresenter = new StatsPresenter(
    tripPointsComponent.element,
    pointsModel
);

tripPresenter.init();
headerPresenter.init();

newPointElement.addEventListener(`click`, (evt) => {
  evt.preventDefault();
  displayTable();
  tripPresenter.createNewPoint();
});
