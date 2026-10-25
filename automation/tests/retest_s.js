STREAMS = [
  {id: "S9-retest", src: "DB-01", cmd: "ping -n 6 10.10.40.12", expect: "permit"},
  {id: "S5-retest", src: "SVC-MON", cmd: "ping -n 6 203.0.113.10", expect: "permit"},
  {id: "S7-retest", src: "DMZ-DNS", cmd: "ping -n 6 203.0.113.10", expect: "permit"},
  {id: "S1-check", src: "NOC-PC", cmd: "ping -n 6 203.0.113.10", expect: "permit"}
];
TEST_TAG = "retest_s";
