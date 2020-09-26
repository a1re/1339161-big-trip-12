import {getAuthString} from "./utils/common.js";
import {sortings} from "./utils/sortings.js";
import {filters} from "./utils/filters.js";
import {types} from "./utils/types.js";
import {API_END_POINT, ButtonState} from "./const.js";

import Api from "./utils/api.js";

import PointsModel from "./model/points-model.js";
import SortingsModel from "./model/sortings-model.js";
import FiltersModel from "./model/filters-model.js";
import OffersModel from "./model/offers-model.js";
import TypesModel from "./model/types-model.js";
import DestinationsModel from "./model/destinations-model.js";

import TripPresenter from "./presenter/trip-presenter.js";
import HeaderPresenter from "./presenter/header-presenter.js";
import StatsPresenter from "./presenter/stats-presenter.js";

const api = new Api(API_END_POINT, getAuthString());

const destinationsModel = new DestinationsModel(api);
const typesModel = new TypesModel(types);
const pointsModel = new PointsModel(api, typesModel.list);
const offersModel = new OffersModel(api);
const sortingsModel = new SortingsModel(sortings);
const filtersModel = new FiltersModel(filters, pointsModel);

const headerElement = document.querySelector(`.trip-main`);
const pageContainerElement = document.querySelector(`.page-main .page-body__container`);
const newPointElement = document.querySelector(`.trip-main__event-add-btn`);

const displayTable = () => {
  statsPresenter.destroy();
  headerPresenter.enableFilters();
  tripPresenter.init();
};

const displayStats = () => {
  tripPresenter.destroy();
  headerPresenter.disableFilters();
  statsPresenter.init();
};

const setNewPointButtonState = (state) => {
  newPointElement.disabled = state;
};

const tripPresenter = new TripPresenter(
    pageContainerElement,
    pointsModel,
    destinationsModel,
    offersModel,
    typesModel,
    filtersModel,
    sortingsModel,
    setNewPointButtonState
);

const headerPresenter = new HeaderPresenter(
    headerElement,
    pointsModel,
    filtersModel,
    displayTable,
    displayStats
);

const statsPresenter = new StatsPresenter(
    pageContainerElement,
    pointsModel,
    typesModel
);

tripPresenter.init();
headerPresenter.init();
pointsModel.loadData();

newPointElement.addEventListener(`click`, (evt) => {
  evt.preventDefault();
  displayTable();
  setNewPointButtonState(ButtonState.DISABLED);
  tripPresenter.createNewPoint();
});
