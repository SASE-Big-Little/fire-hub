import FlameLogo from "@/components/FlameLogo";

export default function HomePage() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-4 px-6 py-16">
      <div className="flex items-center gap-3">
        <FlameLogo size={40} />
        <h1 className="text-3xl font-bold">Fire Hub</h1>
      </div>
      <p className="text-muted">
        Shared resources, an AI that answers from them, and small games for the
        Fire group.
      </p>
    </main>
  );
}
