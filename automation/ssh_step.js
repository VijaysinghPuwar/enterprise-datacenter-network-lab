// Continues the interactive SSH session on NOC-PC: password, show command, exit.
eval(ipc.systemFileManager().getFileContents("/Users/vijay_macbookm5/Desktop/GitHub/Projects/Network/automation/lib.js"));
var cl = dev("NOC-PC").getCommandLine();
for (var i = 0; i < SSH_STEPS.length; i++) cl.enterCommand(SSH_STEPS[i]);
log("sent " + SSH_STEPS.length + " lines; prompt now '" + cl.getPrompt() + "'");
flushLog("automation/logs/ssh_step.log");
