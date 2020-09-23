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
   * Геттер списка предложений для трансфера/точки в виде массива.
   *
   * @return {Array} - Список предложений в виде массива объектов.
   */
  get list() {
    return this._typeList.slice();
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
