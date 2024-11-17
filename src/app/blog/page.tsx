import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import Link from 'next/link';

type PostMetadata = {
  title: string;
  date: string;
  description: string;
  slug: string;
};

async function getPosts(): Promise<PostMetadata[]> {
  const postsDir = path.join(process.cwd(), 'content/posts');
  const files = fs.readdirSync(postsDir);

  return files.map((file) => {
    const content = fs.readFileSync(path.join(postsDir, file), 'utf-8');
    const { data } = matter(content);
    return {
      title: data.title,
      date: data.date,
      description: data.description,
      slug: file.replace('.md', ''),
    };
  });
}

export default async function BlogPage() {
  const posts = await getPosts();

  return (
    <div className="max-w-screen-md mx-auto p-4 my-8">
      <h1 className="text-3xl font-bold mb-4">
        Blog
      </h1>
      <ul>
        {posts.map((post) => (
          <li key={post.slug} className="mb-4">
            <Link href={`/blog/${post.slug}`} className="text-blue-600 hover:underline">
              {post.title}
            </Link>
            <p className="text-sm text-gray-600 italic">{post.date}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
