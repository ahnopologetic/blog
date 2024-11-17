import Link from 'next/link';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

type PostMetadata = {
  title: string;
  date: string;
  description: string;
  slug: string;
};

async function getLatestPosts(): Promise<PostMetadata[]> {
  const postsDir = path.join(process.cwd(), 'content/posts');
  const files = fs.readdirSync(postsDir);

  const posts = files.map((file) => {
    const content = fs.readFileSync(path.join(postsDir, file), 'utf-8');
    const { data } = matter(content);
    return {
      title: data.title,
      date: data.date,
      description: data.description,
      slug: file.replace('.md', ''),
    };
  });

  // Sort by date descending
  return posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export default async function Home() {
  const latestPosts = await getLatestPosts();

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="py-20 text-center">
        <h1 className="text-5xl font-extrabold italic mb-4">Ahnopologetic</h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          IMHO, my worldview, and a few other things
        </p>
      </section>

      {/* Latest Posts Section */}
      <section className="max-w-screen-md mx-auto px-4 pb-20">
        <h2 className="text-3xl font-bold mb-8">Latest Posts</h2>
        <div className="space-y-8">
          {latestPosts.map((post) => (
            <article key={post.slug} className="border-b border-gray-200 pb-8">
              <Link 
                href={`/blog/${post.slug}`}
                className="group"
              >
                <h3 className="text-2xl font-bold group-hover:text-blue-600 transition-colors">
                  {post.title}
                </h3>
                <p className="text-sm text-gray-600 mt-2">{post.date}</p>
                <p className="text-gray-600 mt-2">{post.description}</p>
              </Link>
            </article>
          ))}
        </div>
        <div className="mt-12 text-center">
          <Link 
            href="/blog" 
            className="inline-block px-6 py-3 border border-current rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            View All Posts
          </Link>
        </div>
      </section>
    </div>
  );
}
