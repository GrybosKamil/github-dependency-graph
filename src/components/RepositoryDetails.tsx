import { useEffect, useState } from "react";
import { fetchFileContent } from "../services/githubApi";
import { FileContent, Repository } from "../types";
import PackageJsonRawContent from "./PackageJsonRawContent";

type RepositoryDetailsProps = {
  repository: Repository;
};

export default function RepositoryDetails({
  repository,
}: RepositoryDetailsProps) {
  const [fileContent, setFileContent] = useState<FileContent | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function getRepositoryDetails() {
      try {
        const packageJsonFileContent = await fetchFileContent(
          repository.owner.login,
          repository.name
        );

        if (!packageJsonFileContent) {
          console.warn(
            `Skipping repository ${repository.name} (no package.json)`
          );
        }

        setFileContent(packageJsonFileContent);
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

  return (
    <div
      style={{
        borderBottom: "1px solid black",
        padding: "1rem",
        margin: "1rem",
      }}
    >
      <h5>{repository.owner.login}</h5>
      <img
        src={repository.owner.avatar_url}
        style={{ width: "4rem", height: "4rem" }}
      />
      <h2>{repository.name}</h2>
      <p>{repository.description}</p>

      {fileContent ? (
        <div>
          <h3>Package.json</h3>
          <pre>{JSON.stringify(fileContent, null, 2)}</pre>
          <PackageJsonRawContent fileContent={fileContent} />
        </div>
      ) : (
        <p>No `package.json` found.</p>
      )}
    </div>
  );
}
