import { useState } from "react";
import "./App.css";

function App() {
  const [age, setAge] = useState("");
  const [sex, setSex] = useState("male");
  const [bmi, setBmi] = useState("");
  const [children, setChildren] = useState("");
  const [smoker, setSmoker] = useState("no");
  const [region, setRegion] = useState("southwest");

  const [prediction, setPrediction] = useState<number | null>(null);
  const [explanation, setExplanation] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handlePredict = async () => {
    setError("");
    setExplanation("");

    if (!age || !bmi || !children) {
      setError("Please fill in all required fields.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("http://localhost:5000/predict", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          age: Number(age),
          sex,
          bmi: Number(bmi),
          children: Number(children),
          smoker,
          region,
        }),
      });

      if (!response.ok) {
        throw new Error("Prediction request failed");
      }

      const data = await response.json();

      setPrediction(data.predicted_charges);

      const explanationResponse = await fetch(
        "http://localhost:5000/explain",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            age: Number(age),
            sex,
            bmi: Number(bmi),
            children: Number(children),
            smoker,
            region,
            prediction: data.predicted_charges,
          }),
        }
      );

      if (!explanationResponse.ok) {
  const errorData = await explanationResponse.json();
  console.error("AI ERROR FROM BACKEND:", errorData);

  throw new Error(
    errorData.details || errorData.error || "AI explanation failed"
  );
}

      const explanationData = await explanationResponse.json();

      console.log("AI Explanation:", explanationData);

      setExplanation(explanationData.explanation);
    } catch (error) {
  console.error("FULL ERROR:", error);
  setError(String(error));
} finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="card">
        <h1>InsureAI</h1>

        <p className="subtitle">
          AI-Powered Insurance Cost Predictor
        </p>

        <div className="form">
          <input
            type="number"
            placeholder="Age"
            value={age}
            onChange={(e) => setAge(e.target.value)}
          />

          <select
            value={sex}
            onChange={(e) => setSex(e.target.value)}
          >
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>

          <input
            type="number"
            step="0.1"
            placeholder="BMI"
            value={bmi}
            onChange={(e) => setBmi(e.target.value)}
          />

          <input
            type="number"
            placeholder="Number of children"
            value={children}
            onChange={(e) => setChildren(e.target.value)}
          />

          <select
            value={smoker}
            onChange={(e) => setSmoker(e.target.value)}
          >
            <option value="no">Non-smoker</option>
            <option value="yes">Smoker</option>
          </select>

          <select
            value={region}
            onChange={(e) => setRegion(e.target.value)}
          >
            <option value="southwest">Southwest</option>
            <option value="southeast">Southeast</option>
            <option value="northwest">Northwest</option>
            <option value="northeast">Northeast</option>
          </select>

          <button disabled={loading} onClick={handlePredict}>
            {loading ? "Predicting..." : "Predict Insurance Cost"}
          </button>
        </div>

        {error && <p className="error">{error}</p>}

        {prediction !== null && (
          <div className="result">
            <h2>
              Estimated Insurance Cost: $
              {prediction.toLocaleString("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </h2>
          </div>
        )}
        {explanation && (
  <div className="explanation">
    <h3>🤖 AI Explanation</h3>
    <p>{explanation}</p>
  </div>
)}
      </div>
    </div>
  );
}

export default App;