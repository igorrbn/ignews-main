import { GetStaticProps } from 'next';
import Head from 'next/head';
import { getPrismicClient } from '../../../services/prismic';
import styles from './styles.module.scss';
import * as Prismic from '@prismicio/client';
import { RichText } from 'prismic-dom';
import Link from 'next/link';
import { query as q } from 'faunadb';

type Post = {
  slug: string;
  title: string;
  excerpt: string;
  updatedAt: string;
};

interface PostsProps {
  posts: Post[];
}
export default function Posts({ posts }: PostsProps) {
  return (
    <>
      <Head>
        <title>Posts | Ignews</title>
      </Head>
      <main className={styles.container}>
        <div className={styles.posts}>
          {posts.map((post) => (
            <Link key={post.slug} href={`/posts/${post.slug}`}>
              <a>
                <time>{post.updatedAt}</time>
                <strong>{post.title}</strong>
                <p>{post.excerpt}</p>
              </a>
            </Link>
          ))}
        </div>
      </main>
    </>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient();
  const response = await prismic.query(
    [Prismic.predicate.at('document.type', 'post')],
    {
      fetch: ['post.title', 'post.content'],
      page: 1,
      pageSize: 100,
    },
  );
  const posts = response.results.map((post) => {
    /*
     * DICA de desempenho
     * -> Quando precisar realizar tratamento de dados realizar
     *   logo que obter o retorno da requisição
     */
    return {
      slug: post.uid,
      title: RichText.asText(post.data.title),
      excerpt:
        post.data.content.find((content) => content.type === 'paragraph')
          ?.text ?? '',
      updateAt: new Date(post.last_publication_date).toLocaleDateString(
        'pt-BR',
        {
          day: '2-digit',
          month: 'long',
          year: 'numeric',
        },
      ),
    };
  });
  /*
   * mode de consolar json completo DICA:
   * -> console.log(JSON.stringify(response, null, 2));
   */
  return {
    props: {
      posts,
    },
  };
};