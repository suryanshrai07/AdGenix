import React, { useEffect, useState } from "react";
import { dummyGenerations } from "../assets/assets";
import type { Project } from "../types";
import { Loader2Icon } from "lucide-react";
import ProjectCard from "../components/ProjectCard";


const MyGeneration = () => {
  const [generations, setGenerations] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMyGenerations = async () => {
    setTimeout(() => {
      setGenerations(dummyGenerations);
      setLoading(false);
    }, 3000);
  };

  useEffect(() => {
    fetchMyGenerations();
  }, []);
  return loading ? (
    <div>
      <div className="flex items-center justify-center min-h-screen">
        <Loader2Icon className="animate-spin size-7 text-indigo-400" />
      </div>
    </div>
  ) : (
    <div className="min-h-screen text-white p-6 md:p-12 my-28">
      <div className="max-w-6xl mx-auto ">
        <header className="mb-12">
          <h1 className="text-3xl md:text-4xl font-semibold mb-4">My Generations</h1>
          <p className="text-gray-400">
            View and manage your AI generated projects. 
          </p>
        </header>

        {/* generations list */}
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-4">
          {generations.map((generation) => (
            <ProjectCard
              gen={generation}
              setGenerations={setGenerations}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default MyGeneration;
