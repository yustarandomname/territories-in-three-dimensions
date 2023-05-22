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
    nodes: AgentNode[];
    hyper_params: HyperParams;
    iteration: Number;
    total_size: Number;
}

