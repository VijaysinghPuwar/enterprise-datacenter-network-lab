eval(ipc.systemFileManager().getFileContents("/Users/vijay_macbookm5/Desktop/GitHub/Projects/Network/automation/lib.js"));
var y = 640;
var tests = [[255,0,0],[0,255,0],[0,0,255]];
var ids = [];
for (var i = 0; i < 3; i++) { ids.push(LW.drawLine(20 + i * 60, 600, 70 + i * 60, 600, 4, tests[i][0], tests[i][1], tests[i][2], 255)); }
for (var i = 0; i < 3; i++) { ids.push(LW.drawLine(20 + i * 60, 615, 70 + i * 60, 615, tests[i][0], tests[i][1], tests[i][2], 255, 4)); }
writeFile("automation/logs/colortest_ids.txt", ids.join(","));
