/* eslint-disable no-undef */
import * as yup from 'yup';
import onChange from 'on-change';
import render from './view.js';

export default (() => {
  // BEGIN (write your solution here)

  const elements = {
    form: document.querySelector('form'),
    input: document.querySelector('input'),
    feedback: document.querySelector('.feedback'),
  };

  const state = {
    processState: 'filling',
    data: '',
    validation: {
      state: 'valid',
      error: '',
    },
    listOfFeeds: [],
  };

  const watchedState = onChange(state, () => render(state, elements));

  const schema = yup.object({
    website: yup.string().required('ССылка должна быть валидным URL').url(),
  });

  elements.form.addEventListener('submit', (e) => {
    e.preventDefault();
    watchedState.processState = 'sent';
    const formData = new FormData(e.target);
    const url = Object.fromEntries(formData);
    schema
      .validate(url, { abortEarly: false })
      .then((res) => {
        if (Object.keys(res).length < 0) {
          watchedState.validation.error = '';
          watchedState.validation.state = 'valid';
          watchedState.listOfFeeds.push(res);
        } else {
          const validationErrors = res.inner.reduce((acc, cur) => {
            const { path, message } = cur;
            const errorData = acc[path] || [];
            return { ...acc, [path]: [...errorData, message] };
          }, {});
          watchedState.validation.state = 'invalid';
          watchedState.validation.error = validationErrors;
        }
      })
      .catch((err) => console.log(err));
  });
  return watchedState;
  // END
});
