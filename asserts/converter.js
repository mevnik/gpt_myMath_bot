import axios from 'axios';
import fs from 'fs';
import path from'path';
import fsPromise from'fs/promises';
import { mkdir } from 'node:fs';
import { readFile } from 'node:fs/promises';
import ffmpeg from 'fluent-ffmpeg';
import ffmpegStatic from 'ffmpeg-static';
import installer from '@ffmpeg-installer/ffmpeg';
import {removeFile} from '../utils/remover.js';
//следующие три строки прописаны для использования __dirname в соответсствие со стандартом ES5

import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class Converter {
	constructor (){
		// Tell fluent-ffmpeg where it can find FFmpeg
		ffmpeg.setFfmpegPath(ffmpegStatic);

	}

	toMp3(path_to_ogg,chartId){
		const path_to_output = path.resolve(__dirname,'../voices', `${chartId}.mp3`)
		return new Promise((resolve,reject) => {
		
		// Run FFmpeg
			//https://creatomate.com/blog/how-to-use-ffmpeg-in-nodejs
		try{

		ffmpeg()
		  .input(path_to_ogg)

		  .saveToFile(path_to_output)

		  .on('progress', (progress) => {
		    if (progress.percent) {
		      //console.log(`Processing: ${Math.floor(progress.percent)}% done`);
		    }
		  })

		  .on('end', () => {
		    //console.log('FFmpeg has finished.');
		    removeFile(path_to_ogg)

		  resolve(path_to_output)
		  })

		  .on('error', (error) => {
		 //   console.error(error);
		  });
		}
		catch(err){
			console.log('Error toMp3'+err.message)
		//	reject(new Error('Error toMp3'+err.message))
		}	
		//return path_to_output
	})
}

	async getVoiceMessage(link,chartId){
		const path_to_ogg = path.resolve(__dirname,'../voices', `${chartId}.ogg`)

		const response = await axios({
  			method: 'get',
  			url: link,
  			responseType: 'stream'
		})

			return new Promise((resolve) => {
				const stream = fs.createWriteStream(path_to_ogg)
				response.data.pipe(stream)
				stream.on('finish',() => {
				//console.log('stream finish')
					resolve(path_to_ogg)

			})
			})

  		};


}
export const ogg = new Converter()