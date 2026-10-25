eval(ipc.systemFileManager().getFileContents("/Users/vijay_macbookm5/Desktop/GitHub/Projects/Network/automation/lib.js"));
eval(readFile("automation/cli.js"));
var d = dev("FW-1"); ensurePriv(d);
var seq = ["configure terminal", "interface GigabitEthernet1/1", "no shutdown", "interface GigabitEthernet1/2", "no shutdown", "interface GigabitEthernet1/3", "no shutdown", "end", "write memory"];
for (var j = 0; j < seq.length; j++) { var o = run(d, seq[j]); if (/Invalid|ERROR/.test(o)) log("REJECT " + seq[j] + " " + o); }
log(run(d, "show interface ip brief"));
flushLog("automation/logs/fw_noshut.log");
