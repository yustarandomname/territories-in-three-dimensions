interface AgentNode {
    blue: number;
    red: number;
}

interface GraffitiNode {
    blue: number;
    red: number;
}

interface HyperParams {
    gamma: number;
    lambda: number;
    beta: number;
}

interface Universe {
    size: number;
    nodes: (GraffitiNode | AgentNode)[];
    hyper_params: HyperParams;
    iteration: Number;
    total_size: Number;
}

