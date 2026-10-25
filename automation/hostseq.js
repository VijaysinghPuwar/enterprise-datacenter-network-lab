// Run a short sequence of quick commands on one host's command prompt and dump the tail of its output.
eval(ipc.systemFileManager().getFileContents("/Users/vijay_macbookm5/Desktop/GitHub/Projects/Network/automation/lib.js"));
var cl = dev(HOST).getCommandLine();
try { cl.enterChar(3, 0); } catch (e) {}
for (var i = 0; i < HOST_CMDS.length; i++) cl.enterCommand(HOST_CMDS[i]);
var o = String(cl.getOutput());
writeFile("lab-support/evidence/raw/tests/hostseq_" + HOST + ".txt", o.substring(Math.max(0, o.length - 2500)));
