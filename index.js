const express = require("express");
const app = express();
const axios = require("axios");
const Botly = require("botly");
const botly = new Botly({
  accessToken: process.env.PAGE_ACCESS_TOKEN,
  verifyToken: process.env.VERIFY_TOKEN,
});
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.SB_URL, process.env.SB_KEY, { auth: { persistSession: false} });

/* ----- DB Qrs ----- */

async function createUser(user) {
  const { data, error } = await supabase
      .from('users')
      .insert([ user ]);

    if (error) {
      throw new Error('Error creating user : ', error);
    } else {
      return data
    }
};

async function updateUser(id, update) {
  const { data, error } = await supabase
    .from('users')
    .update( update )
    .eq('uid', id);

    if (error) {
      throw new Error('Error updating user : ', error);
    } else {
      return data
    }
};

async function userDb(userId) {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('uid', userId);

  if (error) {
    console.error('Error checking user:', error);
  } else {
    return data
  }
};


app.get("/", function (_req, res) {
  res.sendStatus(200);
});

app.use(express.json({ verify: botly.getVerifySignature(process.env.APP_SECRET) }));
app.use(express.urlencoded({ extended: false }));
app.use("/webhook", botly.router());

botly.on("message", async (senderId, message) => {
  /*--------- s t a r t ---------*/
  botly.sendImage({id: senderId, url: "https://i.ibb.co/Y2cYy0Q/IMG-20240120-105311.jpg"}, (err, data) => {
          botly.sendButtons({
              id: senderId,
              text: "⭕️ مهم 📣 \nالمرجو دعم صفحتنا بالاعجاب على التعليق هنا :\nhttps://m.facebook.com/story.php?story_fbid=779351384236562&id=100064851216054\n(اذا لم يظهر لك تعليقنا الرجاء الاعجاب بصفحتنا أولا 💜)\n+ تنتهي المسابقة بعد ساعة من الان. سنقوم بإعادة خدمة الترجمة عند نهاية المسابقة 💜",
              buttons: [botly.createWebURLButton("حسابي الخاص 💬", "facebook.com/0xNoti/")],
            });
      });
  /*--------- e n d ---------*/
});
botly.on("postback", async (senderId, message, postback, data, ref) => {
    /*--------- s t a r t ---------*/
    if (message.postback){ // Normal (buttons)
      if (postback == "GET_STARTED"){
      } else if (postback == "ChangeLang") {
          botly.send({
              "id": senderId,
              "message": {
              "text": "من فضلك إختر اللغة التي تريد ان اترجم لك لها 🔁🌐",
              "quick_replies":[
                {
                  "content_type":"text",
                  "title":"Arabic 🇩🇿",
                  "payload":"ar",
                },{
                  "content_type":"text",
                  "title":"English 🇺🇸",
                  "payload":"en",
                },{
                  "content_type":"text",
                  "title":"French 🇫🇷",
                  "payload":"fr",
                },{
                  "content_type":"text",
                  "title":"German 🇩🇪",
                  "payload":"de",
                },{
                  "content_type":"text",
                  "title":"Spanish 🇪🇸",
                  "payload":"es",
                },{
                  "content_type":"text",
                  "title":"Russian 🇷🇺",
                  "payload":"ru",
                },{
                  "content_type":"text",
                  "title":"Italian 🇮🇹",
                  "payload":"it",
                },{
                  "content_type":"text",
                  "title":"Turkish 🇹🇷",
                  "payload":"tr",
                },{
                  "content_type":"text",
                  "title":"Korean 🇰🇷",
                  "payload":"ko",
                },{
                  "content_type":"text",
                  "title":"Japanese 🇯🇵",
                  "payload":"ja",
                },{
                  "content_type":"text",
                  "title":"Hindi 🇮🇳",
                  "payload":"hi",
                },{
                  "content_type":"text",
                  "title":"Albanian 🇦🇱",
                  "payload":"sq",
                },{
                  "content_type":"text",
                  "title":"Swedish 🇸🇪",
                  "payload":"sv",
                }
              ]
            }
            });
      } else if (postback == "tbs") {
          //
      } else if (postback == "OurBots") {
      }
    } else { // Quick Reply
      if (message.message.text == "tbs") {
          //
      } else if (message.message.text == "tbs") {
        //
      } else if (postback == "ChangeLang"){
          botly.send({
              "id": senderId,
              "message": {
              "text": "من فضلك إختر اللغة التي تريد ان اترجم لك لها 🔁🌐",
              "quick_replies":[
                {
                  "content_type":"text",
                  "title":"Arabic 🇩🇿",
                  "payload":"ar",
                },{
                  "content_type":"text",
                  "title":"English 🇺🇸",
                  "payload":"en",
                },{
                  "content_type":"text",
                  "title":"French 🇫🇷",
                  "payload":"fr",
                },{
                  "content_type":"text",
                  "title":"German 🇩🇪",
                  "payload":"de",
                },{
                  "content_type":"text",
                  "title":"Spanish 🇪🇸",
                  "payload":"es",
                },{
                  "content_type":"text",
                  "title":"Russian 🇷🇺",
                  "payload":"ru",
                },{
                  "content_type":"text",
                  "title":"Italian 🇮🇹",
                  "payload":"it",
                },{
                  "content_type":"text",
                  "title":"Turkish 🇹🇷",
                  "payload":"tr",
                },{
                  "content_type":"text",
                  "title":"Korean 🇰🇷",
                  "payload":"ko",
                },{
                  "content_type":"text",
                  "title":"Japanese 🇯🇵",
                  "payload":"ja",
                },{
                  "content_type":"text",
                  "title":"Hindi 🇮🇳",
                  "payload":"hi",
                },{
                  "content_type":"text",
                  "title":"Albanian 🇦🇱",
                  "payload":"sq",
                },{
                  "content_type":"text",
                  "title":"Swedish 🇸🇪",
                  "payload":"sv",
                }
              ]
            }
            });
      } else {
        await updateUser(senderId, {lang: postback })
        .then((data, error) => {
          if (error) { botly.sendText({id: senderId, text: "حدث خطأ"}); }
          botly.sendText({id: senderId, text: "تم تغيير اللغة بنجاح 😀🌍"});
        });
       }
    }
   /*--------- e n d ---------*/
});

app.listen(3000, () =>
  console.log(`App is on Port : 3000`)
)
