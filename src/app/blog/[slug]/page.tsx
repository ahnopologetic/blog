import fs from 'fs';
import matter from 'gray-matter';
import path from 'path';
import rehypeRaw from 'rehype-raw';
import rehypeStringify from 'rehype-stringify';
import remarkBreaks from 'remark-breaks';
import remarkGfm from 'remark-gfm';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import { unified } from 'unified';

type PostProps = {
  params: Promise<{ slug: string }>;
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
  
  const processedContent = await unified()
    .use(remarkParse)
    .use(remarkBreaks)
    .use(remarkGfm)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeRaw)
    .use(rehypeStringify)
    .process(content);
    
  const contentHtml = processedContent.toString();

  return { data, contentHtml };
}

export default async function BlogPost({ params }: PostProps) {
  const { data, contentHtml } = await getPost((await params).slug);

  return (
    <div className="max-w-screen-md mx-auto p-4">
      <h1 className="text-[3rem] font-bold italic">{data.title}</h1>
      <h3 className="text-[2rem]">{data.description}</h3>
      <p className="text-sm text-gray-600">{data.date}</p>
      <div className="h-[1px] w-full bg-gray-200 my-8"></div>
      <article 
        dangerouslySetInnerHTML={{ __html: contentHtml }} 
        className="mt-4 prose prose-slate max-w-none text-foreground"
      />
      <div className="h-[1px] w-full bg-gray-200 my-8"></div>
      <div className="flex gap-4 justify-center">
        <button className="flex flex-col items-center p-4 rounded-lg hover:bg-gray-100 transition-colors">
          <span className="text-2xl">👍</span>
          <span className="text-sm text-gray-600">Like</span>
        </button>
        <button className="flex flex-col items-center p-4 rounded-lg hover:bg-gray-100 transition-colors">
          <span className="text-2xl">😐</span>
          <span className="text-sm text-gray-600">Meh</span>
        </button>
        <button className="flex flex-col items-center p-4 rounded-lg hover:bg-gray-100 transition-colors">
          <span className="text-2xl">👎</span>
          <span className="text-sm text-gray-600">Dislike</span>
        </button>
      </div>
    </div>
  );
}
