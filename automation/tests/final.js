STREAMS = [
  {id: "D02-noc-web01",     src: "NOC-PC",  cmd: "ping -n 8 10.10.20.11",  expect: "permit"},
  {id: "D04-app-db",        src: "APP-01",  cmd: "ping -n 8 10.10.40.12",  expect: "permit"},
  {id: "D05-web-db",        src: "WEB-01",  cmd: "ping -n 8 10.10.40.11",  expect: "deny"},
  {id: "X01-svc-internet",  src: "SVC-MON", cmd: "ping -n 8 203.0.113.10", expect: "permit"},
  {id: "X04-dmz-internet",  src: "DMZ-DNS", cmd: "ping -n 8 203.0.113.10", expect: "permit"},
  {id: "S9-db-db-L2",       src: "DB-01",   cmd: "ping -n 8 10.10.40.12",  expect: "permit"},
  {id: "D12-inet-pub-icmp", src: "INET-SRV",cmd: "ping -n 8 198.51.100.10",expect: "deny"},
  {id: "D11-dmz-mgmt",      src: "DMZ-WEB", cmd: "ping -n 8 10.10.10.2",   expect: "deny"},
  {id: "X09-web-app",       src: "WEB-02",  cmd: "ping -n 8 10.10.30.11",  expect: "permit"},
  {id: "X05-svc-db",        src: "SVC-DNS", cmd: "ping -n 8 10.10.40.11",  expect: "permit"},
  {id: "X07-db-no-internet",src: "DB-02",   cmd: "ping -n 8 203.0.113.10", expect: "deny"},
  {id: "X02-app-web",       src: "APP-02",  cmd: "ping -n 8 10.10.20.12",  expect: "permit"}
];
TEST_TAG = "final_acceptance";
