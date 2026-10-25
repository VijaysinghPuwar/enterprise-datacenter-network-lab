STREAMS = [
  {id: "db01-arp", src: "DB-01", cmd: "arp -a", expect: "info"},
  {id: "db01-ipcfg", src: "DB-01", cmd: "ipconfig", expect: "info"},
  {id: "db02-ipcfg", src: "DB-02", cmd: "ipconfig", expect: "info"}
];
TEST_TAG = "s0diag";
