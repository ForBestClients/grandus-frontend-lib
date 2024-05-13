export const reqGetHost = req => {
  if (process.env.HOST) {
    return process.env.HOST;
  }

  let protocol = 'https://';
  const host = req?.headers?.host ?? '';
  if (host.indexOf('localhost') > -1) {
    protocol = 'http://';
  }

  return protocol + host;
};