/* eslint-disable no-param-reassign */
/* eslint-disable no-undef */

const errorHandler = (elements, err, i18n) => {
  elements.input.classList.add('is-invalid');
  elements.feedback.classList.add('text-danger');
  elements.feedback.textContent = i18n.t(err.key);
};

const finishHandler = (elements, i18n) => {
  elements.input.classList.remove('is-invalid');
  elements.input.focus();
  elements.form.reset();
  elements.feedback.classList.remove('text-danger');
  elements.feedback.classList.add('text-success');
  elements.feedback.textContent = i18n.t('errors.validation.successful');
};

export default (state, elements, i18n) => (path, value) => {
  switch (path) {
    case 'processState':
      if (value === 'failed') {
        errorHandler(elements, state.validation.error, i18n);
      }
      if (value === 'finished') {
        finishHandler(elements, i18n);
      }
      break;

    default:
      break;
  }
};
