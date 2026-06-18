import { useState, useEffect } from "react";

const KEY = "tr_client_id";

export function useClientId() {
  const [id, setId] = useState(null);

  useEffect(() => {
    let v = localStorage.getItem(KEY);
    if (!v) {
      v = crypto.randomUUID();
      localStorage.setItem(KEY, v);
    }
    setId(v);
  }, []);

  return id;
}
