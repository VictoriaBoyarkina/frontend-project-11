/* eslint-disable no-undef */
import * as yup from 'yup';
import onChange from 'on-change';
import i18next from 'i18next';
import axios from 'axios';
import render from './view.js';
import parse from './parser.js';
import ru from './ru.js';

const initialView = (elements, i18n) => {
  const {
    heading, subheading, submitBtn, labelForUrl, example,
  } = elements.initialView;
  heading.textContent = i18n.t('heading');
  subheading.textContent = i18n.t('subheading');
  labelForUrl.textContent = i18n.t('labelForUrl');
  submitBtn.textContent = i18n.t('submitBtn');
  example.textContent = i18n.t('example');
};

export default (() => {
  yup.setLocale({
    mixed: {
      notOneOf: () => ({ key: 'errors.validation.notOneOf' }),
      default: () => ({ key: 'errors.validation.default' }),
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
    resources: { ru },
  })
    .then(() => {
      const elements = {
        initialView: {
          heading: document.querySelector('.heading'),
          subheading: document.querySelector('.subheading'),
          labelForUrl: document.querySelector('[for="url-input"]'),
          submitBtn: document.querySelector('[aria-label="add"]'),
          example: document.querySelector('.example'),
        },
        feedsContainer: document.querySelector('.feeds'),
        postsContainer: document.querySelector('.posts'),
        form: document.querySelector('form'),
        input: document.querySelector('input'),
        feedback: document.querySelector('.feedback'),
      };

      initialView(elements, i18n);

      const state = {
        processState: 'filling',
        data: '',
        validation: {
          state: 'valid',
          error: '',
        },
        listOfFeeds: [],
        rssData: {
          feeds: [],
          posts: [],
        },
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
          })
          .then(() => {
            axios.get(`https://allorigins.hexlet.app/raw?url=${state.data}`)
              .then((response) => {
                parse(response.data, state);
                console.log(state);
                watchedState.processState = 'finished';
              })
              .catch((err) => console.log(err));
          })
          .catch((err) => {
            watchedState.validation.state = 'invalid';
            watchedState.validation.error = err.message;
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
