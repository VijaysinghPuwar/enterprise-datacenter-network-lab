eval(ipc.systemFileManager().getFileContents("/Users/vijay_macbookm5/Desktop/GitHub/Projects/Network/automation/lib.js"));
var o = String(dev(DUMP_DEV).getCommandLine().getOutput());
writeFile("lab-support/evidence/raw/tests/dump_" + DUMP_DEV + ".txt", o.substring(Math.max(0, o.length - 6000)));
