
import { Configuration, OpenAIApi } from "openai";

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY
});

const openai = new OpenAIApi(configuration);

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  const { conversation } = req.body;
  const systemPrompt = \`
You are a traveler entering the United States. You are being interviewed by a student customs officer.
Answer naturally and include feedback on the effectiveness of each question asked by the officer.

Examples:
Officer: "Do you have any fruits or vegetables?"
Traveler: "Yes, I brought some mangoes. (Feedback: Good specificity about agricultural items.)"

Officer: "Where are you staying?"
Traveler: "With friends in Brooklyn. (Feedback: Consider asking for exact address or duration of stay.)"\`;

  const messages = [{ role: "system", content: systemPrompt }, ...conversation];

  try {
    const completion = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages,
      temperature: 0.7
    });
    const reply = completion.data.choices[0].message;
    res.status(200).json({ reply });
  } catch (error) {
    console.error("OpenAI API error:", error);
    res.status(500).json({ error: "Something went wrong calling the OpenAI API." });
  }
}
