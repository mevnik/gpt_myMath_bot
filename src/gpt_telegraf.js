//Здесь бот реализован на telegraf
// а в файле index.js на node-telegram-bot-api

import {Telegraf,session} from 'telegraf';
import config from 'config';
import dotenv from 'dotenv';
import {message}from 'telegraf/filters'
import { writeFile } from 'node:fs';
import { Buffer } from 'node:buffer';
import { ogg } from '../asserts/converter.js';
import { op } from '../asserts/openai.js';
import {removeFile} from '../utils/remover.js';





dotenv.config()

const token = config.get('TOKEN_test_endy')  //with config
//const token = process.env.TOKEN_test_endy; // with env

const bot = new Telegraf(token)
const INITIAL_SESSION = {
	messages: []
}

const ROLS = {
	USER: 'user',
	ASSISTANT: 'assistant',
	SYSTEM: 'system'
}

bot.use(session())

bot.command('new', async(ctx) => {
	ctx.session = INITIAL_SESSION
	await ctx.reply(JSON.stringify(ctx.message.chat.first_name))
  	await ctx.reply('We start new session. Send to me text or voice message')

})

// Variant async/await:

bot.on(message('voice'),async(ctx) =>{
	//await ctx.reply(JSON.stringify(ctx.message,null,2))
    console.log(ctx);
	ctx.session ??= INITIAL_SESSION
	try {
		//await ctx.reply(JSON.stringify(ctx.message,null,2))
		const link = await ctx.telegram.getFileLink(ctx.message.voice.file_id)
		const chartId = ctx.message.chat.id
		ogg.getVoiceMessage(link,chartId)
		.then((res) => {
			ogg.toMp3(res, chartId)
				.then((res) => {
					const path_to_mp3 = res
					op.transcription(res)
						.then((res) => {
							ctx.reply('I get message')
							removeFile(path_to_mp3)
							ctx.session.messages.push({ role: ROLS.USER, content: res.text })
							op.chat(ctx.session.messages)
								.then((res) => {
									ctx.session.messages.push({ role: ROLS.ASSISTANT, content: res.content })
									ctx.reply(res.content)

							})



						})
				})
		})



	}
	catch (err){
		console.log(err+ 'error get voice link')
	}
})

bot.on(message('text'),async(ctx) =>{
	ctx.session ??= INITIAL_SESSION
	try{

			const chartId = ctx.message.chat.id
			const text = ctx.message.text
			ctx.reply('I get text message')
			ctx.session.messages.push({ role: ROLS.USER, content: text })
			op.chat(ctx.session.messages)
				.then((res) => {
					ctx.session.messages.push({ role: ROLS.ASSISTANT, content: res.content })
					ctx.reply(res.content)

			})



		}


	catch (err){
		console.log(err+ 'error get voice link')
		}
})


bot.command('start', async(ctx) => {
	ctx.session = INITIAL_SESSION
	await ctx.reply(JSON.stringify(ctx.message.chat.first_name))
  	await ctx.reply('We start new session. Send to me text or voice message')
})
bot.launch()

process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))


