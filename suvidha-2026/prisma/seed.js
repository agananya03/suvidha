import { config } from 'dotenv';
config({ path: '.env.local' });

"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function () { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function () { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var dotenv_1 = require("dotenv");
(0, dotenv_1.config)({ path: '.env.local' });
console.log("DB URL from ENV:", process.env.DATABASE_URL ? "Exists" : "MISSING");
var client_1 = require("@prisma/client");
var prisma = new client_1.PrismaClient({
    datasourceUrl: process.env.DATABASE_URL
});
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var user, connElectricity, connGas, connWater, connTax, c1, c2, c3, c4, c5;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log('Seeding SUVIDHA 2026 database...');
                    // Clean existing data for idempotency
                    return [4 /*yield*/, prisma.queueEntry.deleteMany()];
                case 1:
                    // Clean existing data for idempotency
                    _a.sent();
                    return [4 /*yield*/, prisma.paymentRecord.deleteMany()];
                case 2:
                    _a.sent();
                    return [4 /*yield*/, prisma.complaint.deleteMany()];
                case 3:
                    _a.sent();
                    return [4 /*yield*/, prisma.connection.deleteMany()];
                case 4:
                    _a.sent();
                    return [4 /*yield*/, prisma.documentToken.deleteMany()];
                case 5:
                    _a.sent();
                    return [4 /*yield*/, prisma.oTPSession.deleteMany()];
                case 6:
                    _a.sent();
                    return [4 /*yield*/, prisma.user.deleteMany()
                        // 1. Create exact demo User
                    ];
                case 7:
                    _a.sent();
                    return [4 /*yield*/, prisma.user.create({
                        data: {
                            mobile: '9876543210',
                            name: 'Ramesh Kumar',
                            address: '12, Civil Lines, Nagpur, Maharashtra 440001',
                            preferredLanguage: 'en',
                        },
                    })
                        // 2. Create 4 Connections for the user
                    ];
                case 8:
                    user = _a.sent();
                    return [4 /*yield*/, prisma.connection.create({
                        data: {
                            userId: user.id,
                            type: client_1.ConnectionType.ELECTRICITY,
                            provider: 'MSEDCL',
                            consumerNumber: 'MH-NP-2024-001247',
                            address: '12, Civil Lines, Nagpur, Maharashtra 440001',
                            outstandingAmt: 1247.50, // triggers anomaly detection as it's > 2x lastBillAmt
                            lastBillAmt: 540.00,
                        },
                    })];
                case 9:
                    connElectricity = _a.sent();
                    return [4 /*yield*/, prisma.connection.create({
                        data: {
                            userId: user.id,
                            type: client_1.ConnectionType.GAS,
                            provider: 'Mahanagar Gas',
                            consumerNumber: 'MGL-NGP-88431',
                            address: '12, Civil Lines, Nagpur, Maharashtra 440001',
                            outstandingAmt: 340.00,
                            lastBillAmt: 315.00,
                        },
                    })];
                case 10:
                    connGas = _a.sent();
                    return [4 /*yield*/, prisma.connection.create({
                        data: {
                            userId: user.id,
                            type: client_1.ConnectionType.WATER,
                            provider: 'NMC Water Supply',
                            consumerNumber: 'NMC-W-2024-5521',
                            address: '12, Civil Lines, Nagpur, Maharashtra 440001',
                            outstandingAmt: 89.00,
                            lastBillAmt: 89.00,
                        },
                    })];
                case 11:
                    connWater = _a.sent();
                    return [4 /*yield*/, prisma.connection.create({
                        data: {
                            userId: user.id,
                            type: client_1.ConnectionType.PROPERTY_TAX,
                            provider: 'Nagpur Municipal Corporation',
                            consumerNumber: 'NMC-PT-2024-007',
                            address: '12, Civil Lines, Nagpur, Maharashtra 440001',
                            outstandingAmt: 4200.00,
                            lastBillAmt: 4200.00,
                        },
                    })
                        // 3. Create 5 Complaints
                    ];
                case 12:
                    connTax = _a.sent();
                    return [4 /*yield*/, prisma.complaint.create({
                        data: {
                            ticketId: 'SUVDH-2026-00047',
                            userId: user.id,
                            type: 'STREET_LIGHT',
                            description: 'Street light not working near house for 3 days',
                            department: 'MULTI',
                            secondaryDepartment: 'ELECTRICITY',
                            status: client_1.ComplaintStatus.PENDING,
                            priority: 7,
                            queuePosition: 47,
                            queueEntry: {
                                create: {
                                    departmentQueue: 'MULTI',
                                    position: 47,
                                    estimatedResolutionDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days
                                },
                            },
                        },
                    })];
                case 13:
                    c1 = _a.sent();
                    return [4 /*yield*/, prisma.complaint.create({
                        data: {
                            ticketId: 'SUVDH-2026-00048',
                            userId: user.id,
                            type: 'WATER_LEAK',
                            description: 'Water pipe leak',
                            department: 'MUNICIPAL',
                            status: client_1.ComplaintStatus.IN_PROGRESS,
                            priority: 8,
                            queuePosition: 12,
                            queueEntry: {
                                create: {
                                    departmentQueue: 'MUNICIPAL',
                                    position: 12,
                                    estimatedResolutionDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // 1 day
                                },
                            },
                        },
                    })];
                case 14:
                    c2 = _a.sent();
                    return [4 /*yield*/, prisma.complaint.create({
                        data: {
                            ticketId: 'SUVDH-2026-00049',
                            userId: user.id,
                            type: 'METER_ISSUE',
                            description: 'Electricity meter issue',
                            department: 'ELECTRICITY',
                            status: client_1.ComplaintStatus.RESOLVED,
                            priority: 5,
                            resolvedAt: new Date(),
                        },
                    })];
                case 15:
                    c3 = _a.sent();
                    return [4 /*yield*/, prisma.complaint.create({
                        data: {
                            ticketId: 'SUVDH-2026-00050',
                            userId: user.id,
                            type: 'GAS_DELAY',
                            description: 'Gas connection delay',
                            department: 'GAS',
                            status: client_1.ComplaintStatus.ESCALATED,
                            priority: 9,
                            queueEntry: {
                                create: {
                                    departmentQueue: 'GAS',
                                    position: 1,
                                    estimatedResolutionDate: new Date(Date.now() + 12 * 60 * 60 * 1000), // 12 hours
                                    isEscalated: true,
                                    escalatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // escalated 1 day ago
                                },
                            },
                        },
                    })];
                case 16:
                    c4 = _a.sent();
                    return [4 /*yield*/, prisma.complaint.create({
                        data: {
                            ticketId: 'SUVDH-2026-00051',
                            userId: user.id,
                            type: 'GENERAL',
                            description: 'General inquiry request',
                            department: 'ELECTRICITY',
                            status: client_1.ComplaintStatus.PENDING,
                            priority: 5,
                            queuePosition: 89,
                            queueEntry: {
                                create: {
                                    departmentQueue: 'ELECTRICITY',
                                    position: 89,
                                    estimatedResolutionDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days
                                },
                            },
                        },
                    })
                        // 4. Create 3 DocumentTokens
                    ];
                case 17:
                    c5 = _a.sent();
                    // 4. Create 3 DocumentTokens
                    return [4 /*yield*/, prisma.documentToken.create({
                        data: {
                            token: 'A7X3K9',
                            mobile: '9876543210',
                            expiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000), // valid +48h
                            autoDeleteAt: new Date(Date.now() + 48 * 60 * 60 * 1000),
                            used: false,
                        },
                    })];
                case 18:
                    // 4. Create 3 DocumentTokens
                    _a.sent();
                    return [4 /*yield*/, prisma.documentToken.create({
                        data: {
                            token: 'EXPD01',
                            mobile: '9876543210',
                            expiresAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // expired 24h ago
                            autoDeleteAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
                            used: false,
                        },
                    })];
                case 19:
                    _a.sent();
                    return [4 /*yield*/, prisma.documentToken.create({
                        data: {
                            token: 'USED02',
                            mobile: '9876543210',
                            expiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000),
                            autoDeleteAt: new Date(Date.now() + 48 * 60 * 60 * 1000),
                            used: true,
                            usedAt: new Date(),
                        },
                    })];
                case 20:
                    _a.sent();
                    console.log('Seeding completed successfully!');
                    return [2 /*return*/];
            }
        });
    });
}
main()
    .catch(function (e) {
        console.error(e);
        process.exit(1);
    })
    .finally(function () {
        return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, prisma.$disconnect()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    });
