// Ad-hoc show commands: SHOWS = [[device, command], ...]; output to automation/logs/showcheck_<tag>.log
eval(ipc.systemFileManager().getFileContents("/Users/vijay_macbookm5/Desktop/GitHub/Projects/Network/automation/lib.js"));
eval(readFile("automation/cli.js"));
for (var i = 0; i < SHOWS.length; i++) {
  var d = dev(SHOWS[i][0]); ensurePriv(d);
  log("### " + SHOWS[i][0] + "# " + SHOWS[i][1]);
  log(run(d, SHOWS[i][1]));
}
writeFile("lab-support/evidence/raw/tests/show_" + SHOW_CHECK_TAG + ".txt", LOG.join("\n") + "\n");
