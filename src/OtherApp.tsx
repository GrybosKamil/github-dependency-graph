import ReactFlowDependencyGraph from "./components/ReactFlowDependencyGraph";
import VisDependencyGraph from "./components/VisDependencyGraph";
import { useFetchPackageJson } from "./services/useGithubApi";

export default function App() {
  const { repositories, packageJsonData, isLoading, isError, error } =
    useFetchPackageJson("gryboskamil");

  // console.log({ repositories, packageJsonData, isLoading, isError, error });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (isError || !packageJsonData) {
    return <div>Error: {error?.message}</div>;
  }

  return (
    <div>
      <div>
        {/* <ReactFlowDependencyGraph packageJsonData={packageJsonData} /> */}
        <VisDependencyGraph packageJsonData={packageJsonData} />

        {/* <h1>Repositories:</h1>
        {(repositories || []).map((repository) => (
          <div key={repository.name}>
            <div>{repository.name}</div>
            <div>{repository.full_name}</div>
          </div>
        ))}

        <pre>{JSON.stringify(packageJsonData, null, 2)}</pre> */}
      </div>
    </div>
  );
}
