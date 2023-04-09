import * as Prismic from '@prismicio/client';

// const endpoint = Prismic.getEndpoint(process.env.PRISMIC_ENDPOINT);
// export const getPrismicClient = Prismic.createClient(endpoint);
export function getPrismicClient(req?: unknown) {
    
  const prismic = Prismic.createClient(process.env.PRISMIC_ENDPOINT, {
    accessToken: process.env.PRISMIC_ACCESS_TOKEN,
  });
  return prismic;
}