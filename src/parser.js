// eslint-disable-next-line consistent-return
function parse(data, state) {
  const parser = new DOMParser();
  const htmLDocument = parser.parseFromString(data, 'text/xml');
  const rss = htmLDocument.querySelector('rss');
  if (!rss) {
    // eslint-disable-next-line no-param-reassign
    state.errors = 'rssError';
  } else {
    // eslint-disable-next-line no-param-reassign
    const feedTitle = htmLDocument.querySelector('title');
    const feedDescription = htmLDocument.querySelector('description');
    const feeds = ({
      title: feedTitle.textContent,
      description: feedDescription.textContent,
    });
    const items = htmLDocument.querySelectorAll('item');
    const posts = [];
    items.forEach((item) => {
      const itemTitle = item.querySelector('title');
      const itemLink = item.querySelector('link');
      const itemDescription = item.querySelector('description');
      posts.push({
        title: itemTitle.textContent,
        link: itemLink.nextSibling.textContent,
        description: itemDescription.textContent,
      });
    });
    return [feeds, posts];
  }
}

export default parse;
