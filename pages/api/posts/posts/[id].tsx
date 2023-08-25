import { API_URL } from "@/config/index";

// eslint-disable-next-line import/no-anonymous-default-export
export default async (req, res) => {
  try {
    const token = req.headers.authorization?.replace("Bearer ", "");
    console.log("REq query id", req.query.id)
    const response = await fetch(`${API_URL}/post/${req.query.id}`, {
      method: "GET",
      headers: {
        Authorization: "Bearer " + token,
      },
    });
    const res1 = await response.json();
    res.json({ response: res1 });
  } catch (err) {
    console.log(err);
  }
};