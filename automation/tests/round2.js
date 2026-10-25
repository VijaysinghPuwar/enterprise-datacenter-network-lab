STREAMS = [
  {id: "D04a", src: "APP-01", cmd: "ping -n 6 10.10.40.11", expect: "permit"},
  {id: "D04b", src: "APP-02", cmd: "ping -n 6 10.10.40.12", expect: "permit"},
  {id: "D05",  src: "WEB-01", cmd: "ping -n 6 10.10.40.11", expect: "deny"},
  {id: "D05b", src: "WEB-02", cmd: "ping -n 6 10.10.40.12", expect: "deny"},
  {id: "D02a", src: "NOC-PC", cmd: "ping -n 6 10.10.20.11", expect: "permit"},
  {id: "X05-mgmt-to-db", src: "SVC-MON", cmd: "ping -n 6 10.10.40.11", expect: "permit"},
  {id: "X06-db-to-app-initiated", src: "DB-01", cmd: "ping -n 6 10.10.30.11", expect: "deny"},
  {id: "X07-db-no-internet-egress", src: "DB-02", cmd: "ping -n 6 203.0.113.10", expect: "deny"},
  {id: "X08-dmz-to-db", src: "DMZ-WEB", cmd: "ping -n 6 10.10.40.11", expect: "deny"},
  {id: "X09-services-to-app", src: "SVC-DNS", cmd: "ping -n 6 10.10.30.12", expect: "permit"}
];
TEST_TAG = "round2";
