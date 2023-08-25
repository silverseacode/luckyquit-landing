import { API_URL } from "@/config/index";

// eslint-disable-next-line import/no-anonymous-default-export
export default async (req, res) => {
  console.log("BODY222,", req.body)

  const token = req.headers.authorization?.replace("Bearer ", "");
  const response = await fetch(`${API_URL}/pushNotification`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + token,
    },
    body: JSON.stringify({
      token: req.body?.token ?? "",
      title: req.body.title,
      body: req.body.body,
      data: req.body.data,
    }),
  });
  const res1 = await response.json();
  res.json({ response: res1 });
};
