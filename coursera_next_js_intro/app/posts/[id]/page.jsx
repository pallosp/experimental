import { posts } from "../../data/posts";

export default async function Posts({ params }) {
  const { id } = await params;

  const post = posts.find((p) => p.id === id);
  if (!post) {
    return <h1>Post not found</h1>;
  }

  return (
    <main>
      <h1>{post.title}</h1>
      <p>{post.content}</p>
    </main>
  );
}
