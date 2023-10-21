import fs from "fs";
import OpenAI from "openai";
import path from'path';
import dotenv from 'dotenv';
import { createReadStream } from 'node:fs';
import {removeFile} from '../utils/remover.js';


dotenv.config()

import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const myKey = process.env.OPENAI_API_KEY;



class openAI{
	constructor(){
    	this.openai = new OpenAI({
  			apiKey: myKey
			});
	}

	async chat(messages){
		try{

  		const completion = await this.openai.chat.completions.create({
    		messages: messages,
    		model: "gpt-3.5-turbo",
  	});

  		return completion.choices[0].message
		}
		catch(e){
			console.log('completion error'+e.message)
		}
	}

	  transcription(path_to_mp3){

		try{ 
			const response = this.openai.audio.transcriptions.create({
				file: fs.createReadStream(path_to_mp3),
				model: "whisper-1", 
			})

			return response
		}
		catch(e){ 
			console.error('error transcription'+e.message)

		}


	
}
}

export const op = new openAI()