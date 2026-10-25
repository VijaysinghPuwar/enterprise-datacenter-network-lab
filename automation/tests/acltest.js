STREAMS = [
  {id: "D05-retest", src: "WEB-01", cmd: "ping -n 6 10.10.40.11", expect: "deny"},
  {id: "D04-retest", src: "APP-01", cmd: "ping -n 6 10.10.40.11", expect: "permit"},
  {id: "D02a", src: "NOC-PC", cmd: "ping -n 6 10.10.20.11", expect: "permit"}
];
TEST_TAG = "acltest";
