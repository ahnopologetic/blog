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
import { createClient } from '@/utils/supabase/client';
import { createClient as createServerClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

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

async function getComments(slug: string) {
  const supabase = createClient();
  const { data: comments, error } = await supabase
    .from('comments')
    .select(`
      *,
      comment_likes (
        user_id
      )
    `)
    .eq('post_slug', slug)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching comments:', error);
    return [];
  }

  return comments;
}

export default async function BlogPost({ params }: PostProps) {
  const { data, contentHtml } = await getPost((await params).slug);
  const comments = await getComments((await params).slug);

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

      <div className="flex flex-col gap-4">
        <PostCommentInput
          user={{
            name: "Guest User",
            image: "https://github.com/shadcn.png"
          }}
          onSubmit={async (content) => {
            'use server';
            const supabase = await createServerClient();
            const { error } = await supabase
              .from('comments')
              .insert({
                content,
                post_slug: (await params).slug,
                user_id: 'guest',
                likes: 0
              });

            if (error) {
              console.error('Error adding comment:', error);
            }

            revalidatePath(`/blog/${(await params).slug}`);
          }}
        />
        {comments.map((comment) => (
          <PostComment
            key={comment.id}
            commentId={comment.id}
            author={{
              name: comment.user_id,
              image: "https://github.com/shadcn.png"
            }}
            content={comment.content}
            createdAt={new Date(comment.created_at)}
            likes={comment.likes}
            isLiked={comment.comment_likes?.some(like => like.user_id === 'guest')}
            onLike={async (commentId) => {
              'use server';
              const supabase = await createServerClient();
              // update comment likes count
              const { error: updateError } = await supabase
                .from('comments')
                .update({
                  likes: comment.likes + 1
                })
                .eq('id', commentId);

              if (updateError) {
                console.error('Error updating comment likes:', updateError);
              }

              // toggle like
              const { error: toggleError } = await supabase
                .from('comment_likes')
                .upsert({
                  comment_id: commentId,
                  user_id: 'guest',
                });

              if (toggleError) {
                console.error('Error toggling like:', toggleError);
              }

              revalidatePath(`/blog/${(await params).slug}`);
            }}
          />
        ))}
      </div>
    </div>
  );
}
