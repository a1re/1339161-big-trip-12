/**
 * Генерация случайного целого числе с небольшой надстройкой — его можно сделать
 * кратным какому-то другому числу за счет указания третьего параметра divider
 * (по умолчанию 1).
 *
 * @param  {Number} a       - Граница диапазона.
 * @param  {Number} b       - Граница диапазона.
 * @param  {Number} divider - Делитель (по умолчанию 1).
 * @return {Number}         - Случайное число.
 */
export const getRandomInt = (a = 0, b = 1, divider = 1) => {
  const lower = Math.floor(Math.min(a, b));
  const upper = Math.ceil(Math.max(a, b));

  const randomInt = Math.floor(lower + Math.random() * (upper - lower + 1));
  return randomInt - randomInt % divider;
};

/**
 * Класс для создаения и удалениея обработчика нажатия на кнопку Esc. C помощью
 * конструктора обработчик создается, с помощью метода unbbind() — удаляется.
 *
 * constructor:
 * @param  {Function} callback - Функция, которая должна вызываться при нажатии на
 *                               Esc.
 */
export class EscHandler {
  constructor(callback) {
    this._callback = this._bindToEsc(callback);
    document.addEventListener(`keydown`, this._callback);
  }

  _bindToEsc(callback) {
    const onEscKeyDown = (keyEvent) => {
      if (keyEvent.key === `Escape` || keyEvent.key === `Esc`) {
        keyEvent.preventDefault();
        callback();
        document.removeEventListener(`keydown`, onEscKeyDown);
      }
    };
    return onEscKeyDown;
  }

  unbind() {
    document.removeEventListener(`keydown`, this._callback);
  }
}

/**
 * Обновление элемента в массиве с объектами. Объект сверяется по свойству
 * id. Если элемент для обновления не найден, возвращается исходный массив
 * по ссылке, если найден — копию с обновленным объектом.
 *
 * @param  {Array} items   - Исходный массив с объектами.
 * @param  {Object} update - Объект с обновленными данными.
 * @return {Array}         - Массив с обновленными данными.
 */
export const updateItem = (items, update) => {
  const index = items.findIndex((item) => item.id === update.id);

  if (index === -1) {
    return items;
  }

  return [
    ...items.slice(0, index),
    update,
    ...items.slice(index + 1)
  ];
};
