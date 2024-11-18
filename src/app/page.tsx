import Link from 'next/link';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

type PostMetadata = {
  title: string;
  date: Date;
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
      date: new Date(data.date),
      description: data.description,
      slug: data.slug,
    };
  });
  return posts.sort((a, b) => b.date.getTime() - a.date.getTime());
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
        <div className="flex justify-center gap-4 mt-6">
          <a
            href="https://github.com/ahnopologetic"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-600 hover:text-gray-900 transition-colors"
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
            </svg>
          </a>
          <a
            href="https://linkedin.com/in/humphrey-ahn"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-600 hover:text-gray-900 transition-colors"
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
            </svg>
          </a>
        </div>
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
                <p className="text-sm text-gray-600 mt-2">{post.date.toLocaleDateString()}</p>
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
