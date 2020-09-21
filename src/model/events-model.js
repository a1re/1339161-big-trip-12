import Observer from "../utils/observer.js";
import {TRANSPORTS} from "../const.js";
import moment from "moment";

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
    this._eventList = this._processData(eventList);
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

    const updatedEventList = this._eventList.slice();
    updatedEventList[index] = eventData;

    this._eventList = this._processData(updatedEventList);

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
    this._eventList = this._processData([eventData, ...this._eventList]);

    this._notify(updateMode);
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
  delete(updateMode, eventData) {
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

  /**
   * Обработка исходных данных и добавление необходимых для работы
   * дополнительных флагов и значений.
   *
   * @param  {Array} eventList - Список событий в исходном виде.
   * @return {Array}           - Список событий в подготовленном для работы виде.
   */
  _processData(eventList) {
    if (eventList.length === 0) {
      return [];
    }

    const processedData = [];
    let lastDate = null;
    eventList.sort((eventA, eventB) => eventA.beginTime.valueOf() - eventB.beginTime.valueOf());
    const beginDate = moment(eventList[0].beginTime).startOf(`day`);

    eventList.forEach((event) => {
      const eventDate = moment(event.beginTime, `YYYY-MM-DD`);
      if (eventDate !== lastDate) {
        lastDate = eventDate;
      }

      processedData.push(Object.assign({}, event, {
        dayNumber: moment(event.beginTime).startOf(`day`).diff(beginDate, `days`) + 1,
        dayDate: eventDate,
        isTransport: TRANSPORTS.indexOf(event.type) >= 0
      }));
    });

    return processedData;
  }
}
