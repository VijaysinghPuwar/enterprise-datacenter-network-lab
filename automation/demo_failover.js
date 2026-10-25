// Video demo of a core failure (not saved): DEMO_STEP = "ping" | "off" | "show" | "on"
eval(ipc.systemFileManager().getFileContents("/Users/vijay_macbookm5/Desktop/GitHub/Projects/Network/automation/lib.js"));
eval(readFile("automation/cli.js"));
if (DEMO_STEP === "ping") { dev("NOC-PC").getCommandLine().enterCommand("ping -n 70 10.10.30.12"); log("ping started"); }
if (DEMO_STEP === "off") { dev("CORE-1").setPower(false); log("CORE-1 power off: " + dev("CORE-1").getPower()); }
if (DEMO_STEP === "show") {
  var d = dev("CORE-2"); ensurePriv(d);
  log(run(d, "show standby brief"));
}
if (DEMO_STEP === "on") { dev("CORE-1").setPower(true); log("CORE-1 power on: " + dev("CORE-1").getPower()); }
flushLog("automation/logs/demo_failover_" + DEMO_STEP + ".log");
