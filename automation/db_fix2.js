eval(ipc.systemFileManager().getFileContents("/Users/vijay_macbookm5/Desktop/GitHub/Projects/Network/automation/lib.js"));
eval(readFile("automation/cli.js"));
var d = dev("FW-1"); ensurePriv(d);
var seq = ["configure terminal", "access-list DB_IN line 1 extended permit icmp 10.10.40.0 255.255.255.0 any echo-reply", "end", "write memory"];
for (var j = 0; j < seq.length; j++) { var o = run(d, seq[j]); if (/Invalid|ERROR/.test(o)) log("REJECT " + seq[j] + " " + o); }
log(run(d, "show nat"));
log(run(d, "show xlate"));
flushLog("automation/logs/db_fix2.log");
