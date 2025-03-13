export default async function Posts({ params }) {
  const { id } = await params;
  return (
    <main>
      <h1>Post ID: {id}</h1>
    </main>
  );
}
