import { API_URL } from "@/config";

// eslint-disable-next-line import/no-anonymous-default-export
export default async (req, res) => {
  const token = req.headers.authorization?.replace("Bearer ", "");
  const data = req.body.data;
  const dataToSend = { data };
  const response = await fetch(`${API_URL}/rating`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + token,
    },
    body: JSON.stringify(dataToSend),
  });
  const res1 = await response.json();
  res.json({ response: res1 });
};
