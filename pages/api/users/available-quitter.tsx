import { API_URL } from "@/config/index";

// eslint-disable-next-line import/no-anonymous-default-export
export default async (req, res) => {
  const token = req.headers.authorization?.replace("Bearer ", "");
  const data = req.body.data;
  const dataToSend = { data };
  try {
    const response = await fetch(`${API_URL}/user/available-quitters`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
      body: JSON.stringify(dataToSend),
    });
    const res1 = await response.json();
    res.json({ response: res1 });
  } catch (error) {
    console.error(error);
  }
};
