import FlameLogo from "@/components/FlameLogo";
import SignInForm from "./SignInForm";

export const metadata = { title: "Sign in · Fire Hub" };

export default function SignInPage() {
  return (
    <main className="flex flex-1 items-center justify-center px-6 py-16">
      <div className="card w-full max-w-sm">
        <div className="mb-6 flex items-center gap-3">
          <FlameLogo size={36} />
          <h1 className="text-2xl font-bold">Fire Hub</h1>
        </div>
        <SignInForm />
        <p className="mt-6 text-sm text-muted">
          No account? Fire Hub is invite-only. Ask a mentor to create one for you.
        </p>
      </div>
    </main>
  );
}
