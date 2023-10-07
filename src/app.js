/* eslint-disable no-undef */
import * as yup from 'yup';
import onChange from 'on-change';
import i18next from 'i18next';
import axios from 'axios';
import _ from 'lodash';
import render from './view.js';
import parse from './parser.js';
import ru from './ru.js';

const createPosts = (state, newPosts, feedId) => {
  const preparedPosts = newPosts.map((post) => ({ ...post, feedId, id: _.uniqueId() }));
  // eslint-disable-next-line no-param-reassign
  state.rssData.posts = [...state.rssData.posts, ...preparedPosts];
  state.processState = 'finished';
};

const getNewPosts = (state) => {
  const promises = state.listOfFeeds
    .map(({ link, feedId }) => axios.get(`https://allorigins.hexlet.app/raw?url=${link}`)
      .then((response) => {
        const posts = parser(response.data.contents);
        const addedPosts = state.rssData.posts.map((post) => post.link);
        const newPosts = posts.filter((post) => !addedPosts.includes(post.link));
        console.log('hi!');
        if (newPosts.length > 0) {
          createPosts(state, newPosts, feedId);
        }
        return Promise.resolve();
      })
      .catch((err) => {
        watchedState.netError = err.message;
      }));

  Promise.allSettled(promises)
    .finally(() => {
      setTimeout(() => getNewPosts(state), 5000);
    });
};

const initialView = (elements, i18n) => {
  const {
    heading, subheading, submitBtn, labelForUrl, example, modal,
  } = elements.initialView;
  heading.textContent = i18n.t('heading');
  subheading.textContent = i18n.t('subheading');
  labelForUrl.textContent = i18n.t('labelForUrl');
  submitBtn.textContent = i18n.t('submitBtn');
  example.textContent = i18n.t('example');
  modal.fullArticle.textContent = i18n.t('fullArticle');
  modal.closeModal.textContent = i18n.t('closeModal');
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
          modal: {
            modalTitle: document.querySelector('.modal-title'),
            modalBody: document.querySelector('.modal-body'),
            fullArticle: document.querySelector('.full-article'),
            closeModal: document.querySelector('.modal-footer > [data-bs-dismiss="modal"]'),
          },
        },
        body: document.querySelector('body'),
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
        errors: '',
        listOfFeeds: [],
        rssData: {
          feeds: [],
          posts: [],
        },
        uiState: {
          viewedPostsId: [],
        },
      };

      const watchedState = onChange(state, render(state, elements, i18n));
      getNewPosts(watchedState);

      elements.initialView.modal.fullArticle.addEventListener('click', (e) => {
        const { id } = e.target.dataset;
        watchedState.uiState.viewedPostsId = [...watchedState.uiState.viewedPostsId, id];
      });

      elements.form.addEventListener('submit', (e) => {
        const listOfFeeds = state.listOfFeeds.map((feeds) => feeds.link);
        const schema = yup.string().url().notOneOf(listOfFeeds).trim();
        e.preventDefault();
        watchedState.processState = 'sent';
        const formData = new FormData(e.target);
        state.data = formData.get('url');

        schema.validate(state.data)
          .then(() => {
            watchedState.validation.state = 'valid';
            watchedState.processState = 'sending';
          })
          .then(() => {
            const feed = { link: state.data, feedId: _.uniqueId() };
            watchedState.listOfFeeds = [...watchedState.listOfFeeds, feed];
            axios.get(`https://allorigins.hexlet.app/raw?url=${state.data}`)
              .then((response) => {
                const posts = parse(response.data, watchedState);
                createPosts(watchedState, posts, feed.feedId);
              })
              .catch(() => {
                watchedState.error = 'netError';
              });
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
