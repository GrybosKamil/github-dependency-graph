import { useEffect, useState } from "react";
import { FileContent, RawPackageJson } from "../types";
import { fetchPackageJsonRawContent } from "../services/githubApi";

type PackageJsonRawContentProps = {
  fileContent: FileContent;
};

export default function PackageJsonRawContent({
  fileContent,
}: PackageJsonRawContentProps) {
  const [loading, setLoading] = useState(true);
  const [rawContent, setRawContent] = useState<RawPackageJson | null>(null);

  useEffect(() => {
    async function goget() {
      try {
        const rawContent = await fetchPackageJsonRawContent(fileContent.download_url);
        setRawContent(rawContent);
      } catch (error) {
        console.error(
          `Error fetching raw package.json content for ${fileContent.name}:`,
          error
        );
      } finally {
        setLoading(false);
      }
    }

    goget();
  });

  if (loading) {
    return <div>Loading raw package.json content...</div>;
  }

  if (!rawContent) {
    return <div>Error loading raw package.json content.</div>;
  }

  return (
    <div>
      <h3>Raw Package.json Content</h3>
      <pre>{JSON.stringify(rawContent, null, 2)}</pre>
    </div>
  );
}
