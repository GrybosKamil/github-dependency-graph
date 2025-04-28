import axios from "axios";
import { FileContent, RawPackageJson, Repository } from "../types";

const GITHUB_API_URL = "https://api.github.com";
const GITHUB_TOKEN = import.meta.env.VITE_GITHUB_TOKEN;

export const fetchRepositories = async (
  username: string
): Promise<Repository[]> => {
  const cacheKey = `repositories_${username}`;

  try {
    const cachedRepositories = localStorage.getItem(cacheKey);
    if (cachedRepositories) {
      return JSON.parse(cachedRepositories);
    }

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

    localStorage.setItem(cacheKey, JSON.stringify([]));
    return [];
  } catch (error: any) {
    console.error("Error fetching repositories:", error);
    localStorage.setItem(cacheKey, JSON.stringify([]));
    throw error;
  }
};
export const fetchFileContent = async (
  owner: string,
  repo: string
): Promise<FileContent | null> => {
  const cacheKey = `repositoryDetails_${owner}_${repo}`;

  try {
    const cachedRepositoryDetails = localStorage.getItem(cacheKey);
    if (cachedRepositoryDetails) {
      return JSON.parse(cachedRepositoryDetails);
    }

    const response = await axios.get(
      `${GITHUB_API_URL}/repos/${owner}/${repo}/contents/package.json`,
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

    localStorage.setItem(cacheKey, JSON.stringify(null));
    return null;
  } catch (error: any) {
    if (error.response && error.response.status === 404) {
      console.warn(`No package.json found for ${owner}/${repo}`);
      localStorage.setItem(cacheKey, JSON.stringify(null));
      return null;
    }

    console.error("Error fetching repository details:", error);
    throw error;
  }
};

export async function fetchPackageJsonRawContent(
  url: string
): Promise<RawPackageJson | null> {
  const cacheKey = `url_${url}`;
  try {
    const cachedUrl = localStorage.getItem(cacheKey);
    if (cachedUrl) {
      return JSON.parse(cachedUrl);
    }

    const response = await axios.get(url);

    if (response.status === 200 && response.data) {
      const decodedContent = response.data;
      const parsedContent: RawPackageJson = decodedContent;
      localStorage.setItem(cacheKey, JSON.stringify(response.data));
      return parsedContent;
    }

    localStorage.setItem(cacheKey, JSON.stringify(null));
    return null;
  } catch (error: any) {
    if (error.response && error.response.status === 404) {
      console.warn(`No url found for ${url}`);
      localStorage.setItem(cacheKey, JSON.stringify(null));
      return null;
    }

    console.error(`Error fetching url: ${url}`, error);
    return null;
  }
}
