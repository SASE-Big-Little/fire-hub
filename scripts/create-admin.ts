// Creates the FIRST admin account. A mentor runs this once, on their own computer.
//
//   npm run create-admin
//
// It reads NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY from
// .env.local (never commit that file). It asks for a username, display name
// and password; leave the password empty to generate one.
//
// After that, create every other account from the /admin page.
import { createInterface } from "node:readline/promises";
import { stdin, stdout } from "node:process";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "../lib/supabase/types";
import { generatePassword } from "../lib/passwords";
import { createMember } from "../lib/users";

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    console.error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY. Put them in .env.local first.",
    );
    process.exit(1);
  }

  const rl = createInterface({ input: stdin, output: stdout });
  const username = await rl.question("Username (e.g. sofia): ");
  const displayName = await rl.question("Display name (e.g. Sofia): ");
  const typed = await rl.question("Password (leave empty to generate one): ");
  rl.close();

  const password = typed || generatePassword();

  const admin = createClient<Database>(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const result = await createMember(admin, { username, displayName, role: "admin", password });

  if ("error" in result) {
    console.error(`Could not create admin: ${result.error}`);
    process.exit(1);
  }

  console.log(`\nAdmin "${username.trim().toLowerCase()}" created.`);
  if (!typed) {
    console.log(`Generated password: ${password}`);
    console.log("Save it in your password manager now. It won't be shown again.");
  }
  // Clear the terminal scrollback later if others can see your screen.
}

main();
