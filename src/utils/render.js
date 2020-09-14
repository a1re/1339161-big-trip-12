import {AbstractView} from "../view/abstract-view.js";

/**
 * Словарь позиций внутри элементов DOM для размещения потомков.
 *
 * @type {Object}
 */
export const RenderPosition = {
  BEFOREBEGIN: `beforebegin`,
  AFTERBEGIN: `afterbegin`,
  BEFOREEND: `beforeend`,
  AFTEREND: `afterend`
};

/**
 * Добавление DOM-элемента в струкутру документа.
 *
 * @param  {Node/Abstract} container - Узел для добавления нового элемента.
 * @param  {Node/Abstract} child     - Сам элемент, который будет добавляться.
 * @param  {string} place            - Место добавления, должно соответствовать
 *                                     словарю RenderPosition.
 * @return {void}
 */
export const render = (container, child, place) => {
  if (container instanceof AbstractView) {
    container = container.element;
  }

  if (child instanceof AbstractView) {
    child = child.element;
  }

  switch (place) {
    case RenderPosition.BEFOREBEGIN:
      container.before(child);
      break;
    case RenderPosition.AFTERBEGIN:
      container.prepend(child);
      break;
    case RenderPosition.BEFOREEND:
      container.append(child);
      break;
    case RenderPosition.AFTEREND:
      container.after(child);
      break;
  }
};

/**
 * Добавление элемента как строкового шаблона внутрь DOM-узла.
 *
 * @param  {Node} container  - Узел для добавления нового элемента.
 * @param  {string} template - Строка с шаблона для добавления.
 * @param  {string} place    - Место добавления, должно соответствовать значениям
 *                             первого аргумента функции insertAdjacenHTML.
 * @return {void}
 */
export const renderTemplate = (container, template, place) => {
  if (container instanceof AbstractView) {
    container = container.element;
  }

  container.insertAdjacentHTML(place, template);
};

/**
 * Конвертация строкового шаблона в DOM-элемент.
 *
 * @param  {string} template - Строка с шаблона для добавления.
 * @return {Node}            - DOM-элемент.
 */
export const createElement = (template) => {
  const newElement = document.createElement(`div`);
  newElement.innerHTML = template;

  return newElement.firstChild;
};
