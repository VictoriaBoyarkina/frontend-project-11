import _ from 'lodash';

function parse(data, state) {
  const parser = new DOMParser();
  const htmLDocument = parser.parseFromString(data, 'text/html');
  const feedTitle = htmLDocument.querySelector('title');
  const feedDescription = htmLDocument.querySelector('description');
  state.rssData.feeds.push({
    title: feedTitle.textContent,
    description: feedDescription.textContent,
  });
  const items = htmLDocument.querySelectorAll('item');
  items.forEach((item) => {
    const itemTitle = item.querySelector('title');
    const itemLink = item.querySelector('link');
    state.rssData.posts.push({
      title: itemTitle.textContent,
      link: itemLink.nextSibling.textContent,
      id: _.uniqueId(),
    });
  });
}

export default parse;
