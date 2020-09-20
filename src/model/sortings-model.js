import Observer from "../utils/observer.js";

/**
 * Модель сортировок. Для инициализации в конструтор класса необходимо передать
 * массив объектов с id, названием, коллбеком и флагом группировки.
 */
export default class SortingsModel extends Observer {
  /**
   * Конструктор класса
   *
   * @param  {Array} sortingList - Массив со списком видов сортировок.
   */
  constructor(sortingList = []) {
    super();
    this._sortingMap = new Map();
    this._activeSorting = null;
    this._defaultSorting = null;
    sortingList.forEach((sorting) => {
      this._sortingMap.set(sorting.id, Object.assign({}, sorting));
      if (sorting.isDefault) {
        this._defaultSorting = sorting.id;
      }
    });
    this.reset();
  }

  /**
   * Геттер списка доступных сортировок в виде массива.
   *
   * @return {Array} - Массив со список событий
   */
  get list() {
    const sortingList = [];
    for (const [sortingId, sortingObject] of this._sortingMap) {
      sortingList.push({
        id: sortingId,
        title: sortingObject.title,
        isActive: this._activeSorting === sortingId,
        isGrouped: sortingObject.isGrouped
      });
    }
    return sortingList;
  }

  /**
   * Сеттер активного метода сортировки.
   *
   * @param {String} sortingId - Id сортировки (должна существовать).
   */
  set active(sortingId) {
    if (!this._sortingMap.has(sortingId)) {
      throw new Error(`Unknown sorting method ${sortingId}`);
    }

    this._activeSorting = sortingId;
  }

  /**
   * Геттер активного метода сортировки.
   *
   * @return {String} - Id активной сортировки.
   */
  get active() {
    if (!this._activeSorting) {
      throw new Error(`No active sorting is set`);
    }
    return this._activeSorting;
  }

  /**
   * Геттер свойства группировки активного метода сортировки
   *
   * @return {Boolean} - true - если нужно группировать,
   *                     false — если нет.
   */
  get isGrouped() {
    if (!this._activeSorting) {
      throw new Error(`No active sorting is set`);
    }
    return this._sortingMap.get(this._activeSorting).isGrouped;
  }

  /**
   * Геттер коллбека для сортировки массива активного метода сортировки.
   *
   * @return {Function} - Функция-коллбек для сортировки.
   */
  get callback() {
    if (!this._activeSorting) {
      throw new Error(`No active sorting is set`);
    }
    return this._sortingMap.get(this._activeSorting).callback;
  }

  /**
   * Сброс сортировки до метода по умолчанию.
   */
  reset() {
    if (!this._defaultSorting) {
      throw new Error(`No default sorting is set`);
    }
    this._activeSorting = this._defaultSorting;
  }
}
