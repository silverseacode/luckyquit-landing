import { API_URL } from "@/config/index";

// eslint-disable-next-line import/no-anonymous-default-export
export default async (req, res) => {
    console.log("BODY123312,", req.body)
   const response = await fetch('https://exp.host/--/api/v2/push/send', {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Accept: 'application/json',
            'Accept-encoding': 'gzip, deflate',
        },
        body: JSON.stringify({
            to: req.body?.token ?? "",
            title: req.body.title,
            body: req.body.body,
            data: req.body.data
        })
    })
    const res1 = await response.json();
    res.json({ response: res1 });
};
