const renderModalWindow = (elements, state, postId) => {
  const currentPost = state.content.posts.find(({ id }) => id === postId);
  const { title, description, link } = currentPost;

  elements.modal.title.textContent = title;
  elements.modal.body.textContent = description;
  elements.modal.button.setAttribute('href', link);
};

const renderFeeds = (state, container) => {
  container.innerHTML = '';
  state.content.feeds.forEach((feed) => {
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
};

const renderPosts = (state, container, i18n) => {
  container.innerHTML = '';
  state.content.posts.forEach((post) => {
    const li = document.createElement('li');
    li.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-start', 'border-0', 'border-end-0');
    const a = document.createElement('a');
    a.classList.add('fw-bold');
    a.setAttribute('href', post.link);
    a.setAttribute('target', '_blank');
    a.setAttribute('data-id', post.id);
    a.setAttribute('rel', 'noopener noreferrer');
    a.textContent = post.title;
    if (state.uiState.visitedLinksIds.includes(post.id)) {
      a.classList.add('fw-normal', 'link-secondary');
      a.classList.remove('fw-bold');
    }
    const btn = document.createElement('button');
    btn.classList.add('btn', 'btn-outline-primary', 'btn-sm');
    btn.setAttribute('type', 'button');
    btn.setAttribute('data-id', post.id);
    btn.setAttribute('data-bs-toggle', 'modal');
    btn.setAttribute('data-bs-target', '#modal');
    btn.textContent = i18n.t('openModal');
    li.appendChild(a);
    li.appendChild(btn);
    container.appendChild(li);
  });
};

const mapping = {
  feeds: (state, container) => renderFeeds(state, container),
  posts: (state, container, i18n) => renderPosts(state, container, i18n),
};

const createContainer = (type, elements, state, i18n) => {
  const list = document.querySelector(`ul.${type}`);
  if (list) {
    mapping[type](state, list, i18n);
  } else {
    const container = document.querySelector(`.${type}`);
    const card = document.createElement('div');
    card.classList.add('card', 'border-0');
    const cardBody = document.createElement('div');
    cardBody.classList.add('card-body');
    const cardTitle = document.createElement('h2');
    cardTitle.classList.add('card-title', 'h4');
    cardTitle.textContent = i18n.t(`${type}`);
    cardBody.appendChild(cardTitle);
    card.appendChild(cardBody);
    const ul = document.createElement('ul');
    ul.classList.add('list-group', 'border-0', 'rounded-0', `${type}`);
    mapping[type](state, ul, i18n);
    card.appendChild(ul);
    container.appendChild(card);
  }
};

const handlerSuccessFinish = (elements, i18n) => {
  elements.feedback.classList.remove('text-danger');
  elements.feedback.classList.add('text-success');
  elements.feedback.textContent = i18n.t('sucсess');

  elements.submitBtn.removeAttribute('disabled');

  elements.input.removeAttribute('readonly');
  elements.input.classList.remove('is-invalid');
  elements.input.focus();
  elements.form.reset();
};

const handlerFinishWithError = (elements, error, i18n) => {
  elements.feedback.classList.remove('text-success');
  elements.feedback.classList.add('text-danger');
  if (error === "Cannot read properties of null (reading 'textContent')") {
    elements.feedback.textContent = i18n.t('errors.parseError');
  } else {
    elements.feedback.textContent = i18n.t(`errors.${error.replace(/ /g, '')}`);
  }

  if (error !== 'Network Error') {
    elements.input.classList.add('is-invalid');
  }

  elements.submitBtn.disabled = false;
  elements.input.disabled = false;
};

const handlerProcessState = (elements, state, value, i18n) => {
  switch (value) {
    case 'filling':
      break;
    case 'finished':
      handlerSuccessFinish(elements, i18n);
      break;
    case 'error':
      handlerFinishWithError(elements, state.process.error, i18n);
      break;
    case 'sending':
      elements.submitBtn.getAttribute('disabled');
      elements.input.getAttribute('readonly');
      break;
    default:
      throw new Error(`Unknown process state: ${value}`);
  }
};

export default (elements, state, i18n) => (path, value) => {
  switch (path) {
    case 'process.processState':
      handlerProcessState(elements, state, value, i18n);
      break;

    case 'process.error':
      handlerFinishWithError(elements, state.process.error, i18n);
      break;

    case 'uiState.modalId':
      renderModalWindow(elements, state, value);
      break;

    case 'uiState.visitedLinksIds':
      createContainer('posts', elements, state, i18n);
      break;

    case 'content.posts':
      createContainer('posts', elements, state, i18n);
      break;

    case 'content.feeds':
      createContainer('feeds', elements, state, i18n);
      break;

    default:
      break;
  }
};
