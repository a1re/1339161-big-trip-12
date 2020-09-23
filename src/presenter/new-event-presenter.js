import EventFormView from "../view/event-form-view.js";

import {render, RenderPosition} from "../utils/render.js";
import {EscHandler} from "../utils/common.js";
import {UpdateMode} from "../const.js";

export default class NewEventPresenter {
  /**
   * Конструктор презентера новой точки маршрута
   *
   * @param  {Node} dayListElement      - Узел DOM, относительно которого нужно
   *                                      разместить форму.
   * @param  {Observer} eventsModel     - Модель для работы с cобытиями
   * @param  {Object} destinationsModel - Модель для работы с городами.
   * @param  {Object} typesModel        - Модель для работы с типами событий
   * @param  {Object} offersModel       - Модель для работы со спец. предложениями.
   */
  constructor(dayListElement, eventsModel, destinationsModel, typesModel, offersModel) {
    this._eventsModel = eventsModel;
    this._destinationsModel = destinationsModel;
    this._offersModel = offersModel;
    this._typesModel = typesModel;

    this._eventFormComponent = null;
    this._closeFormByEsc = null;

    this._submitForm = this._submitForm.bind(this);
    this.destroy = this.destroy.bind(this);

    render(
        dayListElement,
        this._createElement(),
        RenderPosition.BEFOREBEGIN
    );
  }

  /**
   * Удаление формы создания события.
   */
  destroy() {
    if (this._eventFormComponent) {
      this._eventFormComponent.remove();
      this._eventFormComponent = null;
    }

    if (this._closeFormByEsc) {
      this._closeFormByEsc.unbind();
      this._closeFormByEsc = null;
    }
  }

  /**
   * Создаение элементы формы создания события.
   *
   * @return {Node} - Элемент DOM, доступный для вставки в документ.
   */
  _createElement() {
    this._eventFormComponent = new EventFormView(
        this._offersModel.getList(),
        this._typesModel.getList(),
        this._destinationsModel.getList()
    );

    this._closeFormByEsc = new EscHandler(this.destroy);
    this._eventFormComponent.closeHandler = this.destroy;
    this._eventFormComponent.submitHandler = this._submitForm;

    return this._eventFormComponent.element;
  }

  /**
   * Добавление нового события через сабмит формы.
   *
   * @param  {Object} eventData - Данные формы для сохранения.
   */
  _submitForm(eventData) {
    this._eventsModel.add(UpdateMode.MINOR, eventData);
    this.destroy();
  }
}
