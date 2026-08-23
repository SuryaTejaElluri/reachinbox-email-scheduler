import React, { useState, type KeyboardEvent, type ClipboardEvent } from "react";

interface Props {
  recipients: string[];
  onChange: (recipients: string[]) => void;
  error?: string;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const RecipientInput: React.FC<Props> = ({ recipients, onChange, error }) => {
  const [inputValue, setInputValue] = useState("");
  const [inputError, setInputError] = useState<string | null>(null);

  const addEmails = (rawText: string) => {
    setInputError(null);

    // Split by commas, semicolons, spaces or newlines
    const rawTokens = rawText
      .split(/[\s,;\n]+/)
      .map((t) => t.trim().toLowerCase())
      .filter(Boolean);

    if (rawTokens.length === 0) return;

    const invalidTokens: string[] = [];
    const validTokens: string[] = [];

    rawTokens.forEach((email) => {
      if (EMAIL_REGEX.test(email)) {
        if (!recipients.includes(email) && !validTokens.includes(email)) {
          validTokens.push(email);
        }
      } else {
        invalidTokens.push(email);
      }
    });

    if (invalidTokens.length > 0) {
      setInputError(`Invalid email format: ${invalidTokens.join(", ")}`);
    }

    if (validTokens.length > 0) {
      onChange([...recipients, ...validTokens]);
      setInputValue("");
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === "," || e.key === "Tab" || e.key === " ") {
      e.preventDefault();
      addEmails(inputValue);
    } else if (e.key === "Backspace" && inputValue === "" && recipients.length > 0) {
      // Remove last tag on backspace
      onChange(recipients.slice(0, -1));
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData("text");
    addEmails(pastedText);
  };

  const handleRemove = (indexToRemove: number) => {
    onChange(recipients.filter((_, idx) => idx !== indexToRemove));
  };

  return (
    <div className="w-full space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        Recipients <span className="text-red-500">*</span>
      </label>
      <div
        className={`min-h-24 p-2.5 bg-white border rounded-lg shadow-2xs flex flex-wrap items-center gap-2 transition-all focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-indigo-500 ${
          error || inputError ? "border-red-300 bg-red-50/20" : "border-gray-300"
        }`}
      >
        {recipients.map((email, index) => (
          <span
            key={`${email}-${index}`}
            className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-md text-xs font-medium transition-colors hover:bg-indigo-100"
          >
            {email}
            <button
              type="button"
              onClick={() => handleRemove(index)}
              className="text-indigo-400 hover:text-indigo-600 focus:outline-hidden"
              aria-label={`Remove ${email}`}
            >
              &times;
            </button>
          </span>
        ))}

        <input
          type="text"
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value);
            if (inputError) setInputError(null);
          }}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          onBlur={() => {
            if (inputValue.trim()) {
              addEmails(inputValue);
            }
          }}
          placeholder={recipients.length === 0 ? "Type email and press Enter or paste list..." : "Add more..."}
          className="flex-1 min-w-[200px] border-none outline-hidden p-1 text-sm text-gray-900 bg-transparent placeholder-gray-400 focus:ring-0"
        />
      </div>

      {recipients.length > 0 && (
        <div className="flex justify-between items-center text-xs text-gray-500 px-1">
          <span>{recipients.length} recipient{recipients.length === 1 ? "" : "s"} added</span>
          <button
            type="button"
            onClick={() => onChange([])}
            className="text-gray-400 hover:text-red-600 underline"
          >
            Clear all
          </button>
        </div>
      )}

      {(inputError || error) && (
        <p className="text-xs text-red-600 font-medium px-1">
          {inputError || error}
        </p>
      )}
    </div>
  );
};
