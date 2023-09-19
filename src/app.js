/* eslint-disable no-undef */
import * as yup from 'yup';
import onChange from 'on-change';
import i18next from 'i18next';
import render from './view.js';
import resources from './ru.js';

export default (() => {
  yup.setLocale({
    mixed: {
      notOneOf: () => ({ key: 'errors.validation.notOneOf' }),
      default: () => ({ key: 'errors.validation.dafault' }),
    },
    string: {
      url: () => ({ key: 'errors.validation.url' }),
    },
  });

  const defaultLang = 'ru';
  const i18n = i18next.createInstance();
  i18n.init({
    lng: defaultLang,
    debug: false,
    resources,
  })
    .then(() => {
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

      const watchedState = onChange(state, render(state, elements, i18n));

      elements.form.addEventListener('submit', (e) => {
        const schema = yup.string().url().notOneOf(state.listOfFeeds).trim();
        e.preventDefault();
        watchedState.processState = 'sent';
        const formData = new FormData(e.target);
        state.data = formData.get('url');

        schema.validate(state.data)
          .then(() => {
            watchedState.validation.state = 'valid';
            watchedState.processState = 'sending';
            watchedState.listOfFeeds.push(state.data);
            watchedState.processState = 'finished';
            console.log(state.listOfFeeds);
          })
          .catch((err) => {
            watchedState.validation.state = 'invalid';
            watchedState.validation.error = err.message;
            console.log(err.message);
            watchedState.processState = 'failed';
          })
          .finally(() => {
            watchedState.processState = 'filling';
          });
      });
      return watchedState;
    // END
    })
    .catch((err) => {
      console.log(err);
    });
});
