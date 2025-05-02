import { useQuery, useQueries } from "@tanstack/react-query";
import {
  fetchRepositories,
  fetchFileContent,
  fetchPackageJsonRawContent,
} from "../services/githubApi";
import { Repository, RawPackageJson, FileContent } from "../types";

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

  const fileContentQueries = useQueries({
    queries: (repositoriesQuery.data || []).map((repo) => ({
      queryKey: ["fileContent", repo.owner.login, repo.name],
      queryFn: async () => {
        const cacheKey = `repositoryDetails_${repo.owner.login}_${repo.name}`;
        const cachedData = getCachedData<FileContent>(cacheKey);
        if (cachedData) return cachedData;

        const data = await fetchFileContent(repo.owner.login, repo.name);
        setCachedData(cacheKey, data);
        return data;
      },
      enabled: repositoriesQuery.isSuccess,
      staleTime: STALE_TIME,
    })),
  });

  const rawPackageJsonQuery = useQuery<RawPackageJson | null>({
    queryKey: ["rawPackageJson", username],
    queryFn: async () => {
      const fileContent = fileContentQueries.find((query) => query.data)?.data;
      if (!fileContent || !fileContent.download_url) return null;

      const cacheKey = `url_${fileContent.download_url}`;
      const cachedData = getCachedData<RawPackageJson>(cacheKey);
      if (cachedData) return cachedData;

      const data = await fetchPackageJsonRawContent(fileContent.download_url);
      setCachedData(cacheKey, data);
      return data;
    },
    enabled: fileContentQueries.some((query) => query.isSuccess),
    staleTime: STALE_TIME,
  });

  return {
    isLoading:
      repositoriesQuery.isLoading ||
      fileContentQueries.some((query) => query.isLoading) ||
      rawPackageJsonQuery.isLoading,
    error:
      repositoriesQuery.error ||
      fileContentQueries.find((query) => query.error)?.error ||
      rawPackageJsonQuery.error,
    isError:
      repositoriesQuery.isError ||
      fileContentQueries.some((query) => query.isError) ||
      rawPackageJsonQuery.isError,

    repositories: repositoriesQuery.data,
    packageJsonData: rawPackageJsonQuery.data,
  };
};
