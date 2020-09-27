
import {Datatype} from "../const.js";

/**
 * Модель пунктов назначения.
 */
export default class DestinationsModel {
  /**
   * Конструктор класса
   *
   * @param  {Api} api - Объект API для доступа к данным.
   */
  constructor(api) {
    this._api = api;
    this._isDelivered = false;
    this._isLoading = false;
    this._destinationList = [];
  }

  /**
   * Загрузка данных с сервера.
   *
   * @return {Promise} - Объект Promise после запроса через fetch.
   */
  loadData() {
    this._isLoading = true;
    return this._api.get(Datatype.DESTINATIONS).
      then((destinationList) => {
        this._destinationList = destinationList;
        this._isLoading = false;
        this._isDelivered = true;
      });
  }

  /**
   * Геттер списка пунктов назначения.
   *
   * @return {Array} Массив пунктов назначения.
   */
  get list() {
    return this._destinationList.slice();
  }

  /**
   * Получение статуса данных.
   *
   * @return {Boolean} - True - если данные загружены,
   *                     False - если не грузились..
   */
  get isDelivered() {
    return this._isDelivered;
  }

  /**
   * Получение статуса загрузки данных.
   *
   * @return {Boolean} - True - если данные еще грузятся,
   *                     False - если уже загружены.
   */
  get isLoading() {
    return this._isLoading;
  }

  /**
   * Получение объекта пункта назначения по его названию.
   *
   * @param  {String} name - Имя пункта назначения.
   * @return {Object}      - Объект с информацией о пункте назначения.
   */
  getByName(name) {
    return this._destinationList.find((destination) => destination.name === name);
  }
}
