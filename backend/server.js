require("dotenv").config();
const express = require("express");
const cors = require("cors");
const axios = require("axios");
const OpenAI = require("openai");
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ message: "InsureAI backend is running" });
});
app.post("/predict", async (req, res) => {
  try {
    const response = await axios.post(
      "http://127.0.0.1:8000/predict",
      req.body
    );

    res.json(response.data);
  } catch (error) {
    console.error(error.message);

    res.status(500).json({
      error: "Could not get prediction from ML service"
    });
  }
});
app.post("/explain", async (req, res) => {
  try {
    const {
      age,
      sex,
      bmi,
      children,
      smoker,
      region,
      prediction,
    } = req.body;

    console.log("Explain request received:", req.body);

    const response = await openai.responses.create({
      model: "gpt-6-luna",
      instructions:
        "You are an insurance cost explanation assistant. Explain an ML-generated insurance cost estimate clearly and briefly. Do not give medical, financial, or insurance advice. Do not claim that any factor definitely caused the prediction. Explain that the estimate comes from a machine learning model trained on historical data.",
      input: `
A machine learning model predicted an annual insurance cost of $${prediction}.

Customer information:
- Age: ${age}
- Sex: ${sex}
- BMI: ${bmi}
- Children: ${children}
- Smoker: ${smoker}
- Region: ${region}

Explain in 2-3 short paragraphs why these characteristics may be associated with the predicted cost. Mention that this is an estimate and not a guaranteed insurance price.
`,
    });

    console.log("OpenAI response received");

    res.json({
      explanation: response.output_text,
    });
  } catch (error) {
    console.error("OPENAI ERROR:", error);

    res.status(500).json({
      error: "AI explanation failed",
      details: error.message,
    });
  }
});
app.listen(5000, () => {
  console.log("Backend running on http://localhost:5000");
});