import SubmitForm from "./SubmitForm";

export const metadata = { title: "Submit a resource · Fire Hub" };

export default function NewResourcePage() {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-6 py-10">
      <h1 className="text-2xl font-bold">Submit a resource</h1>
      <p className="text-muted">
        Found something useful? Share it. A mentor reviews every submission before it appears in
        the library and in Ask the Hub.
      </p>
      <div className="card">
        <SubmitForm />
      </div>
    </main>
  );
}
