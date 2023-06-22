import seedrandom, { type PRNG } from 'seedrandom';
import type { HyperParameters } from './vision/gpuStore';

function random(prng: PRNG, min: number, max: number): number {
    return Math.floor(prng.quick() * (max - min) + min);
}

export class Node {
    constructor(
        public red_agents: number,
        public blue_agents: number,
        public red_graffiti: number,
        public blue_graffiti: number,
        public red_strength: number,
        public blue_strength: number
    ) { }

    clone(): Node {
        return new Node(
            this.red_agents,
            this.blue_agents,
            this.red_graffiti,
            this.blue_graffiti,
            this.red_strength,
            this.blue_strength
        );
    }
}

interface ToF32Buffer {
    to_f32_buffer(): Float32Array;
}

export class Universe implements ToF32Buffer {
    nodes: Node[] = [];
    total_size: number;

    constructor(public size: number, public total_agents: number, public dimensions: number, public seed: number) {
        let prng = seedrandom((seed).toString() + dimensions.toString() + size.toString() + total_agents.toString());
        this.total_size = Math.pow(size, dimensions);

        let agents_per_node = Math.floor(total_agents / this.total_size);

        // Create nodes
        for (let i = 0; i < this.total_size; i++) {
            let node = new Node(agents_per_node, agents_per_node, 0, 0, 0, 0);
            this.nodes.push(node);
        }

        // console.log("Creating universe with " + this.total_size + " nodes");

        // Add red agents to random nodes
        for (let ar = 0; ar < total_agents - (agents_per_node * this.total_size); ar++) {
            let node = random(prng, 0, this.total_size);
            this.nodes[node].red_agents++;
        }

        // Add blue agents to random nodes
        for (let ab = 0; ab < total_agents - (agents_per_node * this.total_size); ab++) {
            let node = random(prng, 0, this.total_size);
            this.nodes[node].blue_agents++;
        }
    }

    to_f32_buffer(): Float32Array {
        let buffer = new Float32Array(this.nodes.length * 6);
        for (let i = 0; i < this.nodes.length; i++) {
            let node = this.nodes[i];
            buffer[i * 6 + 0] = node.red_agents;
            buffer[i * 6 + 1] = node.blue_agents;
            buffer[i * 6 + 2] = node.red_graffiti;
            buffer[i * 6 + 3] = node.blue_graffiti;
            buffer[i * 6 + 4] = node.red_strength;
            buffer[i * 6 + 5] = node.blue_strength;
        }
        // console.log(buffer);
        return buffer;
    }

    clone(): Universe {
        let universe = new Universe(this.size, 0, this.dimensions, this.seed);

        universe.nodes = this.nodes.map(n => n.clone())

        return universe;
    }

    isChanged(hyperparameters: HyperParameters): boolean {
        if (hyperparameters.size !== this.size) return true;
        if (hyperparameters.total_agents !== this.total_agents) return true;
        if (hyperparameters.seed !== this.seed) return true;

        return false;
    }

    static from_result(result: Float32Array, size: number, dimensions: number, seed: number): Universe {
        let universe = new Universe(size, 0, dimensions, seed);

        for (let i = 0; i < universe.nodes.length; i++) {
            let node = universe.nodes[i];
            node.red_agents = result[i * 6 + 0];
            node.blue_agents = result[i * 6 + 1];
            node.red_graffiti = result[i * 6 + 2];
            node.blue_graffiti = result[i * 6 + 3];
            node.red_strength = result[i * 6 + 4];
            node.blue_strength = result[i * 6 + 5];
        }

        return universe;
    }
}