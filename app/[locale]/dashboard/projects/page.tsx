"use client";

import { useEffect, useState, useCallback } from "react";
// Uvozimo projekte iz nove modularne putanje
import { projectsApi, ProjectData } from "@/lib/api";
import { useTranslations } from "next-intl";
import { Loader2, Briefcase, User } from "lucide-react";

/**
 * Professional component to verify project fetching and display.
 * Updated to use the modular projectsApi.
 */
export default function ProjectsTest() {
  const t = useTranslations("Projects"); 
  
  const [projects, setProjects] = useState<ProjectData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  /**
   * Fetches projects using the refactored API service.
   * Wrapped in useCallback for stability.
   */
  const fetchProjects = useCallback(async (): Promise<void> => {
    try {
      setLoading(true);
      // POZIV NOVOG API MODULA
      const data = await projectsApi.getAll();
      setProjects(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load projects:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3 border-b pb-4">
        <Briefcase className="w-8 h-8 text-primary" />
        <h1 className="text-3xl font-black tracking-tight uppercase">
          {t("projects_test_title")}
        </h1>
      </div>
      
      <div className="bg-card border rounded-3xl overflow-hidden shadow-xl">
        {loading ? (
          <div className="p-20 text-center flex flex-col items-center gap-4">
            <Loader2 className="animate-spin w-10 h-10 text-primary" />
            <p className="text-muted-foreground font-medium animate-pulse">
              {t("loading")}
            </p>
          </div>
        ) : projects.length === 0 ? (
          <div className="p-20 text-center">
            <p className="text-muted-foreground font-medium italic">
              {t("no_projects")}
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {projects.map((project) => (
              <li 
                key={project.id} 
                className="p-5 hover:bg-muted/30 transition-colors flex justify-between items-center group"
              >
                <div className="flex flex-col gap-1">
                  <span className="font-bold text-lg text-foreground group-hover:text-primary transition-colors">
                    {project.name}
                  </span>
                  <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">
                    ID: {project.id.substring(0, 8)}
                  </span>
                </div>
                
                <div className="flex items-center gap-2 px-4 py-2 bg-secondary/50 rounded-xl border border-border/50">
                  <User className="w-3.5 h-3.5 text-muted-foreground" />
                  <span className="text-xs font-mono font-bold text-blue-600">
                    {project.clientId ? project.clientId.substring(0, 8) : t("no_client")}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="text-center">
        <p className="text-xs text-muted-foreground opacity-50 uppercase font-black tracking-tighter">
          Edifica Pro • Project Connection Module v2.0
        </p>
      </div>
    </div>
  );
}