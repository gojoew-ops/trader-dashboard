export default function handler(req, res) {
  if (req.method === "POST") {
    console.log("Incoming Alert:", req.body);
    return res.status(200).json({ status: "ok" });
  }
  res.status(405).json({ error: "Method not allowed" });
}