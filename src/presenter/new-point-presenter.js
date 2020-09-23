import PointFormView from "../view/point-form-view.js";

import {render, RenderPosition} from "../utils/render.js";
import {EscHandler} from "../utils/common.js";
import {UpdateMode} from "../const.js";

export default class NewPointPresenter {
  /**
   * Конструктор презентера новой точки маршрута
   *
   * @param  {Node} dayListElement      - Узел DOM, относительно которого нужно
   *                                      разместить форму.
   * @param  {Observer} pointsModel     - Модель для работы с cобытиями
   * @param  {Object} destinationsModel - Модель для работы с городами.
   * @param  {Object} typesModel        - Модель для работы с типами событий
   * @param  {Object} offersModel       - Модель для работы со спец. предложениями.
   */
  constructor(dayListElement, pointsModel, destinationsModel, typesModel, offersModel) {
    this._pointsModel = pointsModel;
    this._destinationsModel = destinationsModel;
    this._offersModel = offersModel;
    this._typesModel = typesModel;

    this._pointFormComponent = null;
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
    if (this._pointFormComponent) {
      this._pointFormComponent.remove();
      this._pointFormComponent = null;
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
    this._pointFormComponent = new PointFormView(
        this._typesModel.getList(),
        this._offersModel.getList(),
        this._destinationsModel.getList()
    );

    this._closeFormByEsc = new EscHandler(this.destroy);
    this._pointFormComponent.closeHandler = this.destroy;
    this._pointFormComponent.submitHandler = this._submitForm;

    return this._pointFormComponent.element;
  }

  /**
   * Добавление нового события через сабмит формы.
   *
   * @param  {Object} pointData - Данные формы для сохранения.
   */
  _submitForm(pointData) {
    this._pointsModel.add(UpdateMode.MINOR, pointData);
    this.destroy();
  }
}
