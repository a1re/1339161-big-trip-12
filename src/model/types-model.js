/**
 * Модель типов точек. Для инициализации в конструтор класса
 * необходимо передать массив объектов с данными.
 */
export default class TypesModel {
  /**
   * Конструктор класса
   *
   * @param  {Array} typeList - Массив со списком спец. предложений.
   */
  constructor(typeList = []) {
    this._typeList = typeList.slice();
  }

  /**
   * Получение списка предложений для трансфера/точки в виде массива.
   *
   * @param  {Boolean} isTransport - Флаг ограничения вывода. Если он установлен
   *                                 true, то вернется массив транспортных типов,
   *                                 Если false — остановочных типовю Если не
   *                                 задавать, вернутся все.
   * @return {Array}               - Список предложений в виде массива объектов.
   */
  getList(isTransport) {
    if (typeof isTransport !== `undefined`) {
      this._typeList.filter((type) => type.isTransport === isTransport);
    }

    return this._typeList;
  }

  /**
   * Получение объекта типа точки по его id.
   *
   * @param  {String} id - Id предложения
   * @return {Object}    - Объект с информацией о типе точки.
   */
  getById(id) {
    return this._typeList.find((type) => type.id === id);
  }
}
