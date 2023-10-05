/* eslint-disable no-param-reassign */
/* eslint-disable no-undef */
const openModal = (elements, e, state) => {
  const { modalTitle, modalBody, fullArticle } = elements.initialView.modal;
  const { id } = e.target.dataset;
  state.rssData.posts.forEach((post) => {
    if (post.id === id) {
      modalTitle.textContent = post.title;
      modalBody.textContent = post.description;
      fullArticle.setAttribute('href', `${post.link}`);
    }
  });
};

const renderFeeds = (state, container) => {
  state.rssData.feeds.forEach((feed) => {
    const li = document.createElement('li');
    li.classList.add('list-group-item', 'border-0', 'border-end-0');
    const h3 = document.createElement('h3');
    h3.classList.add('h6', 'm-0');
    h3.textContent = feed.title;
    const p = document.createElement('p');
    p.classList.add('m-0', 'small', 'text-black-50');
    p.textContent = feed.description;
    li.appendChild(h3);
    li.appendChild(p);
    container.appendChild(li);
  });
  return container;
};

const renderPosts = (state, container, i18n, elements) => {
  state.rssData.posts.forEach((post) => {
    const li = document.createElement('li');
    li.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-start', 'border-0', 'border-end-0');
    const a = document.createElement('a');
    a.classList.add('fw-bold');
    a.setAttribute('href', post.link);
    a.setAttribute('target', '_blank');
    a.setAttribute('data-id', post.id);
    a.setAttribute('rel', 'noopener noreferrer');
    a.textContent = post.title;
    const btn = document.createElement('button');
    btn.classList.add('btn', 'btn-outline-primary', 'btn-sm');
    btn.setAttribute('type', 'button');
    btn.setAttribute('data-id', post.id);
    btn.setAttribute('data-bs-toggle', 'modal');
    btn.setAttribute('data-bs-target', '#modal');
    btn.textContent = i18n.t('openModal');
    btn.addEventListener('click', (e) => {
      openModal(elements, e, state);
    });
    li.appendChild(a);
    li.appendChild(btn);
    container.appendChild(li);
  });
  return container;
};

const mapping = {
  feeds: (state, container) => renderFeeds(state, container),
  posts: (state, container, i18n, elements) => renderPosts(state, container, i18n, elements),
};

const renderRss = (elements, state, i18n) => {
  Object.entries(state.rssData).forEach(([key]) => {
    const container = (key === 'feeds') ? elements.feedsContainer : elements.postsContainer;
    const card = document.createElement('div');
    card.classList.add('card', 'border-0');
    const cardBody = document.createElement('div');
    cardBody.classList.add('card-body');
    const cardTitle = document.createElement('h2');
    cardTitle.classList.add('card-title', 'h4');
    cardTitle.textContent = i18n.t(`${key}`);
    cardBody.appendChild(cardTitle);
    card.appendChild(cardBody);
    const ul = document.createElement('ul');
    ul.classList.add('list-group', 'border-0', 'rounded-0');
    const newUl = mapping[key](state, ul, i18n, elements);
    card.appendChild(newUl);
    container.appendChild(card);
  });
};

const errorHandler = (elements, err, i18n) => {
  elements.input.classList.add('is-invalid');
  elements.feedback.classList.add('text-danger');
  elements.feedback.textContent = i18n.t(err.key);
};

const finishHandler = (elements, state, i18n) => {
  elements.input.classList.remove('is-invalid');
  elements.input.focus();
  elements.form.reset();
  elements.feedback.classList.remove('text-danger');
  elements.feedback.classList.add('text-success');
  elements.feedback.textContent = i18n.t('errors.validation.successful');
  renderRss(elements, state, i18n);
};

export default (state, elements, i18n) => (path, value) => {
  switch (path) {
    case 'processState':
      if (value === 'failed') {
        errorHandler(elements, state.validation.error, i18n);
      }
      if (value === 'finished') {
        finishHandler(elements, state, i18n);
      }
      break;

    default:
      break;
  }
};
