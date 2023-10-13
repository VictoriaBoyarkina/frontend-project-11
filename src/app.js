/* eslint-disable no-param-reassign */
//* eslint-disable no-undef */
import * as yup from 'yup';
import onChange from 'on-change';
import i18next from 'i18next';
import axios from 'axios';
import _ from 'lodash';
// eslint-disable-next-line import/no-named-as-default
import render from './view.js';
import parse from './parser.js';
import ru from './ru.js';

const createPosts = (state, newPosts, feedId) => {
  const preparedPosts = newPosts.map((post) => ({ ...post, feedId, id: _.uniqueId() }));
  state.content.posts = [...state.content.posts, ...preparedPosts];
};

const getAxiosResponse = (link) => {
  const fullLink = `https://allorigins.hexlet.app/get?disableCache=true&url=${link}`;
  return axios.get(fullLink);
};

const getNewPosts = (state) => {
  const promises = state.listOfFeeds
    .map(({ link, feedId }) => getAxiosResponse(link)
      .then((response) => {
        const [, posts] = parse(response.data.contents, state);
        const addedPosts = state.content.posts.map((post) => post.link);
        const newPosts = posts.filter((post) => !addedPosts.includes(post.link));
        if (newPosts.length > 0) {
          createPosts(state, newPosts, feedId);
        }
        return Promise.resolve();
      })
      .catch(() => {
        // eslint-disable-next-line no-param-reassign
        state.watchedState.process.error = 'Network Error';
      })
      .finally(() => {
        // eslint-disable-next-line no-param-reassign
        state.process.processState = 'filling';
      }));

  Promise.allSettled(promises)
    .finally(() => {
      setTimeout(() => getNewPosts(state), 5000);
    });
};

const addListenerToPosts = (state) => {
  const postsContainer = document.querySelector('ul.posts');
  postsContainer.addEventListener('click', (e) => {
    const { id } = e.target.dataset;
    state.uiState.visitedLinksIds = [...state.uiState.visitedLinksIds, id];
    state.uiState.modalId = id;
  });
};

const initialView = (elements, i18n) => {
  const {
    heading, subheading, submitBtn, labelForUrl, example, modal,
  } = elements;
  heading.textContent = i18n.t('heading');
  subheading.textContent = i18n.t('subheading');
  labelForUrl.textContent = i18n.t('labelForUrl');
  submitBtn.textContent = i18n.t('submitBtn');
  example.textContent = i18n.t('example');
  modal.button.textContent = i18n.t('fullArticle');
  modal.close.textContent = i18n.t('closeModal');
};

export default (() => {
  yup.setLocale({
    mixed: {
      notOneOf: () => 'notOneOf',
      default: () => 'default',
    },
    string: {
      url: () => 'url',
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
        heading: document.querySelector('.heading'),
        subheading: document.querySelector('.subheading'),
        labelForUrl: document.querySelector('[for="url-input"]'),
        submitBtn: document.querySelector('[aria-label="add"]'),
        example: document.querySelector('.example'),
        modal: {
          title: document.querySelector('.modal-title'),
          body: document.querySelector('.modal-body'),
          button: document.querySelector('.full-article'),
          close: document.querySelector('.modal-footer > [data-bs-dismiss="modal"]'),
        },
        form: document.querySelector('form'),
        input: document.querySelector('input'),
        feedback: document.querySelector('.feedback'),
      };

      initialView(elements, i18n);

      const state = {
        process: {
          processState: 'filling',
          error: '',
        },
        data: '',
        validation: {
          state: 'valid',
        },
        listOfFeeds: [],
        content: {
          feeds: [],
          posts: [],
        },
        uiState: {
          visitedLinksIds: [],
          modalId: '',
        },
      };

      const watchedState = onChange(state, render(elements, state, i18n));
      getNewPosts(watchedState);

      elements.form.addEventListener('submit', (e) => {
        e.preventDefault();
        const listOfFeeds = state.listOfFeeds.map((feeds) => feeds.link);
        const schema = yup.string().url().notOneOf(listOfFeeds).trim();
        const formData = new FormData(e.target);
        watchedState.data = formData.get('url');

        schema.validate(state.data)
          .then(() => {
            watchedState.valid = true;
            watchedState.process.processState = 'sending';
            return getAxiosResponse(watchedState.data);
          })
          .then((response) => {
            const data = response.data.contents;
            const { feed, posts } = parse(data);
            const feedId = _.uniqueId();

            watchedState.content.feeds.push({ ...feed, feedId, link: watchedState.data });
            createPosts(watchedState, posts, feedId);
            addListenerToPosts(watchedState);

            watchedState.process.processState = 'finished';
          })
          .catch((error) => {
            watchedState.valid = false;
            watchedState.process.error = error.message ?? 'defaultError';
            watchedState.process.processState = 'error';
            console.log(error.message);
          });
      });
      return watchedState;
    })
    .catch((err) => {
      console.log(err);
    });
});
