import { Message } from 'discord.js';
import random from "../../utils/random";
export const help = 'fuck up da code...';
export const aliases = [];
function discordCodeBlock (str: string): {
  start: number;
  end: number;
  lang: string;
  code: string;
  block: string;
}[] {
  var regex = /^(([ \t]*`{3,4})([^\n]*)([\s\S]+?)(^[ \t]*\2))/gm;
  var blocks = [];
  var match = null;

  while ((match = regex.exec(str))) {
    blocks.push({
      start: match.index,
      end: match.index + match[1].length,
      lang: match[3],
      code: match[4],
      block: match[1]
    });
  }
  return blocks;
}
const obfuscators: { [key: string]: (str: string) => Promise<string> | string; } = {
  async lua (code) {
    return (await fetch("https://obfuscator.aztupscripts.xyz/api/v1/obfuscate", {
      headers: {
        accept: "application/json, text/plain, */*",
        "content-type": "application/json;charset=UTF-8"
      },
      body: JSON.stringify({
        script: code,
        options: {
          AddMemes: true,
          PreserveLineInfo: false,
          NoControlFlow: true,
          EncryptStrings: true,
          EncryptImportantStrings: true,
          NoBytecodeCompress: true,
          Uglify: true,
          CustomVarName: "trollsmile"
        }
      }),
      method: "POST"
    }).then(res => res.json())).script;
  },
  // async vbscript (code) {
  //   const domains = ['helloacm.com', 'happyukgo.com', 'uploadbeta.com', 'steakovercooked.com', 'anothervps.com', 'isvbscriptdead.com']
  //   const res = await fetch('https://' + random(domains) + '/api/vbscript-obfuscator/?s=' + encodeURIComponent(code), {
  //     method: 'POST'
  //   });
  //   return res.text();
  // }
};
export async function run (message: Message, args: string[]) {
  const [{ lang = '', code = '' }] = discordCodeBlock(args.join(' '));
  if (!lang.trim()) return 'Language not found!';

  if (obfuscators[lang]) {
    try {
      message.channel.startTyping()
      const newFile = await obfuscators[lang](code);
      message.channel.stopTyping()
      return {
        content: 'Done!',
        files: [{
          name: 'output.txt',
          attachment: Buffer.from(newFile)
        }]
      };
    } catch (err) {
      message.channel.stopTyping()
      return 'Error: ' + err.toString();
    }
  } else return 'Language not supported!';
}
