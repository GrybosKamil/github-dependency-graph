import { useQuery } from "@tanstack/react-query";
import {
  fetchFileContent,
  fetchPackageJsonRawContent,
  fetchRepositories,
} from "../services/githubApi";
import { FileContent, RawPackageJson, Repository } from "../types";

const STALE_TIME = 1000 * 60 * 5;

const getCachedData = <T>(key: string): T | null => {
  const cachedData = localStorage.getItem(key);
  return cachedData ? JSON.parse(cachedData) : null;
};

const setCachedData = (key: string, data: any) => {
  localStorage.setItem(key, JSON.stringify(data));
};

export const useFetchPackageJson = (username: string) => {
  const repositoriesQuery = useQuery<Repository[]>({
    queryKey: ["repositories", username],
    queryFn: async () => {
      const cacheKey = `repositories_${username}`;
      const cachedData = getCachedData<Repository[]>(cacheKey);
      if (cachedData) return cachedData;

      const data = await fetchRepositories(username);
      setCachedData(cacheKey, data);

      return data;
    },
    enabled: !!username,
    staleTime: STALE_TIME,
  });

  const packageJsonDataQuery = useQuery<RawPackageJson[]>({
    queryKey: ["packageJsonData", username],
    queryFn: async () => {
      if (!repositoriesQuery.data) return [];

      const results = await Promise.allSettled(
        repositoriesQuery.data.map(async (repo) => {
          const cacheKey = `repositoryDetails_${repo.owner.login}_${repo.name}`;
          const cachedData = getCachedData<FileContent>(cacheKey);

          const data = cachedData
            ? cachedData
            : await fetchFileContent(repo.owner.login, repo.name);
          setCachedData(cacheKey, data);

          if (!data || !data.download_url) return null;

          const cacheKey2 = `url_${data?.download_url}`;
          const cachedData2 = getCachedData<RawPackageJson>(cacheKey2);

          const data2 = cachedData2
            ? cachedData2
            : await fetchPackageJsonRawContent(data.download_url);
          setCachedData(cacheKey2, data2);

          return data2;
        })
      );

      console.log({ results });

      return results
        .filter(
          (result): result is PromiseFulfilledResult<RawPackageJson> =>
            result.status === "fulfilled" && result.value !== null
        )
        .map((result) => result.value);
    },
    enabled: repositoriesQuery.isSuccess,
    staleTime: STALE_TIME,
  });

  return {
    isLoading: repositoriesQuery.isLoading || packageJsonDataQuery.isLoading,
    error: repositoriesQuery.error || packageJsonDataQuery.error,
    isError: repositoriesQuery.isError || packageJsonDataQuery.isError,

    repositories: repositoriesQuery.data,
    packageJsonData: packageJsonDataQuery.data,
  };
};
