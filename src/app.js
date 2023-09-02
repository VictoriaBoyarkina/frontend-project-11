/* eslint-disable no-undef */
import * as yup from 'yup';
import watch from './view.js';

export default (() => {
  // BEGIN (write your solution here)

  const elements = {
    form: document.querySelector('.rss-form'),
    fields: {},
  };

  const state = {
    form: {
      valid: false,
      errors: [],
    },
  };

  const watchedState = watch(elements, state);

  const schema = yup.object({
    website: yup.string().required('ССылка должна быть валидным URL').url(),
  });

  elements.form.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const url = Object.fromEntries(formData);
    schema
      .validate(url, { abortEarly: false })
      .then((res) => {
        if (Object.keys(res).length > 0) {
          watchedState.form.errors = [];
          watchedState.form.valid = true;
        } else {
          const validationErrors = res.inner.reduce((acc, cur) => {
            const { path, message } = cur;
            const errorData = acc[path] || [];
            return { ...acc, [path]: [...errorData, message] };
          }, {});
          watchedState.form.errors = validationErrors;
        }
      })
      .catch((err) => console.log(err));
  });
  // END
});
