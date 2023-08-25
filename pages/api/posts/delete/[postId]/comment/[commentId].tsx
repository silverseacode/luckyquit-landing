import { API_URL } from "@/config/index";

// eslint-disable-next-line import/no-anonymous-default-export
export default async (req, res) => {
  try {
    const token = req.headers.authorization?.replace("Bearer ", "");
    const response = await fetch(`${API_URL}/post/${req.query.postId}/comment/${req.query.commentId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      }
    });
    const res1 = await response.json();
    res.json({ response: res1 });
  } catch (err) {
    console.log(err);
  }
};