const _THEMES_EXPLORED_PROMPT = {
  model: _MODEL_NAME,
  messages: [
    {
      role: "system",
      content:
        "You are an expert in book analysis. Your task is to provide a comprehensive and detailed breakdown of a book chapter based on the provided parameters. The output should be structured as a JSON object.",
    },
    {
      role: "system",
      content:
        "For this prompt, you need to focus only on the 'Themes Explored' section.",
    },
    {
      role: "system",
      content:
        "The output should include two keys: 'themes' and 'content'. The 'themes' key should be an array of strings, where each string is a theme title. The 'content' key should be a string containing HTML with both the theme titles and their corresponding explanations. The theme titles should be wrapped in 'h5' tags, and the explanations should be wrapped in 'p' tags. Only 'h5', 'p', 'bold', and 'italic' tags should be used.",
    },
    {
      role: "system",
      content:
        "Each theme explanation in the 'content' section should provide a detailed and in-depth analysis. This should include the significance of the theme, how it is developed throughout the chapter, its impact on the narrative, and any relevant examples or quotes from the text. The goal is to offer a thorough understanding of each theme.",
    },
    {
      role: "system",
      content:
        "Do not include any introductory text or explanations. The output should be strictly a JSON object and nothing else.",
    },
    {
      role: "user",
      content:
        "Using the book named '{{bookName}}' by '{{authorName}}', analyze the chapter titled '{{chapterTitle}}' and provide a detailed breakdown of the themes explored.",
    },
  ],
  temperature: 1,
  max_tokens: 4096,
  top_p: 1,
  frequency_penalty: 0,
  presence_penalty: 0,
};

const _MINI_ESSAY_PROMPT = {
  model: _MODEL_NAME,
  messages: [
    {
      role: "system",
      content:
        "You are an expert in book analysis. Your task is to generate a detailed breakdown of a book chapter based on the provided parameters. The output should be structured as a JSON object.",
    },
    {
      role: "system",
      content:
        "You should focus on writing a mini-essay that provides a concise yet comprehensive summary and analysis of the chapter.",
    },
    {
      role: "system",
      content:
        "The mini-essay should be returned in JSON format with the key 'content'. The content should be in HTML format and should use only the <p>, <b>, and <i> tags. The output should be a series of paragraphs without any titles or headings.",
    },
    {
      role: "system",
      content:
        "Ensure that all special characters, including newlines and control characters, are properly escaped to avoid parsing errors. The JSON output should be strictly a valid JSON object with no additional text or formatting.",
    },
    {
      role: "user",
      content:
        "Using the book named '{{bookName}}' by '{{authorName}}', write a mini-essay on the chapter titled '{{chapterTitle}}'.",
    },
  ],
  temperature: 1,
  max_tokens: 4096,
  top_p: 1,
  frequency_penalty: 0,
  presence_penalty: 0,
};
