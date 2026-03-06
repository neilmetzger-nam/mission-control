# Infrastructure Reference

## Red Bar Sushi — 525 E Market St, Leesburg VA

### Raspberry Pi Print Server
| Field | Value |
|---|---|
| Hostname | air525market |
| Local IP | 192.168.1.74 |
| Tailscale IP | 100.68.30.87 |
| SSH User | air |
| SSH Password | Redbar2026$ |
| Print Server | http://100.68.30.87:3333/status |
| Restart command | sudo systemctl restart air-box |

### Tailscale Network
| Device | Tailscale IP | OS |
|---|---|---|
| Mac mini (home) | 100.101.120.24 | macOS |
| Pi (restaurant) | 100.68.30.87 | Linux |
| iPhone | 100.66.248.95 | iOS |
| Laptop | 100.127.86.107 | macOS (offline) |

### Square Terminals
| Terminal | Device ID | Status |
|---|---|---|
| Handheld 0346 | 516WS21606100346 | ✅ Active (Terminal API paired) |
| Handheld 0686 | 516WS21606100686 | ✅ Logged in (Terminal API pending) |
| S700 | TBD | 🛒 Order at dashboard.stripe.com/terminal/shop ($299) |

### Square Credentials
| Field | Value |
|---|---|
| Location ID | L4BMAT2DZWQP0 |
| Location Name | Sushi & Thai - Leesburg |

### Network
| Device | IP |
|---|---|
| Router | 192.168.1.1 (Verizon G3100) |
| Pi | 192.168.1.74 (static DHCP reservation) |
| Bar Printer | 192.168.1.172 (static DHCP reservation) |

### Dev Server
| Field | Value |
|---|---|
| Tailscale URL | http://neils-mac-mini.tail45495a.ts.net:3000 |
| AIR-Web port | 3001 |
| Mission Control port | 3002 |
