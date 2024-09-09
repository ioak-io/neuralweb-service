import Tesseract from "tesseract.js";
import * as Helper from "./helper";

const selfRealm = 100;

export const importFileForFlashcard = async (req: any, res: any) => {
  console.log("*");
  const userId = req.user.user_id;
  const response: any = await Helper.importFileForFlashcard(
    req.params.space,
    req.files,
    userId
  );
  res.status(200);
  res.send(response);
  res.end();
};

export const imageToText = async (files: any[]): Promise<string> => {
  const cleanText = (text: string): string => {
    // Simple regex patterns to remove headers, footers, and page numbers
    // You may need to adjust the patterns based on your specific needs
    return text
      .replace(/^\d+\s*\n/gm, "") // Remove page numbers at the start of lines
      .replace(/^(Page \d+)\s*\n/gm, "") // Remove "Page X" headers/footers
      .replace(/^\s*\n/gm, "") // Remove empty lines
      .trim(); // Trim whitespace from start and end
  };

  let texts = "";
  try {
    for (let i = 0; i < files.length; i++) {
      const {
        data: { text },
      } = await Tesseract.recognize(files[i].buffer, "eng", {
        logger: (m: any) => console.log(m),
      });
      texts += "\n" + cleanText(text);
    }
  } catch (error) {
    console.error("Error processing files:", error);
    throw new Error("Failed to process files.");
  }
  return texts;
};
