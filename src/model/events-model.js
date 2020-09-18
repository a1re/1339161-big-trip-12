import Observer from "../utils/observer.js";

/**
 * Модель событий. Для инициализации в конструтор класса необходимо передать
 * массив со списом событий, где каждый элемент — объект со списком свойств
 * события.
 */
export default class EventsModel extends Observer {
  /**
   * Конструктор класса
   *
   * @param  {Array} eventList - Массив со список событий.
   */
  constructor(eventList = []) {
    super();
    this._eventList = eventList;
  }

  /**
   * Геттер списка событий.
   *
   * @return {Array} - Массив со список событий
   */
  get eventList() {
    return this._eventList;
  }

  /**
   * Обновление точки маршрута. Объект с данными для обновления должен
   * содержать свойство id, которое соответствует id одной из существующих
   * точек в маршруте.
   *
   * @param  {String} updateMode - Режим обновления. Должен соответствовать
   *                               константе из перечисления UpdateMode.
   * @param  {Object} eventData  - Объект с обновленными данными.
   * @return {void}
   */
  update(updateMode, eventData) {
    const index = this._eventList.findIndex((event) => event.id === eventData.id);

    if (index === -1) {
      throw new Error(`Can't update unexisting event`);
    }

    this._eventList = [
      ...this._eventList.slice(0, index),
      eventData,
      ...this._eventList.slice(index + 1)
    ];

    this._notify(updateMode, eventData);
  }

  /**
   * Добавление точки маршрута.
   *
   * @param  {String} updateMode - Режим обновления. Должен соответствовать
   *                               константе из перечисления UpdateMode.
   * @param  {Object} eventData  - Объект с новой точкой маршрута.
   * @return {void}
   */
  add(updateMode, eventData) {
    this._eventList = [
      eventData,
      ...this._eventList
    ];

    this._notify(updateMode, eventData);
  }

  /**
   * Удаление точки маршрута. Объект с данными для обновления должен
   * содержать свойство id, которое соответствует id одной из существующих
   * точек в маршруте.
   *
   * @param  {String} updateMode - Режим обновления. Должен соответствовать
   *                               константе из перечисления UpdateMode.
   * @param  {Object} eventData  - Объект с обновленными данными.
   * @return {void}
   */
  deleteTask(updateMode, eventData) {
    const index = this._eventList.findIndex((event) => event.id === eventData.id);

    if (index === -1) {
      throw new Error(`Can't delete unexisting event`);
    }

    this._eventList = [
      ...this._eventList.slice(0, index),
      ...this._eventList.slice(index + 1)
    ];

    this._notify(updateMode);
  }
}
