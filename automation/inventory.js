eval(ipc.systemFileManager().getFileContents("/Users/vijay_macbookm5/Desktop/GitHub/Projects/Network/automation/lib.js"));
for (var i = 0; i < NET.getDeviceCount(); i++) {
  var d = NET.getDeviceAt(i);
  log(i + ": " + d.getName() + " | model " + d.getModel() + " | type " + d.getType() + " | x " + d.getXCoordinate() + " y " + d.getYCoordinate());
}
flushLog("automation/logs/inventory.log");
