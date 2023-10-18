/* eslint-disable no-unused-vars */
// eslint-disable-next-line consistent-return
/* eslint-disable no-unused-vars */
export default (data) => {
  const parser = new DOMParser();
  const parsedDocument = parser.parseFromString(data, 'application/xml');
  const error = parsedDocument.querySelector('parsererror');
  const feedTitle = parsedDocument.querySelector('title');
  const feedDescription = parsedDocument.querySelector('description');
  const feed = ({
    title: feedTitle.textContent,
    description: feedDescription.textContent,
  });

  const items = [...parsedDocument.querySelectorAll('item')];
  const posts = items.map((item) => {
    const itemTitle = item.querySelector('title');
    const itemLink = item.querySelector('link');
    const itemDescription = item.querySelector('description');
    return ({
      title: itemTitle.textContent,
      link: itemLink.textContent,
      description: itemDescription.textContent,
    });
  });
  return { feed, posts };
};
