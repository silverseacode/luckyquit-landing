import { API_URL } from "@/config";

// eslint-disable-next-line import/no-anonymous-default-export
export default async (req, res) => {
  const response = await fetch(
    `${API_URL}/user/savePostId/${req.query.userId}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(req.body)
    }
  );
  const res1 = await response.json();
  res.json({ response: res1 });
};
