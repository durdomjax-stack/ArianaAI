import http from "node:http";

const PORT = Number(process.env.PORT || 3000);
const API_KEY = process.env.OPENAI_API_KEY;
const APP_TOKEN = process.env.ARIANA_APP_TOKEN;
const MODEL = process.env.OPENAI_MODEL || "gpt-5-mini";
const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || "*";
const hits = new Map();
const persona = `Ты — Аріана, взрослая виртуальная собеседница. Общайся на русском языке тепло, естественно, с юмором и лёгким взаимным флиртом. Будь внимательна к контексту, не повторяйся и задавай уместные вопросы. Не утверждай, что являешься настоящим человеком. Не описывай откровенные сексуальные действия.`;
const server = http.createServer(async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", ALLOWED_ORIGIN);
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, X-Ariana-Token");
  if (req.method === "OPTIONS") { res.writeHead(204); return res.end(); }
  if (req.method === "GET" && req.url === "/health") { res.writeHead(200, {"Content-Type":"application/json"}); return res.end(JSON.stringify({ok:true,configured:Boolean(API_KEY && APP_TOKEN)})); }
  if (req.method !== "POST" || req.url !== "/chat") { res.writeHead(404); return res.end("Not found"); }
  if (!API_KEY || !APP_TOKEN) { res.writeHead(503, {"Content-Type":"application/json"}); return res.end(JSON.stringify({error:"Backend secrets are not configured"})); }
  if (req.headers["x-ariana-token"] !== APP_TOKEN) { res.writeHead(401, {"Content-Type":"application/json"}); return res.end(JSON.stringify({error:"Invalid app access token"})); }
  const ip = req.socket.remoteAddress || "unknown"; const now = Date.now(); const recent = (hits.get(ip) || []).filter(t => now-t < 60000);
  if (recent.length >= 20) { res.writeHead(429, {"Content-Type":"application/json"}); return res.end(JSON.stringify({error:"Too many requests"})); }
  recent.push(now); hits.set(ip,recent);
  let raw = ""; for await (const chunk of req) { raw += chunk; if (raw.length > 50000) { res.writeHead(413); return res.end("Too large"); } }
  try {
    const body = JSON.parse(raw); const message = String(body.message || "").slice(0,4000);
    if (!message) { res.writeHead(400); return res.end(JSON.stringify({error:"message required"})); }
    const history = Array.isArray(body.history) ? body.history.slice(-16).map(x => ({role:x.role === "assistant" ? "assistant" : "user",content:String(x.content || "").slice(0,2000)})) : [];
    const response = await fetch("https://api.openai.com/v1/responses", {method:"POST",headers:{"Authorization":"Bearer "+API_KEY,"Content-Type":"application/json"},body:JSON.stringify({model:MODEL,instructions:persona,input:[...history,{role:"user",content:message}],max_output_tokens:500})});
    const data = await response.json(); if (!response.ok) throw new Error(data.error?.message || "OpenAI API request failed");
    const reply = (data.output || []).flatMap(item => item.content || []).filter(c => c.type === "output_text").map(c => c.text).join("\n").trim();
    if (!reply) throw new Error("No text returned"); res.writeHead(200, {"Content-Type":"application/json"}); res.end(JSON.stringify({reply}));
  } catch (e) { res.writeHead(500, {"Content-Type":"application/json"}); res.end(JSON.stringify({error:String(e.message || e)})); }
});
server.listen(PORT, "0.0.0.0", () => console.log("ArianaAI backend listening on "+PORT));