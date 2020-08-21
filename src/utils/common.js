/**
 * Генерация случайного целого числе с небольшой надстройкой — его можно сделать
 * кратным какому-то другому числу за счет указания третьего параметра divider
 * (по умолчанию 1).
 *
 * @param  {Int} a       - Граница диапазона.
 * @param  {Int} b       - Граница диапазона.
 * @param  {Int} divider - Делитель (по умолчанию 1).
 * @return {Int}         - Случайное число.
 */
export const getRandomInt = (a = 0, b = 1, divider = 1) => {
  const lower = Math.floor(Math.min(a, b));
  const upper = Math.ceil(Math.max(a, b));

  const randomInt = Math.floor(lower + Math.random() * (upper - lower + 1));
  return randomInt - randomInt % divider;
};

/**
 * Класс для создаение и удалениея обработчика нажатия на кнопку Esc. C помощью
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
