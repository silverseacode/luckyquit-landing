import { API_URL } from "@/config";
import { debounce } from "@/helpers/chats";

// eslint-disable-next-line import/no-anonymous-default-export
export default async (req, res) => {
  try {
    const message = req.body.message;
    const data = { message };
    const token = req.headers.authorization?.replace("Bearer ", "");
    const response = await fetch(`${API_URL}/messages/false`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
      body: JSON.stringify(data),
    });
    const res1 = await response.json();
    res.json({ response: res1 });
  } catch (err) {
    console.log(err);
  }
};
