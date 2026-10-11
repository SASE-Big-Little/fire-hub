import AskChat from "./AskChat";

export const metadata = { title: "Ask the Hub · Fire Hub" };

export default function AskPage() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-6 py-10">
      <div>
        <h1 className="text-2xl font-bold">Ask the Hub</h1>
        <p className="text-muted">
          Answers come only from the group&apos;s approved resources, with the source cited. Each
          member can ask 10 questions per hour.
        </p>
      </div>
      <AskChat />
    </main>
  );
}
