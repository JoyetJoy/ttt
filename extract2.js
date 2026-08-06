const fs = require('fs');
const readline = require('readline');

async function processLineByLine() {
  const fileStream = fs.createReadStream('C:\\Users\\Btm24\\.gemini\\antigravity\\brain\\8dcea233-e5aa-4177-a8e6-0410d7878fb4\\.system_generated\\logs\\transcript_full.jsonl');

  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  let content = '';
  
  for await (const line of rl) {
    if (line.includes('ActivityList.jsx')) {
      try {
        const obj = JSON.parse(line);
        if (obj.tool_calls) {
          for (let call of obj.tool_calls) {
            if (call.arguments && call.arguments.TargetFile && call.arguments.TargetFile.includes('ActivityList.jsx')) {
              if (call.name === 'default_api:write_to_file' || call.name === 'write_to_file') {
                content = call.arguments.CodeContent;
              } else if (call.name === 'default_api:multi_replace_file_content' || call.name === 'multi_replace_file_content') {
                content += JSON.stringify(call.arguments.ReplacementChunks, null, 2) + '\n---\n';
              }
            }
          }
        }
      } catch (e) {
        // ignore parse errors
      }
    }
  }
  fs.writeFileSync('activity_list_content.txt', content);
}

processLineByLine();
