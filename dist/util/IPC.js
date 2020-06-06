"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IPC = void 0;
const events_1 = require("events");
class IPC extends events_1.EventEmitter {
    constructor() {
        super();
        this.events = new Map();
        this.commandUUID = [];
        process.on('message', msg => {
            const event = this.events.get(msg.op);
            if (event) {
                event.fn(msg);
            }
        });
    }
    register(event, callback) {
        if (this.events.get(event)) {
            //@ts-ignore
            process.send({ op: "error", msg: "IPC | Can't register 2 events with the same name." });
        }
        else {
            this.events.set(event, { fn: callback });
        }
    }
    unregister(event) {
        this.events.delete(event);
    }
    broadcast(op, message) {
        if (!message)
            message = null;
        //@ts-ignore
        process.send({ op: "broadcast", event: { op, msg: message } });
    }
    sendTo(cluster, op, message) {
        if (!message)
            message = null;
        //@ts-ignore
        process.send({ op: "sendTo", cluster: cluster, event: { msg: message, op } });
    }
    async fetchUser(id) {
        //@ts-ignore
        process.send({ op: "fetchUser", id });
        return new Promise((resolve, reject) => {
            const callback = (r) => {
                //@ts-ignore
                this.removeListener(id, callback);
                resolve(r);
            };
            //@ts-ignore
            this.on(id, callback);
        });
    }
    async fetchGuild(id) {
        //@ts-ignore
        process.send({ op: "fetchGuild", id });
        return new Promise((resolve, reject) => {
            const callback = (r) => {
                //@ts-ignore
                this.removeListener(id, callback);
                resolve(r);
            };
            //@ts-ignore
            this.on(id, callback);
        });
    }
    async fetchChannel(id) {
        //@ts-ignore
        process.send({ op: "fetchChannel", id });
        return new Promise((resolve, reject) => {
            const callback = (r) => {
                //@ts-ignore
                this.removeListener(id, callback);
                resolve(r);
            };
            //@ts-ignore
            this.on(id, callback);
        });
    }
    async fetchMember(guildID, memberID) {
        //@ts-ignore
        process.send({ op: "fetchMember", guildID, memberID });
        return new Promise((resolve, reject) => {
            const callback = (r) => {
                //@ts-ignore
                this.removeListener(memberID, callback);
                resolve(r);
            };
            //@ts-ignore
            this.on(memberID, callback);
        });
    }
    async command(service, message, receptive) {
        if (!message)
            message = null;
        if (!receptive)
            receptive = false;
        const UUID = this.commandUUID.push({ service, timeout: Date.now() + this.fetchTimeout }) - 1;
        //this.commandUUID.set(UUID, service);
        //@ts-ignore
        process.send({ op: "serviceCommand",
            command: {
                service,
                msg: message,
                UUID,
                receptive
            }
        });
        if (receptive) {
            return new Promise((resolve, reject) => {
                const callback = (r) => {
                    this.commandUUID[UUID] = null;
                    // Clean out callbacks which have expired
                    this.commandUUID.forEach((e, i) => {
                        if (e)
                            if (e.timeout < Date.now()) {
                                this.commandUUID[i] = null;
                            }
                    });
                    // Clean callback array if there are none in progress
                    if (this.commandUUID.every(e => e == null))
                        this.commandUUID = [];
                    //@ts-ignore
                    this.removeListener(String(UUID), callback);
                    if (r.err) {
                        reject(r.err);
                    }
                    else {
                        resolve(r.value);
                    }
                };
                this.on(String(UUID), callback);
            });
        }
    }
    async getStats() {
        //@ts-ignore
        process.send({ op: "getStats" });
        return new Promise((resolve, reject) => {
            const callback = (r) => {
                //@ts-ignore
                this.removeListener("statsReturn", callback);
                resolve(r);
            };
            //@ts-ignore
            this.on("statsReturn", callback);
        });
    }
    restartCluster(clusterID, hard) {
        //@ts-ignore
        process.send({ op: "restartCluster", clusterID, hard: hard ? true : false });
    }
    restartAllClusters(hard) {
        //@ts-ignore
        process.send({ op: "restartAllClusters", hard: hard ? true : false });
    }
    restartService(serviceName, hard) {
        //@ts-ignore
        process.send({ op: "restartService", serviceName, hard: hard ? true : false });
    }
    restartAllServices(hard) {
        //@ts-ignore
        process.send({ op: "restartAllServices", hard: hard ? true : false });
    }
    shutdownCluster(clusterID, hard) {
        //@ts-ignore
        process.send({ op: "shutdownCluster", clusterID, hard: hard ? true : false });
    }
    shutdownService(serviceName, hard) {
        //@ts-ignore
        process.send({ op: "shutdownService", serviceName, hard: hard ? true : false });
    }
    /** Total shutdown of fleet */
    totalShutdown(hard) {
        //@ts-ignore
        process.send({ op: "totalShutdown", hard: hard ? true : false });
    }
}
exports.IPC = IPC;
//# sourceMappingURL=IPC.js.map