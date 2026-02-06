import ProjectList from "./components/ProjectList";

export default function ProjektiPage() {
  return (
    <div className="p-6 md:p-10 min-h-screen bg-slate-50/50">
      <div className="max-w-6xl mx-auto">
        <header className="mb-10">
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">PROJEKTI</h1>
          <p className="text-slate-500 font-medium">Upravljanje gradilištima i ugovorenim radovima</p>
        </header>

        <ProjectList />
      </div>
    </div>
  );
}