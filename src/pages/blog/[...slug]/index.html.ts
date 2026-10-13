// Blog index + posts in V4's frame. With "Show blog on the website" OFF in Sanity this builds NO routes (G17). Dummy posts: staging only.
import { renderShell } from '../../../lib/v4'
import { blogIndexHtml, blogPostHtml } from '../../../lib/v4pages'
import { getSite, q, showPlaceholders, blogOn } from '../../../lib/sanity'

export async function getStaticPaths() {
  const { settings, postCount } = await getSite()
  if (!blogOn(settings, postCount)) return []
  const posts = await q(`*[_type=="post" && (isPlaceholder != true || $ph)]|order(publishedAt desc){
    title, "slug": slug.current, publishedAt, excerpt, coverImage, body, seo, isPlaceholder, featured,
    "author": author->{name, role}, "categories": categories[]->title}`, { ph: showPlaceholders })
  return [
    { params: { slug: undefined }, props: { posts, post: null } },
    ...posts.map((post: any) => ({ params: { slug: post.slug }, props: { posts, post } })),
  ]
}
export const GET = ({ props }: any) => {
  const { posts, post } = props
  return post
    ? renderShell({ id: 'blog', path: `/blog/${post.slug}/`, title: post.seo?.title ?? `${post.title} | Holistic Pregnancy`, description: post.seo?.description ?? post.excerpt, html: blogPostHtml(post, posts.filter((p: any) => p.slug !== post.slug).slice(0, 2)) })
    : renderShell({ id: 'blog', path: '/blog/', title: 'Blog | Holistic Pregnancy', description: 'Articles on preconception, pregnancy and postpartum wellbeing.', html: blogIndexHtml(posts) })
}
