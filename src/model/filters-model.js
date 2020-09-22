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
   * @param  {Array} filterList - Массив со списком видов фильтраций.
   */
  constructor(filterList = []) {
    super();
    this._filterMap = new Map();
    this._activeFilter = null;
    this._defaultFilter = null;
    filterList.forEach((filter) => {
      this._filterMap.set(filter.id, Object.assign({}, filter));
      if (filter.isDefault) {
        this._defaultFilter = filter.id;
      }
    });
    this.reset();
  }

  /**
   * Геттер списка доступных фильтраций в виде массива.
   *
   * @return {Array} - Массив со список событий
   */
  get list() {
    return [...this._filterMap.values()];
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

    this._activeFilter = filterId;
    this._notify(UpdateMode.MAJOR);
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
   * Сброс фильтрации до метода по умолчанию.
   */
  reset() {
    if (!this._defaultFilter) {
      throw new Error(`No default filter is set`);
    }
    this._activeFilter = this._defaultFilter;
  }
}
