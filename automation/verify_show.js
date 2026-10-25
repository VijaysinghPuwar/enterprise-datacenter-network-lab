// Captures operational state from every network device into lab-support/evidence/raw/
eval(ipc.systemFileManager().getFileContents("/Users/vijay_macbookm5/Desktop/GitHub/Projects/Network/automation/lib.js"));
eval(readFile("automation/cli.js"));
var IOS_CORE = ["show ip interface brief", "show vlan brief", "show interfaces trunk", "show etherchannel summary",
  "show standby brief", "show spanning-tree root", "show ip ospf neighbor", "show ip route", "show access-lists", "show ip ssh", "show ntp associations"];
var IOS_ACC = ["show ip interface brief", "show vlan brief", "show interfaces trunk", "show spanning-tree root", "show spanning-tree blockedports",
  "show port-security", "show ip dhcp snooping", "show ip ssh"];
var IOS_RTR = ["show ip interface brief", "show ip bgp summary", "show ip bgp", "show ip route"];
var ASA = ["show interface ip brief", "show route", "show ospf neighbor", "show nat", "show xlate", "show access-list", "show service-policy", "show running-config"];
var PLAN = {
  "CORE-1": IOS_CORE, "CORE-2": IOS_CORE, "ACC-1": IOS_ACC, "ACC-2": IOS_ACC, "DMZ-SW": IOS_ACC,
  "INET-R": IOS_RTR, "ISP1-R": IOS_RTR, "ISP2-R": IOS_RTR, "EDGE-R1": IOS_RTR, "FW-1": ASA
};
var tag = (typeof SHOW_TAG !== "undefined") ? SHOW_TAG : "baseline";
for (var name in PLAN) {
  var d = dev(name), out = [];
  if (!ensurePriv(d)) { log(name + " could not reach privileged mode, prompt '" + prompt(d) + "'"); }
  run(d, name === "FW-1" ? "terminal pager 0" : "terminal length 0");
  var cmds = PLAN[name];
  for (var i = 0; i < cmds.length; i++) {
    out.push("### " + name + "# " + cmds[i]);
    out.push(run(d, cmds[i]));
  }
  writeFile("lab-support/evidence/raw/" + tag + "/" + name + ".txt", out.join("\n") + "\n");
  log(name + " captured " + cmds.length + " commands");
}
flushLog("automation/logs/verify_show_" + tag + ".log");
