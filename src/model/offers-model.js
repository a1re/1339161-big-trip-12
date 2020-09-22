/**
 * Модель дополнительных предложений. Для инициализации в конструтор класса
 * необходимо передать массив объектов с id, названием и ценой
 */
export default class OffersModel {
  /**
   * Конструктор класса
   *
   * @param  {Array} offerList - Массив со списком спец. предложений.
   */
  constructor(offerList = []) {
    this._offerList = offerList.slice();
  }

  /**
   * Получение списка предложений для трансфера/точки в виде массива.
   *
   * @param  {Boolean} isTransport - Флаг ограничения вывода. Если он установлен
   *                                 true, то вернется массив предложений для
   *                                 транспортных событий. Если false — массив
   *                                 предложений для остановок. Если не задавать,
   *                                 вернутся все.
   * @return {Array}               - Список предложений в виде массива объектов.
   */
  getList(isTransport) {
    if (typeof isTransport !== `undefined`) {
      this._offerList.filter((offer) => offer.isTransport === isTransport);
    }

    return this._offerList;
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
