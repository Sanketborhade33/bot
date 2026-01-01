require("dotenv").config();
const express = require("express");
const axios = require("axios");

const app = express();
app.use(express.json());

/* ===================== VERIFY WEBHOOK ===================== */
app.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === process.env.VERIFY_TOKEN) {
    return res.status(200).send(challenge);
  }
  return res.sendStatus(403);
});

/* ===================== DATA (UNCHANGED LOGIC) ===================== */

const laptopBrands = ["hp","dell","asus","lenovo","macbook","acer"];
const desktopBrands = ["hp","dell","asus","lenovo","acer"];

const brandMap = {
  "1":"hp","2":"dell","3":"asus","4":"lenovo","5":"macbook","6":"acer"
};

const budgetText = {
  "1":"Under ₹20,000",
  "2":"Under ₹30,000",
  "3":"Under ₹40,000"
};

const links = {
  laptop: {
    hp:{ "1":["https://www.youtube.com/watch?v=45y4YGxVInw"], "2":["https://www.youtube.com/HP30k"], "3":["https://www.youtube.com/HP40k"] },
    dell:{ "1":["https://www.youtube.com/Dell20k"], "2":["https://www.youtube.com/Dell30k"], "3":["https://www.youtube.com/Dell40k"] },
    asus:{ "1":["https://www.youtube.com/Asus20k"], "2":["https://www.youtube.com/Asus30k"], "3":["https://www.youtube.com/Asus40k"] },
    lenovo:{ "1":["https://www.youtube.com/Lenovo20k"], "2":["https://www.youtube.com/Lenovo30k"], "3":["https://www.youtube.com/Lenovo40k"] },
    macbook:{ "1":["https://www.youtube.com/Mac20k"], "2":["https://www.youtube.com/Mac30k"], "3":["https://www.youtube.com/Mac40k"] },
    acer:{ "1":["https://www.youtube.com/Acer20k"], "2":["https://www.youtube.com/Acer30k"], "3":["https://www.youtube.com/Acer40k"] }
  },
  desktop: {
    hp:{ "1":["https://www.youtube.com/HPDesk20k"], "2":["https://www.youtube.com/HPDesk30k"], "3":["https://www.youtube.com/HPDesk40k"] },
    dell:{ "1":["https://www.youtube.com/DellDesk20k"], "2":["https://www.youtube.com/DellDesk30k"], "3":["https://www.youtube.com/DellDesk40k"] },
    asus:{ "1":["https://www.youtube.com/AsusDesk20k"], "2":["https://www.youtube.com/AsusDesk30k"], "3":["https://www.youtube.com/AsusDesk40k"] },
    lenovo:{ "1":["https://www.youtube.com/LenovoDesk20k"], "2":["https://www.youtube.com/LenovoDesk30k"], "3":["https://www.youtube.com/LenovoDesk40k"] },
    acer:{ "1":["https://www.youtube.com/AcerDesk20k"], "2":["https://www.youtube.com/AcerDesk30k"], "3":["https://www.youtube.com/AcerDesk40k"] }
  }
};

/* ===================== USER STATE ===================== */
const userState = {};

/* ===================== RECEIVE MESSAGE ===================== */
app.post("/webhook", async (req, res) => {
  try {
    const message = req.body.entry?.[0]?.changes?.[0]?.value?.messages?.[0];
    if (!message) return res.sendStatus(200);

    const from = message.from;
    const msg = message.text?.body?.toLowerCase().trim();

    let reply = "❌ Invalid input. Type *MENU*";
    let state = userState[from] || { step:"main" };

    /* ===== MENU ===== */
    if (["hi","hello","menu","start"].includes(msg)) {
      userState[from] = { step:"main" };
      reply =
`👋 Welcome to Jijau Computer Store

1️⃣ Laptop
2️⃣ Desktop
3️⃣ Repair Services
4️⃣ Store Address
5️⃣ Contact Support`;
    }

    /* ===== MAIN MENU ===== */
    else if (state.step === "main") {
      if (msg === "1" || msg === "laptop") {
        userState[from] = { step:"brand", type:"laptop" };
        reply = "💻 Laptop Brands:\n1️⃣ HP\n2️⃣ Dell\n3️⃣ Asus\n4️⃣ Lenovo\n5️⃣ MacBook\n6️⃣ Acer";
      }
      else if (msg === "2" || msg === "desktop") {
        userState[from] = { step:"brand", type:"desktop" };
        reply = "🖥️ Desktop Brands:\n1️⃣ HP\n2️⃣ Dell\n3️⃣ Asus\n4️⃣ Lenovo\n5️⃣ Acer";
      }
      else if (msg === "3") reply = "🔧 Repair services available.\nType MENU to go back";
      else if (msg === "4") reply = "📍 Jijau Computer Store, Jalna Road";
      else if (msg === "5") reply = "📞 8805608908";
    }

    /* ===== BRAND SELECTION ===== */
    else if (state.step === "brand") {
      const brand = (brandMap[msg] || msg).toLowerCase();
      const allowed = state.type === "laptop" ? laptopBrands : desktopBrands;

      if (!allowed.includes(brand)) {
        reply = "❌ Invalid brand. Type MENU";
      } else {
        const vids = links[state.type][brand];
        reply = `💻 ${brand.toUpperCase()} ${state.type}\n\n`;
        ["1","2","3"].forEach(b=>{
          if (vids[b]) reply += `${budgetText[b]}:\n${vids[b].join("\n")}\n\n`;
        });
        reply += "🔁 Type MENU";
      }
    }

    /* ===== SEND MESSAGE ===== */
    await axios.post(
      `https://graph.facebook.com/v18.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`,
      {
        messaging_product:"whatsapp",
        to: from,
        text:{ body: reply }
      },
      {
        headers:{
          Authorization:`Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
          "Content-Type":"application/json"
        }
      }
    );

    res.sendStatus(200);
  } catch (err) {
    console.error(err.response?.data || err.message);
    res.sendStatus(500);
  }
});

/* ===================== START SERVER ===================== */
app.listen(process.env.PORT, () =>
  console.log("✅ WhatsApp Cloud API Bot Running")
);
