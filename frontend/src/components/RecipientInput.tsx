import React, { useState, useRef, type KeyboardEvent, type ClipboardEvent } from "react";
import { Mail, FileSpreadsheet, X, AlertCircle } from "lucide-react";

interface Props {
  recipients: string[];
  onChange: (recipients: string[]) => void;
  error?: string;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const RecipientInput: React.FC<Props> = ({ recipients, onChange, error }) => {
  const [inputValue, setInputValue] = useState("");
  const [inputError, setInputError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const addEmails = (rawText: string) => {
    setInputError(null);

    const rawTokens = rawText
      .split(/[\s,;"'\n\r]+/)
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
      } else if (email.includes("@")) {
        invalidTokens.push(email);
      }
    });

    if (invalidTokens.length > 0) {
      setInputError(`Invalid email formats skipped: ${invalidTokens.slice(0, 3).join(", ")}${invalidTokens.length > 3 ? "..." : ""}`);
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
      onChange(recipients.slice(0, -1));
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData("text");
    addEmails(pastedText);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (text) {
        addEmails(text);
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        if (text) addEmails(text);
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="w-full space-y-2.5">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
          <Mail className="w-3.5 h-3.5 text-indigo-500" />
          <span>Recipient Emails</span>
          <span className="text-rose-500">*</span>
        </label>

        {/* Upload CSV trigger */}
        <div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".csv,.txt"
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Upload CSV / TXT</span>
          </button>
        </div>
      </div>

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={`min-h-24 p-3 bg-white dark:bg-slate-800/70 border rounded-2xl shadow-2xs flex flex-wrap items-center gap-2 transition-all focus-within:ring-2 focus-within:ring-indigo-500 ${
          isDragging
            ? "border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/40"
            : error || inputError
            ? "border-rose-300 dark:border-rose-800 bg-rose-50/20"
            : "border-slate-300 dark:border-slate-700"
        }`}
      >
        {recipients.map((email, index) => (
          <span
            key={`${email}-${index}`}
            className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/80 rounded-xl text-xs font-mono font-medium transition-all"
          >
            <span>{email}</span>
            <button
              type="button"
              onClick={() => onChange(recipients.filter((_, idx) => idx !== index))}
              className="text-indigo-400 hover:text-rose-500 transition-colors"
              aria-label={`Remove ${email}`}
            >
              <X className="w-3 h-3" />
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
            if (inputValue.trim()) addEmails(inputValue);
          }}
          placeholder={
            recipients.length === 0
              ? "Type recipient email & press Enter or paste CSV list..."
              : "Add another email..."
          }
          className="flex-1 min-w-[220px] border-none outline-hidden p-1 text-xs text-slate-900 dark:text-white bg-transparent placeholder-slate-400 focus:ring-0"
        />
      </div>

      {recipients.length > 0 && (
        <div className="flex justify-between items-center text-[11px] text-slate-500 dark:text-slate-400 px-1">
          <span className="font-semibold text-slate-700 dark:text-slate-300">
            {recipients.length} valid recipient{recipients.length === 1 ? "" : "s"} ready
          </span>
          <button
            type="button"
            onClick={() => onChange([])}
            className="text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 transition-colors"
          >
            Clear all
          </button>
        </div>
      )}

      {(inputError || error) && (
        <p className="text-[11px] text-rose-600 dark:text-rose-400 font-semibold px-1 flex items-center gap-1">
          <AlertCircle className="w-3.5 h-3.5" />
          <span>{inputError || error}</span>
        </p>
      )}
    </div>
  );
};
