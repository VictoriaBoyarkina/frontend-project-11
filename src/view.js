/* eslint-disable no-param-reassign */
/* eslint-disable no-undef */

const errorHandler = (elements, err) => {
  elements.input.classList.add('is-invalid');
  elements.feedback.textContent = err;
};

const finishHandler = (elements) => {
  elements.input.classList.remove('is-invalid');
  elements.feedback.textContent = '';
  elements.input.focus();
  elements.form.reset();
};

export default (state, elements) => (path, value) => {
  switch (path) {
    case 'processState':
      if (value === 'failed') {
        errorHandler(elements, state.validation.error);
      }
      if (value === 'finished') {
        finishHandler(elements);
      }
      break;

    default:
      break;
  }
};
