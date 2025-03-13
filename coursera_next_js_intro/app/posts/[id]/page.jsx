import { posts } from "../../data/posts";
import styles from "./post.module.css";

export default async function Posts({ params }) {
  const { id } = await params;

  const post = posts.find((p) => p.id === id);
  if (!post) {
    return <h1>Post not found</h1>;
  }

  return (
    <main className={styles.container}>
      <h1 className={styles.title}>{post.title}</h1>
      <p className={styles.content}>{post.content}</p>
    </main>
  );
}
