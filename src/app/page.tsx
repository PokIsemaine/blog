import Link from "@/components/blog/site-link";
import { basePath } from "@/lib/site";
export default function Home() {
  return (
    <>
      <meta httpEquiv="refresh" content={`0;url=${basePath}/en/`} />
      <h1>Systems Notebook</h1>
      <Link href="/en/">Continue in English →</Link>
    </>
  );
}
