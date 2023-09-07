/* eslint-disable no-undef */

export default (state, elements) => {
  // BEGIN (write your solution here)
  const { form, input, feedback } = elements;

  const handleErrors = () => {
    if (!state.form.errors) {
      input.classList.remove('is-invalid');
      input.classList.add('is-valid');
    } else {
      input.classList.add('is-invalid');
      input.classList.remove('is-valid');
      feedback.textContent = state.form.errors;
    }
    form.reset();
    form.focus();
  };

  const clearErrors = () => {
    feedback.textContent = '';
    form.reset();
    form.focus();
  };

  switch (state.validation.state) {
    case 'valid':
      clearErrors();
      break;
    case 'invalid':
      handleErrors();
      break;
    default:
      break;
  }
  // END
};
