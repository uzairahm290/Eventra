import { useEffect, useState } from "react";

export default function Welcome() {
  const [message, setMessage] = useState<string>("Loading...");

  useEffect(() => {
    fetch("/api/welcome")
      .then((res) => res.text())
      .then((data) => setMessage(data))
      .catch((err: Error) => setMessage("Error: " + err.message));
  }, []);

  return (
    <div className="p-6 text-xl font-semibold text-center">
      {message}
    </div>
  );
}
