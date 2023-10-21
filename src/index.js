//Здесь бот реализован на node-telegram-bot-api
// а в файле gpt_telegraf.js  на telegraf

import dotenv from 'dotenv'
import TelegramBot from 'node-telegram-bot-api';
import { ogg } from '../asserts/converter.js';
import { op } from '../asserts/openai.js';
import {removeFile} from '../utils/remover.js';




dotenv.config()


//const webUrl = 'https://master--storied-praline-da4b4c.netlify.app'// test url
// тестовый фронт-енд на netlify у меня в папке telegram_telegram_front_end


const bot = new TelegramBot(process.env.TOKEN_test_endy, {polling: true})
const webUrl = 'https://bright-parfait-0208bc.netlify.app' // real url muMath

bot.setMyCommands([
    {command:'/talk',description: "Talk to Teacher!"},
    {command:'/school',description: 'To_school'},

    ]);



const ROLS = {
  USER: 'user',
  ASSISTANT: 'assistant',
  SYSTEM: 'system'
}


const session = {
  messages: []
}

const Start = (bot) => {

bot.on('message', async (msg) => {
    const text = msg.text;
    const chatId = msg.chat.id;
    let message = false;
 //   bot.setChatMenuButton(chatId,{type: 'web_app', text: '/to_school', web_app: webUrl})
    /*
    if (text === '/start') {
        message = true;
        //await bot.sendMessage(chatId, 'https://tlgrm.eu/_/stickers/ea5/382/ea53826d-c192-376a-b766-e5abc535f1c9/7.jpg');
        await bot.sendMessage(chatId, 'Wellcome to Math School!');
        await bot.sendMessage(chatId,"To start Lesson Click button",{
        reply_markup:{
          keyboard:[
            [{text: 'To start Lesson', web_app: {url: webUrl}}]
            ]
        }
      })
        return
    }
*/
    if(msg.voice){

        message = true;
        try {
            const link = await bot.getFileLink(msg.voice.file_id)

            const chartId = msg.chat.id
            ogg.getVoiceMessage(link,chartId)
            .then((res) => {
              ogg.toMp3(res, chartId)
                .then((res) => {
                  const path_to_mp3 = res
                  op.transcription(res)
                    .then((res) => {
                      bot.sendMessage(chatId, `I get your voice question`) //: ${res.text} `)
                      removeFile(path_to_mp3)
                      session.messages.push({ role: ROLS.USER, content: res.text })
                      op.chat(session.messages)
                        .then((res) => {
                          session.messages.push({ role: ROLS.ASSISTANT, content: res.content })
                          bot.sendMessage(chatId, `${res.content}`)
                      })
                      
                    })
                })
            })



          }

          catch (err){
            bot.sendMessage(chatId,'Yoops! Some problems... Try later')
          }
          return;
    }


    if (text === '/start') {
      message = true;
      return bot.sendMessage(chatId, `Hello, ${msg.from.first_name}! 
      This bot help you to learn Math. You can get Lessons or ask questions to Teacher. Choose option in Menu. `);
    }


    if (text === '/school') {
      message = true;
/*
      await bot.sendMessage(chatId, "Wellcome to school",{ 
        reply_markup:{
          inline_keyboard: [
            [{text: 'go to school', web_app: {url: webUrl}}]
            ]

        }
      })
      */
      await bot.sendMessage(chatId,"To start Lesson Click button",{
        reply_markup:{
          keyboard:[
            [{text: 'To start Lesson', web_app: {url: webUrl}}]
            ]
        }
      })
      return;

    }

    if (text === '/talk') {
      message = true;

      await bot.sendMessage(chatId,"I listen to You! Ask by text or voice.")
      return;

    }

    if(!message){
        try{
            bot.sendMessage(chatId,'I get text question. Wait a minute')
            session.messages.push({ role: ROLS.USER, content: text })
            op.chat(session.messages)
             .then((res) => {
                session.messages.push({ role: ROLS.ASSISTANT, content: res.content })
                bot.sendMessage(chatId,res.content)
            })
          }
        catch (err){
          bot.sendMessage(chatId,'Yoops! Some problems... Try later')
          }
        return;

    }



//    if(!message) return bot.sendMessage(chatId,`You send me: "${text}".I do not undestand You! Your Test_Endy`)

  });
}

Start(bot)

process.once('SIGINT', () => bot.stopPolling('SIGINT'))
process.once('SIGTERM', () => bot.stopPolling('SIGTERM'))






