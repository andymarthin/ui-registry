import { getAllTemplates } from '../templates/registry';

export default function HubApp() {
  const templates = getAllTemplates();

  return (
    <main className="min-h-screen bg-[#0A0A0B] p-8 text-zinc-100">
      <h1 className="text-xl font-semibold tracking-tight">UI Template Hub</h1>
      <p className="mt-2 text-sm text-zinc-400">
        {templates.length} template(s) registered.
      </p>
    </main>
  );
}
