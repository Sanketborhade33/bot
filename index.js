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

/* ===================== DATA (SAME AS OLD BOT) ===================== */

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
    hp:{
      "1":[
        "https://www.youtube.com/watch?v=45y4YGxVInw",
        "https://www.youtube.com/HP20k2",
        "https://www.youtube.com/HP20k3"
      ],
      "2":[
        "https://www.youtube.com/HP30k1",
        "https://www.youtube.com/HP30k2"
      ],
      "3":[
        "https://www.youtube.com/HP40k1",
        "https://www.youtube.com/HP40k2"
      ]
    },
    dell:{
      "1":[
        "https://www.youtube.com/Dell20k1",
        "https://www.youtube.com/Dell20k2"
      ],
      "2":[
        "https://www.youtube.com/Dell30k1",
        "https://www.youtube.com/Dell30k2"
      ],
      "3":[
        "https://www.youtube.com/Dell40k1",
        "https://www.youtube.com/Dell40k2"
      ]
    },
    asus:{
      "1":[
        "https://www.youtube.com/Asus20k1",
        "https://www.youtube.com/Asus20k2"
      ],
      "2":[
        "https://www.youtube.com/Asus30k1",
        "https://www.youtube.com/Asus30k2"
      ],
      "3":[
        "https://www.youtube.com/Asus40k1",
        "https://www.youtube.com/Asus40k2"
      ]
    },
    lenovo:{
      "1":[
        "https://www.youtube.com/Lenovo20k1",
        "https://www.youtube.com/Lenovo20k2"
      ],
      "2":[
        "https://www.youtube.com/Lenovo30k1",
        "https://www.youtube.com/Lenovo30k2"
      ],
      "3":[
        "https://www.youtube.com/Lenovo40k1",
        "https://www.youtube.com/Lenovo40k2"
      ]
    },
    macbook:{
      "1":[
        "https://www.youtube.com/Mac20k1",
        "https://www.youtube.com/Mac20k2"
      ],
      "2":[
        "https://www.youtube.com/Mac30k1",
        "https://www.youtube.com/Mac30k2"
      ],
      "3":[
        "https://www.youtube.com/Mac40k1",
        "https://www.youtube.com/Mac40k2"
      ]
    },
    acer:{
      "1":[
        "https://www.youtube.com/Acer20k1",
        "https://www.youtube.com/Acer20k2"
      ],
      "2":[
        "https://www.youtube.com/Acer30k1",
        "https://www.youtube.com/Acer30k2"
      ],
      "3":[
        "https://www.youtube.com/Acer40k1",
        "https://www.youtube.com/Acer40k2"
      ]
    }
  },

  desktop: {
    hp:{
      "1":[
        "https://www.youtube.com/HPDesk20k1",
        "https://www.youtube.com/HPDesk20k2"
      ],
      "2":[
        "https://www.youtube.com/HPDesk30k1",
        "https://www.youtube.com/HPDesk30k2"
      ],
      "3":[
        "https://www.youtube.com/HPDesk40k1",
        "https://www.youtube.com/HPDesk40k2"
      ]
    },
    dell:{
      "1":[
        "https://www.youtube.com/DellDesk20k1",
        "https://www.youtube.com/DellDesk20k2"
      ],
      "2":[
        "https://www.youtube.com/DellDesk30k1",
        "https://www.youtube.com/DellDesk30k2"
      ],
      "3":[
        "https://www.youtube.com/DellDesk40k1",
        "https://www.youtube.com/DellDesk40k2"
      ]
    },
    asus:{
      "1":[
        "https://www.youtube.com/AsusDesk20k1",
        "https://www.youtube.com/AsusDesk20k2"
      ],
      "2":[
        "https://www.youtube.com/AsusDesk30k1",
        "https://www.youtube.com/AsusDesk30k2"
      ],
      "3":[
        "https://www.youtube.com/AsusDesk40k1",
        "https://www.youtube.com/AsusDesk40k2"
      ]
    },
    lenovo:{
      "1":[
        "https://www.youtube.com/LenovoDesk20k1",
        "https://www.youtube.com/LenovoDesk20k2"
      ],
      "2":[
        "https://www.youtube.com/LenovoDesk30k1",
        "https://www.youtube.com/LenovoDesk30k2"
      ],
      "3":[
        "https://www.youtube.com/LenovoDesk40k1",
        "https://www.youtube.com/LenovoDesk40k2"
      ]
    },
    acer:{
      "1":[
        "https://www.youtube.com/AcerDesk20k1",
        "https://www.youtube.com/AcerDesk20k2"
      ],
      "2":[
        "https://www.youtube.com/AcerDesk30k1",
        "https://www.youtube.com/AcerDesk30k2"
      ],
      "3":[
        "https://www.youtube.com/AcerDesk40k1",
        "https://www.youtube.com/AcerDesk40k2"
      ]
    }
  }
};


/* ===================== USER STATE (SAME AS OLD) ===================== */
const userState = {};

/* ===================== HELPER: SEND MESSAGE ===================== */
async function sendMessage(to, text) {
  await axios.post(
    `https://graph.facebook.com/v18.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`,
    {
      messaging_product: "whatsapp",
      to,
      text: { body: text }
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
        "Content-Type": "application/json"
      }
    }
  );
}

/* ===================== RECEIVE MESSAGE ===================== */
app.post("/webhook", async (req, res) => {
  try {
    const message = req.body.entry?.[0]?.changes?.[0]?.value?.messages?.[0];
    if (!message) return res.sendStatus(200);

    const chatId = message.from;
    const msg = message.text?.body?.toLowerCase().trim();

    let reply = "";
    const state = userState[chatId] || { step: "main" };

    /* ===== MENU ===== */
    if (["hi","hello","menu","start"].includes(msg)) {
      userState[chatId] = { step: "main" };
      reply =
`👋 *Welcome to Jijau Computer Store*

Please choose an option 👇
1️⃣ Laptop
2️⃣ Desktop
3️⃣ Repair Services
4️⃣ Store Address
5️⃣ Contact Support`;
    }

    /* ===== MAIN MENU ===== */
    else if (state.step === "main") {
      if (msg === "1" || msg === "laptop") {
        userState[chatId] = { step:"brand", type:"laptop" };
        reply =
`💻 *Laptop Brands*
1️⃣ HP
2️⃣ Dell
3️⃣ Asus
4️⃣ Lenovo
5️⃣ MacBook
6️⃣ Acer

🔁 Type *MENU* to go back`;
      }
      else if (msg === "2" || msg === "desktop") {
        userState[chatId] = { step:"brand", type:"desktop" };
        reply =
`🖥️ *Desktop Brands*
1️⃣ HP
2️⃣ Dell
3️⃣ Asus
4️⃣ Lenovo
5️⃣ Acer

🔁 Type *MENU* to go back`;
      }
      else if (msg === "3") {
        reply =
`🔧 *Repair Services*
✔ Laptop Repair
✔ Desktop Repair
✔ Screen Replacement
✔ Software Installation
✔ Virus Removal
✔ Printer Repair

🔁 Type *MENU* to go back`;
      }
      else if (msg === "4") {
        reply =
`📍 *Jijau Computer Store*
Opposite to SBI Bank, Jalna Road, Jafrabad

🕘 10:00 AM – 9:00 PM`;
      }
      else if (msg === "5") {
        reply =
`📞 *Contact Support*
📱 8805608908
📧 jijauc@gmail.com`;
      }
      else {
        reply = "❌ Invalid input. Type *MENU* to start again";
      }
    }

    /* ===== BRAND SELECTION ===== */
    else if (state.step === "brand") {
      const brand = (brandMap[msg] || msg).toLowerCase();
      const allowed = state.type === "laptop" ? laptopBrands : desktopBrands;

      if (!allowed.includes(brand)) {
        reply = `❌ ${brand.toUpperCase()} is not available.\n\n🔁 Type *MENU*`;
      } else {
        const vids = links[state.type][brand];
        reply = `💻 *${brand.toUpperCase()} ${state.type.toUpperCase()} – Reviews*\n\n`;
        ["1","2","3"].forEach(b => {
          if (vids[b]) {
            reply += `${budgetText[b]}:\n${vids[b].join("\n")}\n\n`;
          }
        });
        reply += "🔁 Type *MENU* to go back";
      }
    }

    await sendMessage(chatId, reply);
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


