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
import { visit } from 'unist-util-visit';

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
  const processedContent = fileContent.replace(
    /!\[\[(.*?)\]\]/g,
    '![]($1)'
  );
  const { data, content } = matter(processedContent);
  
  const processedHtml = await unified()
    .use(remarkParse)
    .use(remarkBreaks)
    .use(remarkGfm)
    .use(() => (tree) => {
      visit(tree, 'image', (node: { url: string }) => {
        if (!node.url.startsWith('http')) {
          node.url = `/api/images/${node.url}`;
        }
      });
    })
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeRaw)
    .use(rehypeStringify)
    .process(content);
    
  const contentHtml = processedHtml.toString();

  return { data, contentHtml };
}

export default async function BlogPost({ params }: PostProps) {
  const { data, contentHtml } = await getPost((await params).slug);

  return (
    <div className="max-w-screen-md mx-auto p-4">
      <h1 className="text-[3rem] font-bold italic">{data.title}</h1>
      <h3 className="text-[2rem]">{data.description}</h3>
      <p className="text-sm text-gray-600 dark:text-gray-400">{data.date}</p>
      <div className="h-[1px] w-full bg-gray-200 my-8"></div>
      <article 
        dangerouslySetInnerHTML={{ __html: contentHtml }} 
        className="mt-4 prose prose-gray light:prose-invert dark:prose-invert max-w-none text-foreground dark:text-white
          prose-img:rounded-lg prose-img:mx-auto prose-img:max-w-full prose-img:my-8"
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
