import { useEffect, useState } from "react";
import { fetchRepositoryDetails } from "../services/githubApi";
import { Repository } from "../types";

type RepositoryDetailsProps = {
  repository: Repository;
};

export default function RepositoryDetails({
  repository,
}: RepositoryDetailsProps) {
  const [repositoryDetails, setRepositoryDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function getRepositoryDetails() {
      try {
        const details = await fetchRepositoryDetails(
          repository.owner.login,
          repository.name
        );

        if (!details) {
          console.warn(
            `Skipping repository ${repository.name} (no package.json)`
          );
        }

        setRepositoryDetails(details);
      } catch (error) {
        console.error(
          `Error fetching repository details for ${repository.name}:`,
          error
        );
      } finally {
        setLoading(false);
      }
    }

    getRepositoryDetails();
  }, [repository.full_name]);

  if (loading) {
    return <div>Loading repository details for {repository.name}...</div>;
  }

  if (!repositoryDetails) {
    return <div>No `package.json` found for {repository.name}.</div>;
  }

  return (
    <div>
      <h2>{repository.name}</h2>
      <p>{repository.description}</p>
      <h3>Dependencies</h3>
      {/* Render dependencies here */}
    </div>
  );
}
