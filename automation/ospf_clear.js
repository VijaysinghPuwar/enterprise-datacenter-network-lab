eval(ipc.systemFileManager().getFileContents("/Users/vijay_macbookm5/Desktop/GitHub/Projects/Network/automation/lib.js"));
eval(readFile("automation/cli.js"));
var d = dev("CORE-1"); ensurePriv(d);
var o = run(d, "clear ip ospf process");
log("clear => " + o.replace(/\s+/g, " "));
if (/yes|\[no\]|confirm/i.test(prompt(d) + o)) { rawSend(d, "yes"); log("answered yes; prompt " + prompt(d)); }
flushLog("automation/logs/ospf_clear.log");
