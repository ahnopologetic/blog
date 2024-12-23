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
import { ShareMenu } from '@/components/ShareMenu';
import PostComment from '@/components/post/post-comment';
import PostCommentInput from '@/components/post/post-comment-input';

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

  const comments = [
    {
      id: 1,
      author: {
        name: 'John Doe',
        image: 'https://github.com/shadcn.png',
      },
      content: 'This is a comment',
      date: new Date(),
      likes: 0,
    },
  ]; // TODO: get comments from database

  return (
    <div className="max-w-screen-md mx-auto p-4">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h1 className="text-[3rem] font-semibold italic">{data.title}</h1>
          <h3 className="text-[1.5rem] mb-4 leading-6">{data.description}</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {new Date(data.date).toLocaleDateString()}
          </p>
        </div>
        <ShareMenu title={data.title} />
      </div>

      <div className="h-[1px] w-full bg-gray-200 my-4"></div>

      <article
        dangerouslySetInnerHTML={{ __html: contentHtml }}
        className="mt-4 prose prose-gray light:prose-invert dark:prose-invert max-w-none text-foreground dark:text-white
          prose-img:rounded-lg prose-img:mx-auto prose-img:max-w-full prose-img:my-8"
      />
      <div className="h-[1px] w-full bg-gray-200 my-8"></div>
      {/* <div className="flex gap-4 justify-center">
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
      </div> */}

      <div className="flex flex-col gap-4">
        <PostCommentInput 
          user={{
            name: "Guest User",
            image: "https://github.com/shadcn.png" // TODO: Replace with actual user image
          }}
        />
        {comments.map(({ id, author, content, date, likes }) => (
          <PostComment
            key={id}
            author={author}
            content={content}
            createdAt={date}
            likes={likes}
            isAuthor={false}
            commentId={id.toString()}
          />
        ))}
      </div>
    </div>
  );
}
