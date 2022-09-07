/*
 * Copyright (c) 2022 by Fred George
 * @author Fred George  fredgeorge@acm.org
 * Licensed under the MIT License; see LICENSE file in root.
 */

import {Rules} from "../validation/rules";
import {RapidsConnection, MessageListener, Service} from "../rapids/rapids_connection";
import {Packet} from "../packets/packet";
import {Status} from "../validation/status";

export class River implements MessageListener {
    listeners: Service[] = []
    systemListeners: Service[] = []
    rules: Rules

    constructor(connection: RapidsConnection, rules: Rules, maxReadCount: number) {
        this.rules = rules;
    }

    message(connection: RapidsConnection, message: string): void {
        let packet = new Packet(message);
        let status = packet.evaluate(this.rules);
        if (status.hasErrors()) this.triggerRejectedPacket(this.listeners, connection, packet, status)
        else this.triggerAccceptedPacket(this.listeners, connection, packet, status)
    }

    register(service: Service) {
        this.listeners.push(service)
    }

    triggerAccceptedPacket(services: Service[], connection: RapidsConnection, packet: Packet, information: Status) {
        services.forEach(s => s.packet(connection, packet, information))
    }

    triggerRejectedPacket(services: Service[], connection: RapidsConnection, packet: Packet, problems: Status) {
        services.forEach(s => s.rejectedPacket(connection, packet, problems))
    }

}