const express = require("express");
const app = express();
app.use(express.json());

/* ===================== YOUR LOGIC DATA ===================== */

const laptopBrands = ['hp','dell','asus','lenovo','macbook','acer'];
const desktopBrands = ['hp','dell','asus','lenovo','acer'];

const brandMap = { '1':'hp','2':'dell','3':'asus','4':'lenovo','5':'macbook','6':'acer' };

const budgetText = { '1':'Under ₹20,000','2':'Under ₹30,000','3':'Under ₹40,000' };

const links = {
  laptop: {
    hp:{ '1':['HP20k-1','HP20k-2'], '2':['HP30k-1'], '3':['HP40k-1'] },
    dell:{ '1':['Dell20k-1'], '2':['Dell30k-1'], '3':['Dell40k-1'] },
    asus:{ '1':['Asus20k-1'], '2':['Asus30k-1'], '3':['Asus40k-1'] },
    lenovo:{ '1':['Lenovo20k-1'], '2':['Lenovo30k-1'], '3':['Lenovo40k-1'] },
    macbook:{ '1':['Mac20k'], '2':['Mac30k'], '3':['Mac40k'] },
    acer:{ '1':['Acer20k'], '2':['Acer30k'], '3':['Acer40k'] },
  },
  desktop: {
    hp:{ '1':['HPDesk20k'], '2':['HPDesk30k'], '3':['HPDesk40k'] },
    dell:{ '1':['DellDesk20k'], '2':['DellDesk30k'], '3':['DellDesk40k'] },
    asus:{ '1':['AsusDesk20k'], '2':['AsusDesk30k'], '3':['AsusDesk40k'] },
    lenovo:{ '1':['LenovoDesk20k'], '2':['LenovoDesk30k'], '3':['LenovoDesk40k'] },
    acer:{ '1':['AcerDesk20k'], '2':['AcerDesk30k'], '3':['AcerDesk40k'] },
  }
};

const userState = {};

/* ===================== LOGIC FUNCTION ===================== */

function handleMessage(chatId, msg) {
  msg = msg.toLowerCase().trim();
  let reply = "";

  if (['hi','hello','menu','start'].includes(msg)) {
    userState[chatId] = { step:'main' };
    return `👋 Welcome to Jijau Computer Store

1️⃣ Laptop
2️⃣ Desktop
3️⃣ Repair Services
4️⃣ Store Address
5️⃣ Contact Support`;
  }

  const state = userState[chatId] || { step:'main' };

  switch (state.step) {

    case 'main':
      if (msg === '1' || msg === 'laptop') {
        userState[chatId] = { step:'brand', type:'laptop' };
        return `💻 Laptop Brands
1️⃣ HP
2️⃣ Dell
3️⃣ Asus
4️⃣ Lenovo
5️⃣ MacBook
6️⃣ Acer`;
      }

      if (msg === '2' || msg === 'desktop') {
        userState[chatId] = { step:'brand', type:'desktop' };
        return `🖥 Desktop Brands
1️⃣ HP
2️⃣ Dell
3️⃣ Asus
4️⃣ Lenovo
5️⃣ Acer`;
      }

      return "❌ Invalid input. Type MENU";

    case 'brand': {
      const brand = (brandMap[msg] || msg).toLowerCase();
      const allowed = state.type === 'laptop' ? laptopBrands : desktopBrands;

      if (!allowed.includes(brand)) {
        return `❌ ${brand.toUpperCase()} not available for ${state.type.toUpperCase()}`;
      }

      const vids = links[state.type][brand];
      let text = `💻 ${brand.toUpperCase()} ${state.type.toUpperCase()} Reviews\n\n`;

      ['1','2','3'].forEach(b => {
        text += `${budgetText[b]}:\n${vids[b].join('\n')}\n\n`;
      });

      text += "🔁 Type MENU to go back";
      return text;
    }

    default:
      userState[chatId] = { step:'main' };
      return "❌ Invalid input. Type MENU";
  }
}

/* ===================== LOCAL TEST ENDPOINT ===================== */

app.post("/test", (req, res) => {
  const { chatId, message } = req.body;
  const reply = handleMessage(chatId, message);
  res.json({ reply });
});

app.listen(3000, () => {
  console.log("✅ Local test server running on http://localhost:3000");
});
