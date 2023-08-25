import { API_URL } from "@/config/index";

// eslint-disable-next-line import/no-anonymous-default-export
export default async (req, res) => {
  const data = req.body.data;
  const dataToSend = { data };
  try {
    const response = await fetch(`${API_URL}/user/signup`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(dataToSend),
    });
    const res1 = await response.json();
    res.json({ response: res1 })
    return res;
  } catch (err) {
    console.log(err);
  }
};
