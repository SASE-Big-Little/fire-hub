import EmberClicker from "@/components/games/EmberClicker";

export const metadata = { title: "Games · Fire Hub" };

// Add your game here (challenge 1 and 6). Put the component itself in
// components/games/.
const GAMES = [
  {
    title: "Click the Ember",
    description: "Click the flame to grow it from a spark to an inferno.",
    Game: EmberClicker,
  },
];

export default function GamesPage() {
  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 px-6 py-10">
      <h1 className="text-2xl font-bold">Games</h1>
      <div className="grid gap-6 sm:grid-cols-2">
        {GAMES.map(({ title, description, Game }) => (
          <section key={title} className="card flex flex-col gap-4">
            <div>
              <h2 className="text-lg font-semibold">{title}</h2>
              <p className="text-sm text-muted">{description}</p>
            </div>
            <Game />
          </section>
        ))}
      </div>
    </main>
  );
}
