import { useEffect, useState } from "react";
import "./App.css";
import { fetchRepositories } from "./services/githubApi";
import { Repository } from "./types";

export default function App() {
  const [repositories, setRepositories] = useState<Repository[]>([]);

  useEffect(() => {
    async function getRepositories() {
      try {
        const repos = await fetchRepositories("gryboskamil");
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
        {repositories.map((repo, index) => (
          <li key={index}>
            <div>
              <div>{repo.name}</div>
              <div>{repo.created_at}</div>
              <div>{repo.description}</div>
              <div>{repo.url}</div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
