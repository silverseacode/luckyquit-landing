import { API_URL } from "@/config";

// eslint-disable-next-line import/no-anonymous-default-export
export default async (req, res) => {
  //const token = req.headers.authorization?.replace("Bearer ", "");
  const response = await fetch(
    `${API_URL}/user/unique/username/${req.query.id}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        //Authorization: "Bearer " + token,
      },
    }
  );
  const res1 = await response.json();
  res.json({ response: res1 });
};
