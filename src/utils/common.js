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
 * Создание хэндлера для обработки нажатии клавиши Esc. Хэндлер должен
 * быть добавлен как событие при помощи addEventListener(`key`).
 *
 * @param  {function} callback - Коллбек, который будет вызван при нажатии
 *                               Esc.
 * @return {function}          - Функция для закрепления.
 */
export const bindToEsc = (callback) => {
  const onEscKeyDown = (keyEvent) => {
    if (keyEvent.key === `Escape` || keyEvent.key === `Esc`) {
      keyEvent.preventDefault();
      callback();
      document.removeEventListener(`keydown`, onEscKeyDown);
    }
  };
  return onEscKeyDown;
};
