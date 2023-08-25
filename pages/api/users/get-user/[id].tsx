import { API_URL } from "@/config";

// eslint-disable-next-line import/no-anonymous-default-export
export default async (req, res) => {
  const response = await fetch(
    `${API_URL}/user/only/${req.query.id}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
  const res1 = await response.json();
  res.json({ response: res1 });
};
