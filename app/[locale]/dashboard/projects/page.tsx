"use client";
import { useEffect, useState } from "react";
import { getProjects } from "@/lib/api";

export default function ProjectsTest() {
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    getProjects().then(data => setProjects(data));
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Test Baze: Projekti</h1>
      <div className="bg-card p-4 border rounded-lg">
        {projects.length === 0 ? (
          <p className="text-muted-foreground">Nema projekata ili se učitavaju...</p>
        ) : (
          <ul className="space-y-2">
            {projects.map((p: any) => (
              <li key={p.id} className="p-2 border-b flex justify-between">
                <span>{p.name}</span>
                <span className="text-sm font-mono text-blue-500">{p.clientName || 'Nema klijenta'}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}