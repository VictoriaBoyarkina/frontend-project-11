// eslint-disable-next-line consistent-return
export default (data) => {
  const parser = new DOMParser();
  const parsedDocument = parser.parseFromString(data, 'text/xml');
  const feedTitle = parsedDocument.querySelector('title');
  const feedDescription = parsedDocument.querySelector('description');
  const feeds = ({
    title: feedTitle.textContent,
    description: feedDescription.textContent,
  });
  const items = parsedDocument.querySelectorAll('item');
  const posts = [];
  items.forEach((item) => {
    const itemTitle = item.querySelector('title');
    const itemLink = item.querySelector('link');
    const itemDescription = item.querySelector('description');
    posts.push({
      title: itemTitle.textContent,
      link: itemLink.textContent,
      description: itemDescription.textContent,
    });
  });
  return [feeds, posts];
};
