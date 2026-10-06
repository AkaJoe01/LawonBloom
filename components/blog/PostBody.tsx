import PostEmbeds from "./PostEmbeds";

export default function PostBody({ html }: { html: string }) {
  return (
    <>
      <PostEmbeds />
      <div className="post-body" dangerouslySetInnerHTML={{ __html: html }} />
    </>
  );
}
