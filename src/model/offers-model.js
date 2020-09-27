import {Datatype} from "../const.js";

/**
 * Модель дополнительных предложений. Для инициализации в конструтор класса
 * необходимо передать массив объектов с id, названием и ценой
 */
export default class OffersModel {
  /**
   * Конструктор класса
   *
   * @param  {Api} api - Объект API для доступа к данным.
   */
  constructor(api) {
    this._api = api;
    this._isDelivered = false;
    this._isLoading = false;
    this._offerList = [];
  }

  /**
   * Загрузка данных с сервера.
   *
   * @return {Promise} - Объект Promise после запроса через fetch.
   */
  loadData() {
    this._isLoading = true;
    return this._api.get(Datatype.OFFERS).
      then((offerList) => {
        this._offerList = offerList;
        this._isLoading = false;
        this._isDelivered = true;
      });
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
   * Геттар списка предложений для трансфера/точки в виде массива.
   *
   * @return {Array} - Список предложений в виде массива объектов.
   */
  get list() {
    return this._offerList.slice();
  }

  /**
   * Получение объекта предложения по его id.
   *
   * @param  {Number} id - Id предложения
   * @return {Object}    - Объект с информацией о предложении.
   */
  getById(id) {
    return this._offerList.find((offer) => offer.id === id);
  }
}
