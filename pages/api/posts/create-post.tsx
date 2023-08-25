import { API_URL } from "@/config/index";

export const config = {
  api: {
      bodyParser: {
          sizeLimit: '50mb' // Set desired value here
      }
  }
}

// eslint-disable-next-line import/no-anonymous-default-export
export default async (req, res) => {
  const token = req.headers.authorization?.replace("Bearer ", "");
  try {
    const response = await fetch(`${API_URL}/post`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
      body: JSON.stringify(req.body),
    });
    const res1 = await response.json();
    res.json({ response: res1 });
  } catch (error) {
    console.error(error);
  }
};