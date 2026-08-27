import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { CheckCircle2, AlertTriangle, ArrowRight, Loader2 } from "lucide-react";

export const AuthCallbackPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { loginWithToken } = useAuth();
  const [status, setStatus] = useState<"processing" | "success" | "error">("processing");
  const [errorMessage, setErrorMessage] = useState<string>("");

  useEffect(() => {
    const handleCallback = async () => {
      const token = searchParams.get("token");
      const userId = searchParams.get("userId") || undefined;
      const error = searchParams.get("error");

      if (error) {
        setStatus("error");
        setErrorMessage(error || "Google authentication failed. Please try again.");
        return;
      }

      if (!token) {
        setStatus("error");
        setErrorMessage("No authentication token was received from the authentication provider.");
        return;
      }

      try {
        await loginWithToken(token, userId);
        setStatus("success");
        setTimeout(() => {
          navigate("/campaigns", { replace: true });
        }, 1200);
      } catch (err: any) {
        console.error("OAuth callback processing error:", err);
        setStatus("error");
        setErrorMessage(err.message || "Failed to complete login. Please try again.");
      }
    };

    handleCallback();
  }, [searchParams, loginWithToken, navigate]);

  return (
    <div className="min-h-[75vh] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-8 shadow-2xl text-center space-y-6">
        {status === "processing" && (
          <>
            <div className="w-16 h-16 bg-indigo-50 dark:bg-indigo-950/60 rounded-2xl flex items-center justify-center mx-auto text-indigo-600 dark:text-indigo-400">
              <Loader2 className="w-8 h-8 animate-spin" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                Authenticating with Google...
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Verifying your credentials and securing your session.
              </p>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
              <div className="bg-indigo-600 dark:bg-indigo-500 h-full rounded-full animate-pulse w-3/4" />
            </div>
          </>
        )}

        {status === "success" && (
          <>
            <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-950/60 rounded-2xl flex items-center justify-center mx-auto text-emerald-500">
              <CheckCircle2 className="w-8 h-8 animate-bounce" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                Authentication Successful!
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Redirecting you to your campaign dashboard...
              </p>
            </div>
          </>
        )}

        {status === "error" && (
          <>
            <div className="w-16 h-16 bg-rose-50 dark:bg-rose-950/60 rounded-2xl flex items-center justify-center mx-auto text-rose-500">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                Authentication Failed
              </h2>
              <p className="text-xs text-rose-600 dark:text-rose-400">{errorMessage}</p>
            </div>
            <Link
              to="/login"
              className="inline-flex items-center justify-center gap-2 w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-indigo-500/20"
            >
              Return to Login <ArrowRight className="w-4 h-4" />
            </Link>
          </>
        )}
      </div>
    </div>
  );
};
