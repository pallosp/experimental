import Link from "next/link";
import NavLayout from "./navigation";

export default function Home() {
  return (
    <NavLayout>
      <h1 className="text-3xl font-bold mb-6">Welcome to our Homepage</h1>
      <Link href="/about">Go to About page</Link>
      <br />
      <Link href="/posts/1">Go to Post 1</Link>
      <br />
      <Link href="/posts/2">Go to Post 2</Link>
      <p>
        API key:{" "}
        {process.env.DEMO_API_KEY ?? `(add DEMO_API_KEY=... to /.env.local)`}
      </p>
    </NavLayout>
  );
}
