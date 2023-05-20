interface AgentNode {
    blue_agents: number;
    red_agents: number;
}

interface HyperParams {
    gamma: number;
    lambda: number;
    beta: number;
}

interface Universe {
    size: number;
    nodes: Node[];
    hyper_params: HyperParams;
    iterations: Number;
    total_size: Number;
}

