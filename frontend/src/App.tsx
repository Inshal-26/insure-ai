import { useState } from "react";
import "./App.css";

type Page = "home" | "login" | "signup" | "dashboard" | "results";

type FormData = {
  age: number;
  sex: string;
  bmi: number;
  children: number;
  smoker: string;
  region: string;
};

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000";

const initialForm: FormData = {
  age: 30,
  sex: "male",
  bmi: 25.5,
  children: 1,
  smoker: "no",
  region: "southwest",
};

function App() {
  const [page, setPage] = useState<Page>("home");
  const [form, setForm] = useState<FormData>(initialForm);
  const [prediction, setPrediction] = useState<number | null>(null);
  const [explanation, setExplanation] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const updateField = (
    field: keyof FormData,
    value: string | number
  ) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handlePrediction = async () => {
    setLoading(true);
    setError("");

    try {
      const predictionResponse = await fetch(`${API_URL}/predict`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      if (!predictionResponse.ok) {
        throw new Error("Prediction request failed.");
      }

      const predictionData = await predictionResponse.json();

      const predictedCost = Number(
        predictionData.predicted_charges
      );

      setPrediction(predictedCost);

      try {
        const explanationResponse = await fetch(`${API_URL}/explain`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...form,
            prediction: predictedCost,
          }),
        });

        if (explanationResponse.ok) {
          const explanationData = await explanationResponse.json();
          setExplanation(explanationData.explanation || "");
        } else {
          setExplanation("");
        }
      } catch {
        setExplanation("");
      }

      setPage("results");
    } catch (err) {
      console.error(err);
      setError(
        "Could not connect to the prediction service. Make sure your backend and ML API are running."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setPage("home");
    setPrediction(null);
    setExplanation("");
  };

  return (
    <div className="app">
      {page === "home" && (
        <HomePage
          onLogin={() => setPage("login")}
          onSignup={() => setPage("signup")}
          onGetStarted={() => setPage("signup")}
        />
      )}

      {page === "login" && (
        <AuthPage
          type="login"
          onBack={() => setPage("home")}
          onSubmit={() => setPage("dashboard")}
          onSwitch={() => setPage("signup")}
        />
      )}

      {page === "signup" && (
        <AuthPage
          type="signup"
          onBack={() => setPage("home")}
          onSubmit={() => setPage("dashboard")}
          onSwitch={() => setPage("login")}
        />
      )}

      {page === "dashboard" && (
        <DashboardPage
          form={form}
          error={error}
          loading={loading}
          onLogout={handleLogout}
          onUpdate={updateField}
          onPredict={handlePrediction}
        />
      )}

      {page === "results" && (
        <ResultsPage
          form={form}
          prediction={prediction}
          explanation={explanation}
          onBack={() => setPage("dashboard")}
          onNewPrediction={() => {
            setPrediction(null);
            setExplanation("");
            setPage("dashboard");
          }}
        />
      )}
    </div>
  );
}

/* =========================
   NAVBAR
========================= */

function Navbar({
  onLogin,
  onSignup,
}: {
  onLogin: () => void;
  onSignup: () => void;
}) {
  return (
    <header className="navbar">
      <div className="navbar-inner">
        <button className="brand" onClick={() => window.location.reload()}>
          <span className="brand-mark">
            <span />
            <span />
            <span />
          </span>

          <span className="brand-text">
            Insure<span>AI</span>
          </span>
        </button>

        <nav className="nav-links">
          <a href="#how-it-works">How it works</a>
          <a href="#technology">Technology</a>
          <a href="#about">About</a>
        </nav>

        <div className="nav-actions">
          <button className="nav-login" onClick={onLogin}>
            Sign in
          </button>

          <button className="nav-signup" onClick={onSignup}>
            Get started
          </button>
        </div>
      </div>
    </header>
  );
}

/* =========================
   HOME
========================= */

function HomePage({
  onLogin,
  onSignup,
  onGetStarted,
}: {
  onLogin: () => void;
  onSignup: () => void;
  onGetStarted: () => void;
}) {
  return (
    <main className="home-page">
      <Navbar onLogin={onLogin} onSignup={onSignup} />

      <section className="hero">
        <div className="hero-content">
          <div className="hero-badge">
            <span className="status-dot" />
            AI-powered insurance estimation
          </div>

          <h1>
            Understand your
            <br />
            <span>insurance costs.</span>
          </h1>

          <p className="hero-description">
            InsureAI uses machine learning to estimate annual
            insurance charges from your profile and explains the
            factors behind the prediction.
          </p>

          <div className="hero-actions">
            <button className="primary-button large" onClick={onGetStarted}>
              Try InsureAI
              <span>→</span>
            </button>

            <a className="secondary-button large" href="#how-it-works">
              Explore how it works
            </a>
          </div>

          <div className="hero-note">
            <span>✓</span>
            Machine learning powered
            <span>•</span>
            Historical dataset
            <span>•</span>
            Explainable results
          </div>
        </div>

        <div className="hero-visual">
          <div className="visual-glow" />

          <div className="prediction-card">
            <div className="prediction-card-top">
              <div>
                <p className="eyebrow">ESTIMATED ANNUAL COST</p>
                <h3>$4,218.50</h3>
              </div>

              <div className="mini-icon">↗</div>
            </div>

            <div className="prediction-line">
              <div className="line-track">
                <div className="line-progress" />
              </div>

              <div className="line-labels">
                <span>Model estimate</span>
                <span>ML prediction</span>
              </div>
            </div>

            <div className="prediction-divider" />

            <div className="prediction-details">
              <div>
                <span>Model</span>
                <strong>Linear Regression</strong>
              </div>

              <div>
                <span>Validation R²</span>
                <strong>0.7836</strong>
              </div>
            </div>
          </div>

          <div className="floating-card floating-top">
            <span className="floating-icon">✦</span>
            <div>
              <strong>AI Explanation</strong>
              <span>Generated automatically</span>
            </div>
          </div>

          <div className="floating-card floating-bottom">
            <span className="floating-icon">✓</span>
            <div>
              <strong>6 input features</strong>
              <span>Processed by the model</span>
            </div>
          </div>
        </div>
      </section>

      <section className="trust-bar">
        <div className="trust-item">
          <strong>01</strong>
          <span>Enter your profile</span>
        </div>

        <div className="trust-line" />

        <div className="trust-item">
          <strong>02</strong>
          <span>Run the model</span>
        </div>

        <div className="trust-line" />

        <div className="trust-item">
          <strong>03</strong>
          <span>Understand the result</span>
        </div>
      </section>

      <section className="section" id="how-it-works">
        <div className="section-heading">
          <span className="section-label">HOW IT WORKS</span>
          <h2>
            From your profile
            <br />
            to a clear estimate.
          </h2>
          <p>
            A simple pipeline connects your information with a
            trained machine learning model and an AI explanation layer.
          </p>
        </div>

        <div className="steps-grid">
          <StepCard
            number="01"
            title="Enter your details"
            description="Provide basic information such as age, BMI, smoking status, children and region."
            icon="⌁"
          />

          <StepCard
            number="02"
            title="ML prediction"
            description="Your data is processed by a Linear Regression model trained on historical insurance data."
            icon="◈"
          />

          <StepCard
            number="03"
            title="Get an estimate"
            description="The model returns an estimated annual insurance charge based on the supplied features."
            icon="◉"
          />

          <StepCard
            number="04"
            title="Understand it"
            description="An AI explanation describes how the characteristics may relate to the model output."
            icon="✦"
          />
        </div>
      </section>

      <section className="metrics-section">
        <div className="metrics-heading">
          <span className="section-label">MODEL SNAPSHOT</span>
          <h2>Built around a real ML pipeline.</h2>
        </div>

        <div className="metrics-grid">
          <MetricCard label="Algorithm" value="Linear Regression" />
          <MetricCard label="Validation R²" value="0.7836" />
          <MetricCard label="MAE" value="$4,181" />
          <MetricCard label="Input Features" value="6" />
        </div>
      </section>

      <section className="technology-section" id="technology">
        <div className="tech-copy">
          <span className="section-label">TECHNOLOGY</span>

          <h2>
            Full-stack engineering
            <br />
            meets machine learning.
          </h2>

          <p>
            InsureAI combines a modern React interface, a Node.js
            backend, a Python machine learning service and an AI
            explanation layer.
          </p>

          <div className="tech-list">
            <TechItem name="React + TypeScript" />
            <TechItem name="Node.js + Express" />
            <TechItem name="Python + FastAPI" />
            <TechItem name="Scikit-learn" />
            <TechItem name="OpenAI API" />
          </div>
        </div>

        <div className="architecture-card">
          <div className="architecture-header">
            <span>INSUREAI PIPELINE</span>
            <span className="live-badge">
              <i /> LIVE
            </span>
          </div>

          <ArchitectureStep number="01" title="React Frontend" />
          <div className="architecture-arrow">↓</div>

          <ArchitectureStep number="02" title="Node.js API" />
          <div className="architecture-arrow">↓</div>

          <ArchitectureStep number="03" title="Python ML Service" />
          <div className="architecture-arrow">↓</div>

          <ArchitectureStep number="04" title="Prediction + AI Explanation" />
        </div>
      </section>

      <section className="about-section" id="about">
        <div className="about-card">
          <div>
            <span className="section-label">ABOUT INSUREAI</span>

            <h2>
              Designed as a practical
              <br />
              full-stack ML project.
            </h2>
          </div>

          <p>
            InsureAI demonstrates how a machine learning model can
            be integrated into a real web application. The goal is
            not to provide a guaranteed insurance quote, but to
            demonstrate the complete journey from user input to
            prediction and explanation.
          </p>
        </div>
      </section>

      <section className="disclaimer-section">
        <div className="disclaimer-icon">i</div>

        <div>
          <strong>Important note</strong>

          <p>
            InsureAI provides a machine-learning estimate based on
            historical data. It is not a guaranteed insurance price,
            quote, financial recommendation, or medical advice.
          </p>
        </div>
      </section>

      <footer className="footer">
        <div className="brand">
          <span className="brand-mark">
            <span />
            <span />
            <span />
          </span>

          <span className="brand-text">
            Insure<span>AI</span>
          </span>
        </div>

        <p>AI-powered insurance cost estimation.</p>

        <span>© 2026 InsureAI</span>
      </footer>
    </main>
  );
}

/* =========================
   STEP CARD
========================= */

function StepCard({
  number,
  title,
  description,
  icon,
}: {
  number: string;
  title: string;
  description: string;
  icon: string;
}) {
  return (
    <div className="step-card">
      <div className="step-top">
        <span className="step-number">{number}</span>
        <span className="step-icon">{icon}</span>
      </div>

      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  );
}

/* =========================
   METRIC CARD
========================= */

function MetricCard({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="metric-card">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

/* =========================
   TECH ITEM
========================= */

function TechItem({ name }: { name: string }) {
  return (
    <div className="tech-item">
      <span>✓</span>
      {name}
    </div>
  );
}

/* =========================
   ARCHITECTURE
========================= */

function ArchitectureStep({
  number,
  title,
}: {
  number: string;
  title: string;
}) {
  return (
    <div className="architecture-step">
      <span>{number}</span>
      <strong>{title}</strong>
    </div>
  );
}

/* =========================
   AUTH
========================= */

function AuthPage({
  type,
  onBack,
  onSubmit,
  onSwitch,
}: {
  type: "login" | "signup";
  onBack: () => void;
  onSubmit: () => void;
  onSwitch: () => void;
}) {
  const isLogin = type === "login";

  return (
    <main className="auth-page">
      <div className="auth-background">
        <div className="auth-glow auth-glow-one" />
        <div className="auth-glow auth-glow-two" />
      </div>

      <div className="auth-wrapper">
        <button className="back-home" onClick={onBack}>
          ← Back to InsureAI
        </button>

        <div className="auth-card">
          <div className="auth-logo">
            <span className="brand-mark">
              <span />
              <span />
              <span />
            </span>

            <span className="brand-text">
              Insure<span>AI</span>
            </span>
          </div>

          <div className="auth-heading">
            <h1>{isLogin ? "Welcome back." : "Create your account."}</h1>

            <p>
              {isLogin
                ? "Sign in to continue to your InsureAI dashboard."
                : "Create an account to start exploring insurance predictions."}
            </p>
          </div>

          <form
            className="auth-form"
            onSubmit={(event) => {
              event.preventDefault();
              onSubmit();
            }}
          >
            {!isLogin && (
              <label>
                Full name
                <input
                  type="text"
                  placeholder="Your name"
                  required
                />
              </label>
            )}

            <label>
              Email address
              <input
                type="email"
                placeholder="you@example.com"
                required
              />
            </label>

            <label>
              Password
              <input
                type="password"
                placeholder="••••••••"
                required
              />
            </label>

            {!isLogin && (
              <label>
                Confirm password
                <input
                  type="password"
                  placeholder="••••••••"
                  required
                />
              </label>
            )}

            <button className="auth-submit" type="submit">
              {isLogin ? "Sign in" : "Create account"}
              <span>→</span>
            </button>
          </form>

          <div className="auth-switch">
            {isLogin ? "Don't have an account?" : "Already have an account?"}

            <button onClick={onSwitch}>
              {isLogin ? "Create one" : "Sign in"}
            </button>
          </div>

          <p className="auth-demo-note">
            Demo authentication flow — database authentication can
            be connected later.
          </p>
        </div>
      </div>
    </main>
  );
}

/* =========================
   DASHBOARD
========================= */

function DashboardPage({
  form,
  error,
  loading,
  onLogout,
  onUpdate,
  onPredict,
}: {
  form: FormData;
  error: string;
  loading: boolean;
  onLogout: () => void;
  onUpdate: (
    field: keyof FormData,
    value: string | number
  ) => void;
  onPredict: () => void;
}) {
  return (
    <main className="dashboard-page">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <span className="brand-mark">
            <span />
            <span />
            <span />
          </span>

          <span className="brand-text">
            Insure<span>AI</span>
          </span>
        </div>

        <div className="sidebar-section">
          <span className="sidebar-label">WORKSPACE</span>

          <button className="sidebar-link active">
            <span>⌂</span>
            Prediction
          </button>

          <button className="sidebar-link">
            <span>◷</span>
            History
          </button>
        </div>

        <div className="sidebar-section">
          <span className="sidebar-label">PROJECT</span>

          <button className="sidebar-link">
            <span>◎</span>
            Model
          </button>

          <button className="sidebar-link">
            <span>?</span>
            About
          </button>
        </div>

        <div className="sidebar-bottom">
          <div className="profile-box">
            <div className="profile-avatar">U</div>

            <div>
              <strong>User</strong>
              <span>InsureAI account</span>
            </div>
          </div>

          <button className="logout-button" onClick={onLogout}>
            Log out
          </button>
        </div>
      </aside>

      <section className="dashboard-content">
        <header className="dashboard-header">
          <div>
            <span className="section-label">PREDICTION WORKSPACE</span>
            <h1>Insurance cost predictor</h1>
            <p>
              Enter customer information to generate an ML-based
              annual cost estimate.
            </p>
          </div>

          <div className="model-status">
            <span />
            Model ready
          </div>
        </header>

        <div className="dashboard-grid">
          <section className="form-panel">
            <div className="panel-heading">
              <div>
                <span className="panel-number">01</span>
                <div>
                  <h2>Customer profile</h2>
                  <p>Provide the information used by the model.</p>
                </div>
              </div>
            </div>

            <div className="form-grid">
              <InputField
                label="Age"
                type="number"
                value={form.age}
                min={1}
                max={100}
                onChange={(value) =>
                  onUpdate("age", Number(value))
                }
              />

              <SelectField
                label="Sex"
                value={form.sex}
                options={["male", "female"]}
                onChange={(value) => onUpdate("sex", value)}
              />

              <InputField
                label="BMI"
                type="number"
                value={form.bmi}
                min={10}
                max={60}
                step="0.1"
                onChange={(value) =>
                  onUpdate("bmi", Number(value))
                }
              />

              <InputField
                label="Children"
                type="number"
                value={form.children}
                min={0}
                max={10}
                onChange={(value) =>
                  onUpdate("children", Number(value))
                }
              />

              <SelectField
                label="Smoker"
                value={form.smoker}
                options={["yes", "no"]}
                onChange={(value) => onUpdate("smoker", value)}
              />

              <SelectField
                label="Region"
                value={form.region}
                options={[
                  "southwest",
                  "southeast",
                  "northwest",
                  "northeast",
                ]}
                onChange={(value) => onUpdate("region", value)}
              />
            </div>

            {error && <div className="error-box">{error}</div>}

            <button
              className="predict-button"
              onClick={onPredict}
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner" />
                  Running prediction...
                </>
              ) : (
                <>
                  Generate prediction
                  <span>→</span>
                </>
              )}
            </button>
          </section>

          <aside className="model-panel">
            <div className="model-panel-header">
              <span className="section-label">MODEL</span>

              <span className="model-live">
                <i />
                ONLINE
              </span>
            </div>

            <div className="model-main">
              <div className="model-symbol">∿</div>

              <h2>Linear Regression</h2>

              <p>
                A supervised learning model trained on historical
                insurance data.
              </p>
            </div>

            <div className="model-stats">
              <div>
                <span>Validation R²</span>
                <strong>0.7836</strong>
              </div>

              <div>
                <span>MAE</span>
                <strong>$4,181</strong>
              </div>

              <div>
                <span>Features</span>
                <strong>6</strong>
              </div>
            </div>

            <div className="model-info">
              <span>i</span>

              <p>
                The estimate is generated from the characteristics
                entered above and should not be interpreted as a
                guaranteed insurance quote.
              </p>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}

/* =========================
   INPUT
========================= */

function InputField({
  label,
  type,
  value,
  min,
  max,
  step,
  onChange,
}: {
  label: string;
  type: string;
  value: number;
  min?: number;
  max?: number;
  step?: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="field">
      <span>{label}</span>

      <input
        type={type}
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}

/* =========================
   SELECT
========================= */

function SelectField({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  return (
    <label className="field">
      <span>{label}</span>

      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

/* =========================
   RESULTS
========================= */

function ResultsPage({
  form,
  prediction,
  explanation,
  onBack,
  onNewPrediction,
}: {
  form: FormData;
  prediction: number | null;
  explanation: string;
  onBack: () => void;
  onNewPrediction: () => void;
}) {
  const formattedPrediction =
    prediction !== null
      ? prediction.toLocaleString("en-US", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })
      : "0.00";

  return (
    <main className="results-page">
      <header className="results-header">
        <button className="results-brand" onClick={onBack}>
          <span className="brand-mark">
            <span />
            <span />
            <span />
          </span>

          <span className="brand-text">
            Insure<span>AI</span>
          </span>
        </button>

        <button className="results-back" onClick={onBack}>
          ← Back to dashboard
        </button>
      </header>

      <section className="results-container">
        <div className="results-intro">
          <span className="section-label">PREDICTION COMPLETE</span>

          <h1>Your estimated annual cost.</h1>

          <p>
            Based on the profile you provided, the machine learning
            model generated the following estimate.
          </p>
        </div>

        <div className="result-main-card">
          <div className="result-cost">
            <span>ESTIMATED ANNUAL INSURANCE COST</span>

            <div className="cost-number">
              <small>$</small>
              {formattedPrediction}
            </div>

            <p>Machine learning estimate</p>
          </div>

          <div className="result-profile">
            <div className="result-profile-header">
              <span>Your input</span>
              <span>6 features</span>
            </div>

            <div className="result-profile-grid">
              <ResultItem label="Age" value={`${form.age}`} />
              <ResultItem label="Sex" value={form.sex} />
              <ResultItem label="BMI" value={`${form.bmi}`} />
              <ResultItem
                label="Children"
                value={`${form.children}`}
              />
              <ResultItem label="Smoker" value={form.smoker} />
              <ResultItem label="Region" value={form.region} />
            </div>
          </div>
        </div>

        <div className="results-lower-grid">
          <section className="explanation-card">
            <div className="card-title-row">
              <div>
                <span className="section-label">AI EXPLANATION</span>
                <h2>Why did the model predict this?</h2>
              </div>

              <span className="ai-badge">AI</span>
            </div>

            {explanation ? (
              <div className="explanation-text">
                {explanation
                  .split("\n")
                  .filter(Boolean)
                  .map((paragraph, index) => (
                    <p key={index}>{paragraph}</p>
                  ))}
              </div>
            ) : (
              <p className="no-explanation">
                The AI explanation could not be generated, but the
                model prediction is available above.
              </p>
            )}
          </section>

          <section className="result-model-card">
            <span className="section-label">MODEL DETAILS</span>

            <h2>Linear Regression</h2>

            <div className="result-model-list">
              <div>
                <span>Validation R²</span>
                <strong>0.7836</strong>
              </div>

              <div>
                <span>Mean Absolute Error</span>
                <strong>$4,181</strong>
              </div>

              <div>
                <span>Input features</span>
                <strong>6</strong>
              </div>
            </div>
          </section>
        </div>

        <div className="result-actions">
          <button className="primary-button" onClick={onNewPrediction}>
            Make another prediction
            <span>→</span>
          </button>

          <button className="secondary-button" onClick={onBack}>
            Back to dashboard
          </button>
        </div>

        <div className="result-disclaimer">
          <span>i</span>

          <p>
            This prediction is an estimate generated by a machine
            learning model trained on historical data. It is not a
            guaranteed insurance price or professional insurance,
            financial, or medical advice.
          </p>
        </div>
      </section>
    </main>
  );
}

/* =========================
   RESULT ITEM
========================= */

function ResultItem({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="result-item">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

export default App;