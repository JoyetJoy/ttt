const fs = require('fs');
const lines = fs.readFileSync('findstr_activity_list.txt', 'utf8').split('\n');
let content = '';
for (let line of lines) {
  try {
    const obj = JSON.parse(line);
    if (obj.tool_calls) {
      for (let call of obj.tool_calls) {
        if (call.arguments && call.arguments.TargetFile && call.arguments.TargetFile.includes('ActivityList.jsx')) {
          if (call.name === 'default_api:write_to_file') {
            content = call.arguments.CodeContent;
          } else if (call.name === 'default_api:multi_replace_file_content') {
            // we'll just log the chunks for now to see what was done
            content += JSON.stringify(call.arguments.ReplacementChunks, null, 2) + '\n---\n';
          }
        }
      }
    }
  } catch(e) {}
}
fs.writeFileSync('activity_list_content.txt', content);
