"use client";

import { Check, Copy, KeyRound, RefreshCcw } from "lucide-react";
import { useEffect, useState } from "react";

function generatePassword(options) {
  const segments = [
    options.lowercase ? "abcdefghijklmnopqrstuvwxyz" : "",
    options.uppercase ? "ABCDEFGHIJKLMNOPQRSTUVWXYZ" : "",
    options.numbers ? "0123456789" : "",
    options.symbols ? "!@#$%^&*()_+-={}[]<>?" : ""
  ];

  const pool = segments.join("");
  if (!pool) {
    return "";
  }

  const randomBuffer = new Uint32Array(options.length);
  window.crypto.getRandomValues(randomBuffer);

  return Array.from(randomBuffer, (value) => pool[value % pool.length]).join("");
}

function getStrengthLabel(password, options) {
  const variety = [options.lowercase, options.uppercase, options.numbers, options.symbols].filter(Boolean).length;
  const score = password.length + variety * 5;

  if (score >= 34) {
    return "Strong";
  }

  if (score >= 24) {
    return "Good";
  }

  return "Basic";
}

export function PasswordGeneratorClient() {
  const [options, setOptions] = useState({
    length: 18,
    lowercase: true,
    uppercase: true,
    numbers: true,
    symbols: true
  });
  const [password, setPassword] = useState("");
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setPassword(generatePassword(options));
  }, [options]);

  useEffect(() => {
    if (!copied) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => setCopied(false), 1600);
    return () => window.clearTimeout(timeoutId);
  }, [copied]);

  function updateOption(key, checked) {
    const enabledRules = [options.lowercase, options.uppercase, options.numbers, options.symbols].filter(Boolean).length;

    if (!checked && enabledRules === 1) {
      setError("Select at least one character rule.");
      return;
    }

    setError("");
    setOptions((currentValue) => ({ ...currentValue, [key]: checked }));
  }

  return (
    <div className="utility-shell">
      <div className="utility-panel glass-panel">
        <div className="tool-form-header tool-form-header-compact">
          <div>
            <span className="eyebrow">Security Tool</span>
            <h3>Generate a password</h3>
            <p>Create a strong password and copy it instantly.</p>
          </div>
          <span className="pill">
            <KeyRound size={16} />
            {getStrengthLabel(password, options)}
          </span>
        </div>

        <div className="password-output">
          <code>{password || "Select at least one character rule"}</code>
        </div>

        <div className="slider-card">
          <span>Password length</span>
          <strong>{options.length}</strong>
          <input
            type="range"
            min="8"
            max="32"
            value={options.length}
            onChange={(event) => setOptions((currentValue) => ({ ...currentValue, length: Number(event.target.value) }))}
          />
        </div>

        <div className="checkbox-grid">
          {[ 
            ["lowercase", "Lowercase letters"],
            ["uppercase", "Uppercase letters"],
            ["numbers", "Numbers"],
            ["symbols", "Symbols"]
          ].map(([key, label]) => (
            <label className="checkbox-card" key={key}>
              <input
                type="checkbox"
                checked={options[key]}
                onChange={(event) => updateOption(key, event.target.checked)}
              />
              <span>{label}</span>
            </label>
          ))}
        </div>

        {error ? <div className="status-card error">{error}</div> : null}

        <div className="action-row">
          <button
            className="button button-primary"
            type="button"
            onClick={() => {
              setError("");
              setPassword(generatePassword(options));
            }}
          >
            <RefreshCcw size={18} />
            Regenerate
          </button>
          <button
            className="button button-secondary"
            type="button"
            onClick={async () => {
              if (!password) {
                return;
              }

              try {
                await navigator.clipboard.writeText(password);
                setError("");
                setCopied(true);
              } catch {
                setError("Password could not be copied automatically. Please copy it manually.");
              }
            }}
          >
            {copied ? <Check size={18} /> : <Copy size={18} />}
            {copied ? "Copied" : "Copy Password"}
          </button>
        </div>
      </div>
    </div>
  );
}
