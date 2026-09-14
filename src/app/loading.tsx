export default function Loading() {
  return (
    <div className="mx-auto max-w-7xl px-5 pb-24 pt-32 sm:px-8">
      <div className="h-4 w-40 animate-pulse rounded-full bg-white/10" />
      <div className="mt-6 h-14 max-w-xl animate-pulse rounded-2xl bg-white/10" />
      <div className="mt-4 h-4 max-w-lg animate-pulse rounded-full bg-white/5" />
      <div className="mt-4 h-4 max-w-md animate-pulse rounded-full bg-white/5" />
      <div className="mt-12 grid gap-4 md:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="h-40 animate-pulse rounded-3xl border border-white/5 bg-white/[0.04]"
          />
        ))}
      </div>
    </div>
  );
}
