STREAMS = [
  {id: "a1", src: "APP-01", cmd: "arp -d", expect: "info"}, {id: "a2", src: "SVC-MON", cmd: "arp -d", expect: "info"},
  {id: "a3", src: "NOC-PC", cmd: "arp -d", expect: "info"}, {id: "a4", src: "SVC-DNS", cmd: "arp -d", expect: "info"},
  {id: "a5", src: "DB-01", cmd: "arp -d", expect: "info"}, {id: "a6", src: "DB-02", cmd: "arp -d", expect: "info"}
];
TEST_TAG = "arpclear4";
