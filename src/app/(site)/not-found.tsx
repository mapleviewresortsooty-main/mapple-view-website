import { LinkButton } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center px-4 py-28 text-center sm:px-6">
      <h1 className="font-display text-4xl font-bold text-ink">
        Page Not Found
      </h1>
      <p className="mt-4 text-ink/70">
        The page you&apos;re looking for doesn&apos;t exist or may have been moved.
      </p>
      <LinkButton href="/" variant="primary" className="mt-8">
        Back to Home
      </LinkButton>
    </div>
  );
}
