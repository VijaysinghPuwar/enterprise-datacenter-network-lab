STREAMS = [
  {id: "D01-renew", src: "NOC-PC",  cmd: "ipconfig /renew", expect: "lease"},
  {id: "D04a", src: "APP-01",  cmd: "ping -n 4 10.10.40.11", expect: "permit"},
  {id: "D04b", src: "APP-02",  cmd: "ping -n 4 10.10.40.12", expect: "permit"},
  {id: "D05",  src: "WEB-01",  cmd: "ping -n 4 10.10.40.11", expect: "deny"},
  {id: "D11a", src: "DMZ-WEB", cmd: "ping -n 4 10.10.10.2",  expect: "deny"},
  {id: "D11b", src: "DMZ-DNS", cmd: "ping -n 4 10.255.0.2",  expect: "deny"},
  {id: "D12",  src: "INET-SRV",cmd: "ping -n 4 198.51.100.10", expect: "deny"},
  {id: "X01-inside-to-internet", src: "SVC-MON", cmd: "ping -n 4 203.0.113.10", expect: "permit"},
  {id: "X02-cross-rack-L2", src: "WEB-02", cmd: "ping -n 4 10.10.20.11", expect: "permit"},
  {id: "X03-db-to-services", src: "DB-02", cmd: "ping -n 4 10.10.50.10", expect: "permit"},
  {id: "X04-inside-to-dmz", src: "SVC-DNS", cmd: "ping -n 4 172.16.50.10", expect: "permit"}
];
TEST_TAG = "round1";
