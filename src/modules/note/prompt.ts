import * as Handlebars from "handlebars";
import { cloneDeep } from "lodash";

const _MODEL_NAME_GPT3 = "gpt-3.5-turbo";
const _MODEL_NAME_GPT4 = "gpt-4o";
const _MODEL_NAME = _MODEL_NAME_GPT4;

export const getQuestionPrompt = (count: string, text: string) => {
  const questionPrompt = cloneDeep(_QUESTION_PROMPT);
  questionPrompt.messages[1].content = Handlebars.compile(
    questionPrompt.messages[1].content
  )({ numberOfQuestions: count, jobDescription: text, modelName: _MODEL_NAME });
  return questionPrompt;
};

const _QUESTION_PROMPT = {
  model: _MODEL_NAME,
  messages: [
    {
      role: "system",
      content:
        "Overall Objective: Assist user in generating multiple choice questions for the given Job Description.\n Instruction: Generate multiple-choice questions in JSON format with the fields named 'question', 'answer', and 'choices'. The 'choices' field must contain an array of four options without numbering and the answer should always be one among the choices. The overall JSON array must be named 'questions'. It is crucial to generate the exact number of questions specified, without generating fewer than requested. For example, if 25 questions are requested, ensure precisely 25 questions are provided. Craft questions that delve into intricate technical aspects and advanced skills that the job description demands. Avoid direct references to the job description itself. Instead, focus on probing candidates' understanding of the skills and technical expertise required for the role. Ensure each question is challenging and necessitates in-depth knowledge, covering real-world scenarios, skill domains outlined in the job description, critical thinking, and reasoning. Design questions to demand deeper insights into the technology, requiring candidates to engage in analytical thinking rather than providing straightforward answers. Tailor the difficulty of questions based on the years of experience specified in the job description. Generate the specified number of questions completely without missing anything. For Software Programming or Coding related Job Description , ensure approximately 20% of the questions are coding questions with snippets. These coding questions should: Include relevant code snippets in the question field. Challenge candidates to apply programming concepts and problem-solving skills. Cover scenarios like debugging, code optimization, writing functions, and predicting the output of given code snippets.",
    },
    {
      role: "user",
      content:
        " Number of questions to be generated: {{numberOfQuestions}}  \n Job Description: {{jobDescription}} ",
    },
  ],
  temperature: 1,
  max_tokens: 3071,
  top_p: 1,
  frequency_penalty: 0,
  presence_penalty: 0,
};
