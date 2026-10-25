STREAMS = [
  {id: "D07-ssh-from-untrusted", src: "WEB-01", cmd: "ssh -l netadmin 10.10.10.11", expect: "info"},
  {id: "D10-public-dns", src: "INET-SRV", cmd: "nslookup www.dc1-corp.com 198.51.100.11", expect: "info"},
  {id: "D03-internal-dns", src: "SVC-MON", cmd: "nslookup web.dc1.lab", expect: "info"},
  {id: "X10-tracert-internet", src: "APP-02", cmd: "tracert 203.0.113.10", expect: "info"},
  {id: "X11-tracert-db", src: "APP-01", cmd: "tracert 10.10.40.12", expect: "info"},
  {id: "D02b", src: "WEB-02", cmd: "ping -n 4 10.10.50.20", expect: "permit"},
  {id: "D06-ssh-core1", src: "NOC-PC", cmd: "ssh -l netadmin 10.10.10.2", expect: "info"}
];
TEST_TAG = "round3";
