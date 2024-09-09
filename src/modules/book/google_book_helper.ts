import axios from "axios";
import { isEmptyOrSpaces } from "../../lib/Utils";

const GOOGLE_BOOKS_API_KEY = "AIzaSyCUM3NDW_5h9faRaAliTVJ1IOnCQsDIyzs";
const WIKIPEDIA_API_URL = "https://en.wikipedia.org/w/api.php";

/**
 * Searches for the most relevant book based on book name and author name using the Google Books API.
 * Returns the specified metadata about the book, including unique categories from all matching results.
 * @param bookName - The name of the book.
 * @param authorName - The name of the author.
 * @returns A promise that resolves to the most relevant book metadata if available.
 */
export const getMostRelevantBookMetadata = async (
  bookName: string,
  authorName: string
): Promise<any | null> => {
  const query = `intitle:${bookName}+inauthor:${authorName}`;
  const url = `https://www.googleapis.com/books/v1/volumes?q=${query}&key=${GOOGLE_BOOKS_API_KEY}`;

  try {
    const response = await axios.get(url);
    const items = response.data.items || [];

    if (items.length === 0) {
      return null;
    }

    // Extract metadata
    const books = items.map((item: any) => ({
      title: item.volumeInfo.title,
      description: item.volumeInfo.description,
      shortDescription: item.volumeInfo.shortDescription || "",
      isbn:
        item.volumeInfo.industryIdentifiers?.find(
          (id: any) => id.type === "ISBN_13"
        )?.identifier ||
        item.volumeInfo.industryIdentifiers?.find(
          (id: any) => id.type === "ISBN_10"
        )?.identifier,
      pageCount: item.volumeInfo.pageCount,
      categories: item.volumeInfo.categories || [],
      publisher: item.volumeInfo.publisher,
      publishedDate: item.volumeInfo.publishedDate,
      thumbnail: item.volumeInfo.imageLinks?.thumbnail,
      authors: item.volumeInfo.authors,
      primaryAuthor: item.volumeInfo.authors?.[0],
      chapterCount: item.volumeInfo.tableOfContents?.length || 0, // If tableOfContents is available
    }));

    // Prioritize exact match on title and author
    let relevantBook = books
      .filter(
        (book: any) =>
          book.title.toLowerCase() === bookName.toLowerCase() &&
          book.primaryAuthor?.toLowerCase() === authorName.toLowerCase()
      )
      .sort(
        (a: any, b: any) =>
          new Date(b.publishedDate).getTime() -
          new Date(a.publishedDate).getTime()
      )[0];

    // If no exact match, find by exact author name
    if (!relevantBook) {
      relevantBook = books
        .filter(
          (book: any) =>
            book.primaryAuthor?.toLowerCase() === authorName.toLowerCase()
        )
        .sort(
          (a: any, b: any) =>
            new Date(b.publishedDate).getTime() -
            new Date(a.publishedDate).getTime()
        )[0];
    }

    // If no exact author match, find by title containing book name
    if (!relevantBook) {
      relevantBook = books
        .filter((book: any) =>
          book.title.toLowerCase().includes(bookName.toLowerCase())
        )
        .sort(
          (a: any, b: any) =>
            new Date(b.publishedDate).getTime() -
            new Date(a.publishedDate).getTime()
        )[0];
    }

    // If no title match, select based on publication date
    if (!relevantBook) {
      relevantBook = books.sort(
        (a: any, b: any) =>
          new Date(b.publishedDate).getTime() -
          new Date(a.publishedDate).getTime()
      )[0];
    }

    // Collect all unique categories
    const allCategories = new Set<string>();
    books.forEach((book: any) =>
      book.categories.forEach((category: string) => allCategories.add(category))
    );

    return {
      ...relevantBook,
      categories: Array.from(allCategories), // Convert Set to Array of unique categories
    };
  } catch (error) {
    console.error("Error retrieving book metadata:", error);
    return null;
  }
};

export const getBookMetadataByIsbn = async (
  isbn: string
): Promise<any | null> => {
  const query = `isbn:${isbn}`;
  const url = `https://www.googleapis.com/books/v1/volumes?q=${query}&key=${GOOGLE_BOOKS_API_KEY}`;

  try {
    const response = await axios.get(url);
    const items = response.data.items || [];

    if (items.length === 0) {
      return null;
    }

    // Extract metadata from the first (and only) item
    const item = items[0];
    console.log(item.volumeInfo.imageLinks);
    const metadata = {
      title: item.volumeInfo.title,
      description: item.volumeInfo.description,
      shortDescription: item.volumeInfo.shortDescription || "",
      isbn:
        item.volumeInfo.industryIdentifiers?.find(
          (id: any) => id.type === "ISBN_13"
        )?.identifier ||
        item.volumeInfo.industryIdentifiers?.find(
          (id: any) => id.type === "ISBN_10"
        )?.identifier,
      pageCount: item.volumeInfo.pageCount,
      categories: item.volumeInfo.categories || [],
      publisher: item.volumeInfo.publisher,
      publishedDate: item.volumeInfo.publishedDate,
      thumbnail: item.volumeInfo.imageLinks?.thumbnail,
      authors: item.volumeInfo.authors,
      primaryAuthor: item.volumeInfo.authors?.[0],
      chapterCount: item.volumeInfo.tableOfContents?.length || 0, // If tableOfContents is available
    };

    // Get author information if available
    // if (metadata.primaryAuthor) {
    //   const authorBio = await getAuthorInfo(metadata.primaryAuthor);
    //   return { ...metadata, authorBio };
    // }

    return metadata;
  } catch (error) {
    console.error("Error retrieving book metadata:", error);
    return null;
  }
};
// Function to get author information from Wikipedia
const getAuthorInfo = async (authorName: string): Promise<string | null> => {
  try {
    const response = await axios.get(WIKIPEDIA_API_URL, {
      params: {
        action: "query",
        format: "json",
        titles: authorName,
        prop: "extracts",
        exintro: true,
        explaintext: true,
        redirects: 1,
      },
    });

    const pages = response.data.query.pages;
    const page: any = Object.values(pages)[0];

    if (page?.extract) {
      return page.extract;
    }

    return null;
  } catch (error) {
    console.error("Error retrieving author information:", error);
    return null;
  }
};
