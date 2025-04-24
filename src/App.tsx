import { useEffect, useState } from "react";
import "./App.css";
import { fetchRepositories } from "./services/githubApi";
import { Repository } from "./types";
import RepositoryDetails from "./components/RepositoryDetails";

export default function App() {
  const [repositories, setRepositories] = useState<Repository[]>([]);

  useEffect(() => {
    async function getRepositories() {
      try {
        const repos = await fetchRepositories("gryboskamil");
        console.log({ repos });
        setRepositories(repos);
      } catch (error) {
        console.error("Error fetching repositories:", error);
      }
    }

    getRepositories();
  }, []);

  return (
    <div>
      <h1>Repositories</h1>
      <ul>
        {repositories.map((repo) => (
          <li key={repo.id}>
            <RepositoryDetails repository={repo} />
          </li>
        ))}
      </ul>
    </div>
  );
}
