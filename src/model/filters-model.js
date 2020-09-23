import Observer from "../utils/observer.js";
import {UpdateMode} from "../const.js";

/**
 * Модель фильтраций. Для инициализации в конструтор класса необходимо передать
 * массив объектов с id, названием и коллбеком.
 */
export default class FiltersModel extends Observer {
  /**
   * Конструктор класса
   *
   * @param  {Array} filterList     - Массив со списком видов фильтраций.
   * @param  {Observer} pointsModel - Модель списка точек.
   */
  constructor(filterList, pointsModel) {
    super();
    this._pointsModel = pointsModel;
    this._activeFilter = null;
    this._defaultFilter = filterList.find((filter) => filter.isDefault).id;
    this._filterMap = new Map();
    filterList.forEach((filter) => {
      this._filterMap.set(filter.id, Object.assign({}, filter, {
        isAvalible: this._getAvalibilty(filter.callback)
      }));
    });

    this.enable = this.enable.bind(this);

    this._pointsModel.subscribe(this.enable);
    this.reset();
  }

  /**
   * Сеттер активного метода фильтрации.
   *
   * @param {String} filterId - Id фильтрации (должна существовать).
   */
  set active(filterId) {
    if (!this._filterMap.has(filterId)) {
      throw new Error(`Unknown filter ${filterId}`);
    }

    if (this._filterMap.get(filterId).isAvalible) {
      this._activeFilter = filterId;
      this._notify(UpdateMode.MAJOR);
    }
  }

  /**
   * Геттер активного метода фильтрации.
   *
   * @return {String} - Id активной фильтрации.
   */
  get active() {
    if (!this._activeFilter) {
      throw new Error(`No active filter is set`);
    }
    return this._activeFilter;
  }

  /**
   * Геттер коллбека для сортировки массива активного метода сортировки.
   *
   * @return {Function} - Функция-коллбек для фильтрации.
   */
  get callback() {
    if (!this._activeFilter) {
      throw new Error(`No active filter is set`);
    }
    return this._filterMap.get(this._activeFilter).callback;
  }

  /**
   * Геттер списка доступных фильтраций в виде массива.
   *
   * @return {Array} - Массив со списком точек.
   */
  get list() {
    const filterList = [];
    this._filterMap.forEach((filter) => {
      filterList.push({
        id: filter.id,
        title: filter.title,
        isAvalible: filter.isAvalible,
        isActive: filter.id === this.active
      });
    });
    return filterList;
  }

  /**
   * Сброс фильтрации до метода по умолчанию.
   */
  reset() {
    if (!this._defaultFilter) {
      throw new Error(`No default filter is set`);
    }
    this._activeFilter = this._defaultFilter;
    this._notify(UpdateMode.MAJOR);
  }

  /**
   * Отключение всех фильтров.
   */
  disable() {
    for (const [filterId, filter] of this._filterMap) {
      filter.isAvalible = false;
      this._filterMap.set(filterId, filter);
    }
  }

  /**
   * Установка статусов фильтрв. Те фильтры, которые отфильтровывают все точки,
   * получают статус отключенных.
   */
  enable() {
    for (const [filterId, filter] of this._filterMap) {
      filter.isAvalible = this._getAvalibilty(filter.callback);
      this._filterMap.set(filterId, filter);
    }
  }

  /**
   * Подсчет количества точек по фильтру.
   *
   * @param  {Function} filter - Функция фильтрации для списка точек.
   * @return {Number}          - Количество точек после фильтрации.
   */
  _getAvalibilty(filter) {
    return this._pointsModel.list.filter(filter).length > 0;
  }
}
