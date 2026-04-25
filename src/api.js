const API = import.meta.env.VITE_API_URL;

export const getData = async () => {
  const res = await fetch(${API}/api/your-route);
  return res.json();
};
