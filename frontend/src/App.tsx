import { useEffect, useState } from "react";
import api from "./services/api";

function App() {
  const [message, setMessage] = useState("Connecting to backend...");
  const [error, setError] = useState("");

  useEffect(() => {
    const checkBackend = async () => {
      try {
        const response = await api.get("/api/health");

        setMessage(response.data.message);
      } catch (err) {
        console.error(err);
        setError("Could not connect to backend");
      }
    };

    checkBackend();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="rounded-xl bg-white p-8 shadow-lg">
        <h1 className="text-3xl font-bold text-gray-900">
          ReachInbox Email Scheduler
        </h1>

        {error ? (
          <p className="mt-3 text-red-600">{error}</p>
        ) : (
          <p className="mt-3 text-green-600">{message}</p>
        )}
      </div>
    </div>
  );
}

export default App;