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
