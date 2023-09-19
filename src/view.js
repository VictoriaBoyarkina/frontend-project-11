/* eslint-disable no-param-reassign */
/* eslint-disable no-undef */

const errorHandler = (elements, err, i18n) => {
  elements.input.classList.add('is-invalid');
  elements.feedback.textContent = i18n.t(err.key);
};

const finishHandler = (elements) => {
  elements.input.classList.remove('is-invalid');
  elements.feedback.textContent = '';
  elements.input.focus();
  elements.form.reset();
};

export default (state, elements, i18n) => (path, value) => {
  switch (path) {
    case 'processState':
      if (value === 'failed') {
        errorHandler(elements, state.validation.error, i18n);
      }
      if (value === 'finished') {
        finishHandler(elements);
      }
      break;

    default:
      break;
  }
};
