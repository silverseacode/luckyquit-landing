import { API_URL } from "@/config/index";

// eslint-disable-next-line import/no-anonymous-default-export
export default async (req, res) => {
  try {
    const token = req.headers.authorization?.replace("Bearer ", "");
    const response = await fetch(
      `${API_URL}/invitations/userId/${req.query.userId}/from/${req.query.from}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
      }
    );
    const res1 = await response.json();
    res.json({ response: res1 });
  } catch (err) {
    console.log(err);
  }
};
