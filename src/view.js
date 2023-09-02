/* eslint-disable no-undef */
import onChange from 'on-change';

export default (elements, state) => {
  // BEGIN (write your solution here)
  const { form, fields } = elements;

  fields.input = document.getElementById('url-input');
  fields.feedback = document.querySelector('.feedback');

  const handleErrors = () => {
    if (!state.form.errors) {
      fields.input.classList.remove('is-invalid');
      fields.input.classList.add('is-valid');
    } else {
      fields.input.classList.add('is-invalid');
      fields.input.classList.remove('is-valid');
      fields.feedback.textContent = state.form.errors;
    }
    form.reset();
    form.focus();
  };

  const clearErrors = () => {
    fields.feedback.textContent = '';
    form.reset();
    form.focus();
  };

  const watchedState = onChange(state, (path) => {
    switch (path) {
      case 'form.errors':
        handleErrors();
        break;
      case 'form.valid':
        clearErrors();
        break;
      default:
        break;
    }
  });

  return watchedState;
  // END
};
