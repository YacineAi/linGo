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
  botly.sendAction({id: senderId, action: Botly.CONST.ACTION_TYPES.MARK_SEEN}, async () => {
  if (message.message.text) {
    botly.sendAction({id: senderId, action: Botly.CONST.ACTION_TYPES.TYPING_ON}, async () => {
    if (message.message.text.length > 1600) {
      botly.sendAction({id: senderId, action: Botly.CONST.ACTION_TYPES.TYPING_OFF}, async () => {
      botly.sendText({id: senderId, text: "النص أطول من 1600 حرف :| يرجى قص النص الى أجزاء أصغر..."});
    });
    } else {
      if (message.message.text.startsWith("https://")) {
        botly.sendAction({id: senderId, action: Botly.CONST.ACTION_TYPES.TYPING_OFF}, async () => {
        botly.sendImage({id: senderId, url: "https://i.ibb.co/d2TxPkf/gensharebot.png"}, (err, data) => {
          botly.sendButtons({
              id: senderId,
              text: "تم تحديد رابط 🔗\nهل تريد تجربة صفحتنا لتحميل الفيديوهات 🎥 بإستعمال الرابط ؟ 🙆🏻‍♂️.\nالصفحة :\nfacebook.com/Sharebotapp",
              buttons: [botly.createWebURLButton("Messenger 💬", "m.me/Sharebotapp/")],
            });
      });
    });
      } else {
        const user = await userDb(senderId);
        if (user[0]) {
          axios.get(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${user[0].lang}&dt=t&q=${message.message.text}`)
          .then (({ data }) => {
            let text = "";
            data[0].forEach(element => {
              text += '\n' + element[0];
            });
            botly.sendAction({id: senderId, action: Botly.CONST.ACTION_TYPES.TYPING_OFF}, async () => {
            botly.sendButtons({
              id: senderId,
              text: text,
              buttons: [
                botly.createPostbackButton("تغيير اللغة 🇺🇲🔄", "ChangeLang"),
              ],
            });
          });
            /*
            botly.sendText({id: senderId, text: text,
              quick_replies: [
                  botly.createQuickReply("تغيير اللغة 🇺🇲🔄", "ChangeLang")]});*/
          }, error => {
            console.log(error)
          })
          } else {
            await createUser({uid: senderId, lang: "en" })
              .then((data, error) => {
                axios.get(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=en&dt=t&q=${message.message.text}`)
                .then (({ data }) => {
                  let text = "";
                  data[0].forEach(element => {
                    text += '\n' + element[0];
                  });
                  botly.sendAction({id: senderId, action: Botly.CONST.ACTION_TYPES.TYPING_OFF}, async () => {
                  botly.sendButtons({
                    id: senderId,
                    text: text,
                    buttons: [
                      botly.createPostbackButton("تغيير اللغة 🇺🇲🔄", "ChangeLang"),
                    ],
                  });
                });
                  /*
                  botly.sendText({id: senderId, text: text,
                    quick_replies: [
                      botly.createQuickReply("تغيير اللغة 🇺🇲🔄", "ChangeLang")]});*/
                    }, error => { console.log(error) })
                  });
              }
      }
    }
  });
    } else if (message.message.attachments[0].payload.sticker_id) {
      //botly.sendText({id: senderId, text: "(Y)"});
    } else if (message.message.attachments[0].type == "image") {
      botly.sendImage({id: senderId, url: "https://i.ibb.co/QjbwQPg/gentorjman2.png"}, (err, data) => {
          botly.sendButtons({
              id: senderId,
              text: "لا يمكنني ترجمة الصور 🤷🏻‍♂️🙄\nلكن يمكنك تجربة صفحتنا الثانية لترجمة الصور 😁.\nالصفحة :\nfacebook.com/Torjman2",
              buttons: [botly.createWebURLButton("Messenger 💬", "m.me/Torjman2/")],
            });
      });
    } else if (message.message.attachments[0].type == "audio" || message.message.attachments[0].type == "video") {
      botly.sendText({id: senderId, text: "لا يمكنني ترجمة الوسائط 🎥 للأسف! إستعمل النصوص فقط 😐"});
    }
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