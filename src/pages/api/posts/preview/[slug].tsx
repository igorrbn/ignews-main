import { GetStaticPaths, GetStaticProps } from 'next';
import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { RichText } from 'prismic-dom';
import { getPrismicClient } from '../../../../services/prismic';
import styles from '../post.module.scss';

interface PostProps {
  post: {
    slug: string;
    title: string;
    content: string;
    updatedAt: string;
  };
}
export default function PostPreview({ post }: PostProps) {
  const { data: session } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (session?.activeSubscription) {
      router.push(`/post/${post.slug}`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

  return (
    <>
      <Head>
        <title>{post.title} | Ignews</title>
      </Head>
      <main className={styles.container}>
        <article className={styles.post}>
          <h1>{post.title}</h1>
          <time>{post.updatedAt}</time>
          <div
            className={`${styles.postContent} ${styles.previewContent}`}
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
          <div className={styles.continueReading}>
            Wanna continue reading?
            <Link href="/">
              <a href="">Subscribe now 🤗</a>
            </Link>
          </div>
        </article>
      </main>
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  return {
    paths: [
      /*
       * para que a pagina seja gerada estaticamente no build da aplicação add os slugs
       * {
       *  params: { slug: '' },
       * },
       */
    ],
    /*
     * são 3 valores true, false, blocking
     * true - ele carrega no backend depois carrega pagina (ruim para SO)
     * false - retorna 404 só não foi encontrado
     * blocking - se não n tiver no modo statico ele carrega por server side render carregando e mostrando o html só quando tiver tudo pronto
     */

    fallback: 'blocking',
  };
};
export const getStaticProps: GetStaticProps = async ({ params }) => {
  const { slug } = params;

  const prismic = getPrismicClient();
  //TODO: "publication" na aula na verdade é "post" e o getByUID recebe o <any>
  const response = await prismic.getByUID<any>('post', String(slug), {});
  const post = {
    slug,
    title: RichText.asText(response.data.title),
    content: RichText.asHtml(response.data.content.splice(0, 3)),
    updatedAt: new Date(response.last_publication_date).toLocaleDateString(
      'pt-BR',
      {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      },
    ),
  };
  return {
    props: {
      post,
    },
    redirect: 60 * 30, //30 minutos
  };
};