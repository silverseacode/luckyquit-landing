import { API_URL } from "@/config";

// eslint-disable-next-line import/no-anonymous-default-export
  export default async (req, res) => {
    try {
        const sender = req.query.sender
        const receiver = req.query.receiver
      const token = req.headers.authorization?.replace("Bearer ", "");
      const response = await fetch(
        `${API_URL}/messages/allMessages/${sender}/${receiver}`,
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