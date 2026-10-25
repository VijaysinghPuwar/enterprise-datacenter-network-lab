eval(ipc.systemFileManager().getFileContents("/Users/vijay_macbookm5/Desktop/GitHub/Projects/Network/automation/lib.js"));
eval(readFile("automation/cli.js"));
var d = dev("FW-1"); ensurePriv(d);
var seq = String(readFile("automation/pt-adjusted/FW-1-db-zone-v2.cfg")).split(/\r?\n/).filter(function (l) { return l.replace(/\s+/g, ""); });
for (var j = 0; j < seq.length; j++) { var o = run(d, seq[j]); if (/Invalid|ERROR|Incomplete/.test(o)) log("REJECT " + seq[j] + " => " + o.replace(/\s+/g, " ").substring(0, 160)); }
log(run(d, "show access-list"));
log(run(d, "show nat"));
flushLog("automation/logs/db_fix3.log");
