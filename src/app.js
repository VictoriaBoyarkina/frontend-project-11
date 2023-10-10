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
  // eslint-disable-next-line no-param-reassign
  state.rssData.posts = [...state.rssData.posts, ...preparedPosts];
  // eslint-disable-next-line no-param-reassign
  state.processState = 'finished';
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
        const addedPosts = state.rssData.posts.map((post) => post.link);
        const newPosts = posts.filter((post) => !addedPosts.includes(post.link));
        if (newPosts.length > 0) {
          createPosts(state, newPosts, feedId);
        }
        return Promise.resolve();
      })
      .catch(() => {
        // eslint-disable-next-line no-param-reassign
        state.errors = 'netError';
      })
      .finally(() => {
        // eslint-disable-next-line no-param-reassign
        state.processState = 'filling';
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
            openModalButton: document.querySelectorAll('[data-bs-toggle="modal"]'),
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
        modal: {
          state: 'closed',
          id: '',
        },
        touched: false,
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

      // elements.initialView.modal.openModalButton.forEach((button) => {
      // console.log('hi')
      // button.addEventListener('click', (e) => {
      // const { id } = e.target.dataset;
      // watchedState.modal.id = id;
      // watchedState.modal.state = 'open';
      // });
      // });

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
            getAxiosResponse(state.data)
              .then((response) => {
                const [feeds, posts] = parse(response.data.contents, watchedState);
                const feed = { link: state.data, feedId: _.uniqueId() };
                watchedState.listOfFeeds = [...watchedState.listOfFeeds, feed];
                state.rssData.feeds = [...state.rssData.feeds, feeds];
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
