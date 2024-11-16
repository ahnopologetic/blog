import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { remark } from 'remark';
import html from 'remark-html';

type PostProps = {
  params: { slug: string };
};

export async function generateStaticParams() {
  const postsDir = path.join(process.cwd(), 'content/posts');
  const files = fs.readdirSync(postsDir);

  return files.map((file) => ({
    slug: file.replace('.md', ''),
  }));
}

async function getPost(slug: string) {
  const filePath = path.join(process.cwd(), 'content/posts', `${slug}.md`);
  const fileContent = fs.readFileSync(filePath, 'utf-8');
  const { data, content } = matter(fileContent);
  const processedContent = await remark().use(html).process(content);
  const contentHtml = processedContent.toString();

  return { data, contentHtml };
}

export default async function BlogPost({ params }: PostProps) {
  const { data, contentHtml } = await getPost(params.slug);

  return (
    <div className="max-w-screen-md mx-auto p-4">
      <h1 className="text-3xl font-bold">{data.title}</h1>
      <p className="text-sm text-gray-600">{data.date}</p>
      <article dangerouslySetInnerHTML={{ __html: contentHtml }} className="mt-4" />
    </div>
  );
}
