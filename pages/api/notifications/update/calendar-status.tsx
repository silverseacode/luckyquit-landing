import { API_URL } from "@/config/index";

// eslint-disable-next-line import/no-anonymous-default-export
export default async (req, res) => {
  try {
    const token = req.headers.authorization?.replace("Bearer ", "");
    const body = req.body;
    const dataSend = { body: body };
    const response = await fetch(`${API_URL}/notifications/update/calendarEventStatus`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token
        },
        body: JSON.stringify(dataSend),
      });
    const res1 = await response.json();
    res.json({ response: res1 });
  } catch (err) {
    console.log(err);
  }
};