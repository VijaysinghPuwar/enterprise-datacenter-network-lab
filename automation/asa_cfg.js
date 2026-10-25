// Apply an ASA config file in one continuous CLI session; report rejected lines.
eval(ipc.systemFileManager().getFileContents("/Users/vijay_macbookm5/Desktop/GitHub/Projects/Network/automation/lib.js"));
eval(readFile("automation/cli.js"));
var d = dev("FW-1"); ensurePriv(d);
var seq = String(readFile(ASA_FILE)).split(/\r?\n/).filter(function (l) { return l.replace(/\s+/g, ""); });
for (var j = 0; j < seq.length; j++) { var o = run(d, seq[j]); if (/Invalid|ERROR|Incomplete/.test(o)) log("REJECT " + seq[j] + " => " + o.replace(/\s+/g, " ").substring(0, 160)); }
log(run(d, "show access-list"));
flushLog("automation/logs/asa_cfg_" + ASA_FILE.replace(/.*\//, "") + ".log");
