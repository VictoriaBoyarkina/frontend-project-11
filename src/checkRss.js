export default (data) => {
  const parser = new DOMParser();
  const parsedDocument = parser.parseFromString(data, 'text/xml');
  const error = parsedDocument.querySelector('parsererror');
  return error;
};
