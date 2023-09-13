import { API_URL } from "@/config/index";
import axios from "axios";

// eslint-disable-next-line import/no-anonymous-default-export
export default async (req, res) => {
    if (req.method == "POST") {
      const { data } = await axios.post(`${API_URL}/post/uploadImagePost/${req.query.id}`, req, {
        responseType: "stream",
        headers: {
          "Content-Type": req.headers["content-type"], // which is multipart/form-data with boundary include
        },
      });
      data.pipe(res);
      res.json({ok: 1})
    } else {
      return res.status(405).json({ message: "Method Not Allowed" });
    }
};