import { useQuery } from "@tanstack/react-query";
import axios from "axios";

const GITHUB_API_URL = "https://api.github.com";
const GITHUB_TOKEN = import.meta.env.VITE_GITHUB_TOKEN;

export function userRepositories(username: string) {
  const { data, error, isPending, isError } = useQuery({
    queryKey: ["repositories", username],
    queryFn: async () => {
      const cacheKey = `repositories_${username}`;
      const cachedRepositories = localStorage.getItem(cacheKey);
      if (cachedRepositories) {
        return JSON.parse(cachedRepositories);
      }

      try {
        const response = await axios.get(
          `${GITHUB_API_URL}/users/${username}/repos`,
          {
            headers: {
              Authorization: `Bearer ${GITHUB_TOKEN}`,
            },
          }
        );

        if (response.status === 200 && response.data) {
          localStorage.setItem(cacheKey, JSON.stringify(response.data));
          return response.data;
        }
      } catch (error: any) {
        console.error("Error fetching repositories:", error);
        localStorage.setItem(cacheKey, JSON.stringify([]));
        throw error;
      }
      return [];
    },
  });

  return {
    data,
    error,
    isPending,
    isError,
  };
}
