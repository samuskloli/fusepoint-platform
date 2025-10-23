const fs=require(fs);
const j=JSON.parse(fs.readFileSync(tmp/login_agent.json,utf8));
const token=j.accessToken || (j.data && j.data.accessToken) || j.access_token || ;
const uid=(j.user && j.user.id) || (j.data && j.data.user && j.data.user.id) || ;
fs.writeFileSync(tmp/access_token.txt, token);
fs.writeFileSync(tmp/agent_id.txt, String(uid));
console.log();
