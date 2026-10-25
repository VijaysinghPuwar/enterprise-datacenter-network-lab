#!/usr/bin/env python3
"""Generate IOS/ASA paste files for topology-handoff.md. Does not operate PT."""
from pathlib import Path
import json
import ipaddress

ROOT = Path(__file__).resolve().parent
CFG = ROOT / 'configs'
LAB_PASSWORD = 'DcLabOnly2026!'
VLANS = {10: 'MGMT', 20: 'WEB', 30: 'APP', 40: 'DB', 50: 'SERVICES',
         99: 'NATIVE-UNUSED', 900: 'FW-TRANSIT', 999: 'BLACKHOLE'}
ACTIVE_ONE = {10, 30, 50, 900}
TRUNK = '10,20,30,40,50,99,900'
LINKS = [
 ('INET-R','GigabitEthernet0/0','ISP1-R','GigabitEthernet0/0'),
 ('INET-R','GigabitEthernet0/1','ISP2-R','GigabitEthernet0/0'),
 ('INET-R','GigabitEthernet0/2','INET-SRV','FastEthernet0'),
 ('ISP1-R','GigabitEthernet0/1','EDGE-R1','GigabitEthernet0/0/0'),
 ('ISP2-R','GigabitEthernet0/1','EDGE-R1','GigabitEthernet0/0/1'),
 ('EDGE-R1','GigabitEthernet0/0/2','FW-1','GigabitEthernet1/1'),
 ('FW-1','GigabitEthernet1/2','ACC-1','FastEthernet0/24'),
 ('FW-1','GigabitEthernet1/3','DMZ-SW','GigabitEthernet0/1'),
 ('CORE-1','GigabitEthernet0/1','CORE-2','GigabitEthernet0/1'),
 ('CORE-1','GigabitEthernet0/2','CORE-2','GigabitEthernet0/2'),
 ('CORE-1','FastEthernet0/1','ACC-1','GigabitEthernet0/1'),
 ('CORE-2','FastEthernet0/1','ACC-1','GigabitEthernet0/2'),
 ('CORE-1','FastEthernet0/2','ACC-2','GigabitEthernet0/1'),
 ('CORE-2','FastEthernet0/2','ACC-2','GigabitEthernet0/2'),
 ('ACC-1','FastEthernet0/1','WEB-01','FastEthernet0'),
 ('ACC-1','FastEthernet0/2','APP-01','FastEthernet0'),
 ('ACC-1','FastEthernet0/3','DB-01','FastEthernet0'),
 ('ACC-1','FastEthernet0/10','NOC-PC','FastEthernet0'),
 ('ACC-2','FastEthernet0/1','WEB-02','FastEthernet0'),
 ('ACC-2','FastEthernet0/2','APP-02','FastEthernet0'),
 ('ACC-2','FastEthernet0/3','DB-02','FastEthernet0'),
 ('ACC-2','FastEthernet0/5','SVC-DNS','FastEthernet0'),
 ('ACC-2','FastEthernet0/6','SVC-MON','FastEthernet0'),
 ('DMZ-SW','FastEthernet0/1','DMZ-WEB','FastEthernet0'),
 ('DMZ-SW','FastEthernet0/2','DMZ-DNS','FastEthernet0'),
 ('FW-1','GigabitEthernet1/4','ACC-2','FastEthernet0/24'),
]
HOSTS = []
for tier, vlan in [('WEB',20),('APP',30),('DB',40)]:
    for n in (1,2):
        HOSTS.append(dict(name=f'{tier}-0{n}', ip=f'10.10.{vlan}.{10+n}',
                          mask='255.255.255.0', gateway=f'10.10.{vlan}.1',
                          dns='10.10.50.10', vlan=vlan))
for name, ip, gateway, dns, vlan in [
 ('SVC-DNS','10.10.50.10','10.10.50.1','10.10.50.10',50),
 ('SVC-MON','10.10.50.20','10.10.50.1','10.10.50.10',50),
 ('DMZ-WEB','172.16.50.10','172.16.50.1','172.16.50.11',150),
 ('DMZ-DNS','172.16.50.11','172.16.50.1','172.16.50.11',150),
 ('INET-SRV','203.0.113.10','203.0.113.1','203.0.113.10',None)]:
    HOSTS.append(dict(name=name,ip=ip,mask='255.255.255.0',gateway=gateway,dns=dns,vlan=vlan))

def write(name, lines):
    (CFG / f'{name}.cfg').write_text('\n'.join(lines) + '\n')

def base(name, internal=False):
    lines = ['enable','configure terminal',f'hostname {name}',
             'no ip domain-lookup','ip domain-name dc1.lab',
             'service password-encryption', f'enable secret {LAB_PASSWORD}',
             f'username netadmin privilege 15 secret {LAB_PASSWORD}',
             'banner motd #AUTHORIZED SIMULATOR LAB ONLY#',
             'crypto key generate rsa general-keys modulus 1024',
             'ip ssh version 2','ip ssh time-out 60','ip ssh authentication-retries 2',
             'ip access-list standard MGMT-SSH',
             'permit 10.10.10.0 0.0.0.255','deny any','exit',
             'line console 0','logging synchronous','exec-timeout 15 0','login local','exit',
             'line vty 0 4','login local','transport input ssh',
             'access-class MGMT-SSH in','exec-timeout 10 0','exit']
    if internal:
        lines += ['service timestamps log datetime msec','logging 10.10.50.20',
                  'logging trap debugging','ntp server 10.10.50.20']
    return lines

def vlans(lines, numbers=VLANS):
    for number in numbers:
        lines += [f'vlan {number}',f'name {VLANS[number]}','exit']
    lines += ['vtp mode transparent','spanning-tree mode rapid-pvst']

def trunk(lines, port, allowed, multilayer=False):
    lines += [f'interface {port}']
    if multilayer:
        lines += ['switchport trunk encapsulation dot1q']
    lines += ['switchport mode trunk','switchport trunk native vlan 99',
              f'switchport trunk allowed vlan {allowed}', 'switchport nonegotiate',
              'no shutdown','exit']

def park(lines, ports):
    for port in ports:
        lines += [f'interface {port}','description UNUSED-PARKED',
                  'switchport mode access','switchport access vlan 999','shutdown','exit']

def endpoint(lines, port, vlan, name):
    lines += [f'interface {port}',f'description {name}', 'switchport mode access',
              f'switchport access vlan {vlan}','spanning-tree portfast',
              'spanning-tree bpduguard enable','switchport port-security',
              'switchport port-security maximum 2','switchport port-security mac-address sticky',
              'switchport port-security violation restrict','no shutdown','exit']

def core(n):
    name = f'CORE-{n}'
    lines=base(name, True)
    lines += ['ip routing']
    vlans(lines)
    for number in [10,20,30,50,900]:
        active = (number in ACTIVE_ONE) == (n == 1)
        prefix = f'10.10.{number}' if number != 900 else '10.255.0'
        mask = '255.255.255.0' if number != 900 else '255.255.255.248'
        lines += [f'interface Vlan{number}',f'description {VLANS[number]}',
                  f'ip address {prefix}.{n+1} {mask}','standby version 2',
                  f'standby {number} ip {prefix}.1',
                  f'standby {number} priority {110 if active else 100}',
                  f'standby {number} preempt',f'standby {number} timers 1 3','no shutdown']
        if n == 2 and number != 900:
            lines += ['ip ospf cost 100']
        if number == 900:
            lines += ['no ip proxy-arp','ip ospf hello-interval 1',
                      'ip ospf dead-interval 3']
        if number == 10:
            lines += ['ip helper-address 10.10.50.10']
        lines += ['exit',f'spanning-tree vlan {number} priority {4096 if active else 8192}']
    # VLAN40 is bridged to the ASA database zone; it has no core SVI or HSRP.
    lines += [f'spanning-tree vlan 40 priority {8192 if n == 1 else 4096}']
    for port in ['FastEthernet0/1','FastEthernet0/2']:
        trunk(lines,port,TRUNK,True)
    for port in ['GigabitEthernet0/1','GigabitEthernet0/2']:
        trunk(lines,port,TRUNK,True)
        lines += [f'interface {port}','channel-group 1 mode active','exit']
    trunk(lines,'Port-channel1',TRUNK,True)
    park(lines,[f'FastEthernet0/{p}' for p in range(3,25)])
    lines += ['interface Loopback0',f'ip address 10.255.255.{n} 255.255.255.255','exit',
              'router ospf 10',f'router-id 10.255.255.{n}', 'passive-interface default',
              'no passive-interface Vlan900','network 10.10.0.0 0.0.255.255 area 0',
              'network 10.255.0.0 0.0.0.7 area 0',
              f'network 10.255.255.{n} 0.0.0.0 area 0','exit',
              'end','write memory']
    write(name,lines)

def access(n):
    lines=base(f'ACC-{n}',True)
    vlans(lines,[10,20,30,40,50,99,900,999])
    lines += ['interface Vlan10',f'ip address 10.10.10.{10+n} 255.255.255.0',
              'no shutdown','exit','ip default-gateway 10.10.10.1',
              'ip dhcp snooping','ip dhcp snooping vlan 10',
              'no ip dhcp snooping information option']
    for port in ['GigabitEthernet0/1','GigabitEthernet0/2']:
        trunk(lines,port,TRUNK)
        lines += [f'interface {port}','ip dhcp snooping trust','exit']
    mapping={1:(20,f'WEB-0{n}'),2:(30,f'APP-0{n}'),3:(40,f'DB-0{n}')}
    mapping.update({10:(10,'NOC-PC')} if n==1 else {5:(50,'SVC-DNS'),6:(50,'SVC-MON')})
    for p,(v,name) in mapping.items():
        endpoint(lines,f'FastEthernet0/{p}',v,name)
    lines += ['interface FastEthernet0/24',f'description FW-1-{"INSIDE" if n == 1 else "DB-ZONE"}',
              'switchport mode access',f'switchport access vlan {900 if n == 1 else 40}',
              'spanning-tree portfast','no shutdown','exit']
    park(lines,[f'FastEthernet0/{p}' for p in range(1,24) if p not in mapping])
    lines += ['end','write memory']
    write(f'ACC-{n}',lines)

def dmz_switch():
    lines=base('DMZ-SW')
    lines += ['vtp mode transparent','spanning-tree mode rapid-pvst',
              'vlan 150','name DMZ','exit','vlan 999','name BLACKHOLE','exit',
              'interface Vlan150','ip address 172.16.50.5 255.255.255.0',
              'no shutdown','exit','ip default-gateway 172.16.50.1',
              'interface GigabitEthernet0/1','description FW-1-DMZ',
              'switchport mode access','switchport access vlan 150',
              'spanning-tree portfast','no shutdown','exit']
    endpoint(lines,'FastEthernet0/1',150,'DMZ-WEB')
    endpoint(lines,'FastEthernet0/2',150,'DMZ-DNS')
    park(lines,[f'FastEthernet0/{p}' for p in range(3,25)]+['GigabitEthernet0/2'])
    lines += ['end','write memory']
    write('DMZ-SW',lines)

def router(name, asn, interfaces, neighbors, networks, extra=()):
    lines=base(name)
    for port,addr,mask,description in interfaces:
        lines += [f'interface {port}',f'description {description}',
                  f'ip address {addr} {mask}','no shutdown','exit']
    lines += list(extra)
    lines += [f'router bgp {asn}','bgp log-neighbor-changes']
    for addr, remote_as in neighbors:
        lines += [f'neighbor {addr} remote-as {remote_as}']
    for net,mask in networks:
        lines += [f'network {net} mask {mask}']
    lines += ['exit','end','write memory']
    write(name,lines)

def asa():
    lines=['enable','configure terminal','hostname FW-1','domain-name dc1.lab',
           f'enable password {LAB_PASSWORD}',f'username netadmin password {LAB_PASSWORD}']
    for port,zone,sec,addr,mask in [
      ('GigabitEthernet1/1','outside',0,'198.51.100.2','255.255.255.248'),
      ('GigabitEthernet1/2','inside',100,'10.255.0.4','255.255.255.248'),
      ('GigabitEthernet1/3','dmz',50,'172.16.50.1','255.255.255.0'),
      ('GigabitEthernet1/4','db',90,'10.10.40.1','255.255.255.0')]:
        lines += [f'interface {port}',f'nameif {zone}',f'security-level {sec}',
                  f'ip address {addr} {mask}','no shutdown']
        if zone == 'inside':
            lines += ['ospf hello-interval 1','ospf dead-interval 3']
        lines += ['exit']
    for p in range(5,9):
        lines += [f'interface GigabitEthernet1/{p}','shutdown','exit']
    lines += ['route outside 0.0.0.0 0.0.0.0 198.51.100.1',
              'router ospf 10','router-id 10.255.255.4',
              'network 10.255.0.0 255.255.255.248 area 0',
              'network 10.10.40.0 255.255.255.0 area 0',
              'default-information originate','exit',
              'object network NAT-MGMT','subnet 10.10.10.0 255.255.255.0',
              'nat (inside,outside) dynamic interface','end','configure terminal',
              'object network NAT-WEB','subnet 10.10.20.0 255.255.255.0',
              'nat (inside,outside) dynamic interface','end','configure terminal',
              'object network NAT-APP','subnet 10.10.30.0 255.255.255.0',
              'nat (inside,outside) dynamic interface','end','configure terminal',
              'object network NAT-SVC','subnet 10.10.50.0 255.255.255.0',
              'nat (inside,outside) dynamic interface','end','configure terminal',
              'object network DMZ-WEB','host 172.16.50.10',
              'nat (dmz,outside) static 198.51.100.10','end','configure terminal',
              'object network DMZ-DNS','host 172.16.50.11',
              'nat (dmz,outside) static 198.51.100.11','end','configure terminal',
              'access-list OUTSIDE_IN extended permit tcp any host 172.16.50.10 eq 80',
              'access-list OUTSIDE_IN extended permit tcp any host 172.16.50.10 eq 443',
              'access-list OUTSIDE_IN extended permit udp any host 172.16.50.11 eq 53',
              'access-list OUTSIDE_IN extended permit tcp any host 172.16.50.11 eq 53',
              'access-list OUTSIDE_IN extended permit icmp any 10.10.0.0 255.255.0.0 echo-reply',
              'access-list OUTSIDE_IN extended permit icmp any 172.16.50.0 255.255.255.0 echo-reply',
              'access-group OUTSIDE_IN in interface outside',
              'access-list DMZ_IN extended permit icmp 172.16.50.0 255.255.255.0 10.10.0.0 255.255.0.0 echo-reply',
              'access-list DMZ_IN extended permit udp 172.16.50.0 255.255.255.0 host 10.10.50.20 eq 514',
              'access-list DMZ_IN extended deny ip 172.16.50.0 255.255.255.0 10.10.0.0 255.255.0.0',
              'access-list DMZ_IN extended deny ip 172.16.50.0 255.255.255.0 10.255.0.0 255.255.0.0',
              'access-list DMZ_IN extended permit ip 172.16.50.0 255.255.255.0 any',
              'access-group DMZ_IN in interface dmz',
              'access-list INSIDE_IN extended permit ip 10.10.30.0 255.255.255.0 10.10.40.0 255.255.255.0',
              'access-list INSIDE_IN extended permit ip 10.10.10.0 255.255.255.0 10.10.40.0 255.255.255.0',
              'access-list INSIDE_IN extended permit ip 10.10.50.0 255.255.255.0 10.10.40.0 255.255.255.0',
              'access-list INSIDE_IN extended deny ip any 10.10.40.0 255.255.255.0',
              'access-list INSIDE_IN extended permit ip any any',
              'access-group INSIDE_IN in interface inside',
              'access-list DB_IN extended permit icmp 10.10.40.0 255.255.255.0 any echo-reply',
              'access-list DB_IN extended permit udp 10.10.40.0 255.255.255.0 host 10.10.50.10 eq 53',
              'access-list DB_IN extended permit udp 10.10.40.0 255.255.255.0 host 10.10.50.20 eq 514',
              'access-list DB_IN extended permit udp 10.10.40.0 255.255.255.0 host 10.10.50.20 eq 123',
              'access-list DB_IN extended deny ip 10.10.40.0 255.255.255.0 any',
              'access-group DB_IN in interface db',
              'class-map inspection_default','match default-inspection-traffic','end','configure terminal',
              'policy-map global_policy','class inspection_default','inspect icmp',
              'inspect dns','inspect http','end','configure terminal','service-policy global_policy global',
              'aaa authentication ssh console LOCAL','ssh 10.10.10.0 255.255.255.0 inside',
              'ssh timeout 10','crypto key generate rsa modulus 1024',
              'ntp server 10.10.50.20','end','write memory']
    write('FW-1',lines)

def generate():
    CFG.mkdir(parents=True,exist_ok=True)
    for n in (1,2):
        core(n); access(n)
    dmz_switch(); asa()
    mask='255.255.255.252'
    router('INET-R',64500,[('GigabitEthernet0/0','100.64.0.1',mask,'ISP1-R'),
         ('GigabitEthernet0/1','100.64.0.5',mask,'ISP2-R'),
         ('GigabitEthernet0/2','203.0.113.1','255.255.255.0','INET-SRV')],
         [('100.64.0.2',64501),('100.64.0.6',64502)],[('203.0.113.0','255.255.255.0')])
    for n,addr,peer in [(1,'100.64.0.2','100.64.0.1'),(2,'100.64.0.6','100.64.0.5')]:
        router(f'ISP{n}-R',64500+n,[('GigabitEthernet0/0',addr,mask,'INET-R'),
             ('GigabitEthernet0/1',f'100.64.{n}.1',mask,'EDGE-R1')],
             [(peer,64500),(f'100.64.{n}.2',65010)],[])
    router('EDGE-R1',65010,[('GigabitEthernet0/0/0','100.64.1.2',mask,'ISP1-R'),
           ('GigabitEthernet0/0/1','100.64.2.2',mask,'ISP2-R'),
           ('GigabitEthernet0/0/2','198.51.100.1','255.255.255.248','FW-1-OUTSIDE')],
           [('100.64.1.1',64501),('100.64.2.1',64502)],[('198.51.100.0','255.255.255.0')],
           ['ip route 198.51.100.0 255.255.255.0 198.51.100.2',
            'ip route 0.0.0.0 0.0.0.0 100.64.1.1',
            'ip route 0.0.0.0 0.0.0.0 100.64.2.1 250'])
    manifest=dict(status='CONFIGURATION SOURCE - not proof of PT installation',
                  hosts=HOSTS,links=[dict(id=f'L{i}',a=a,port_a=pa,b=b,port_b=pb)
                                     for i,(a,pa,b,pb) in enumerate(LINKS,1)])
    (ROOT/'lab-manifest.json').write_text(json.dumps(manifest,indent=2)+'\n')
    print(f'Generated {len(list(CFG.glob("*.cfg")))} configurations, {len(HOSTS)} static hosts, {len(LINKS)} links.')

if __name__ == '__main__':
    generate()
