# Model for bacteria mixing in three-dimensions using random walker agents
This repository has the code to run a model of bacteria mixing in three-dimensions using random walker agents. The model is written in Rust and uses Atrix to run the server. The client is using the svelte framework to render the model.

## [SERVER] Running the model
To run the model, you need to have Rust installed. You can install Rust by following the instructions on the [Rust website](https://www.rust-lang.org/tools/install). Once you have Rust installed, you can run the model by running the following command in the terminal:
```
cargo watch -x run
```

This will start up a server on the port 8080. You can then open up a browser and go to the address `localhost:8080/cpu` to start up the model. It will return the begin configration of the model. 

## [SERVER] Endpoints
> WARNING: For now only the CPU endpoint is implemented. The GPU endpoint is still in development.

The server has two main endpoints

### GET `[2d|3d]`
- [ ] TODO
Get current state of the cpu model. State includes:
- `size`: NUMBER - The size of the model
- `agents`: [NUMBER, NUMBER] - The number of agents in the model
- `seed`: NUMBER - The seed used to generate the model
- `iteration`: NUMBER - Number of updates the model has gone through
- `params`: JSON - The parameters of the model
    - `gamma`: NUMBER - TODO
    - `lambda`: TODO
    - `beta`: TODO
- `nodes`: ARRAY[JSON] - A list of nodes where each node is defined by
    - `index`: NUMBER - The index of the node
    - `neighbours`: ARRAY[NUMBER] - The indices of the neighbours of the node
    - `grafitti`: [NUMBER, NUMBER]- The amount of red and blue grafitti in the node
    - `red_agents`: NUMBER - The number of red agents in the node
    - `blue_agents`: NUMBER - The number of blue agents in the node

### POST `[2d|3d]/setup/<size>/<agents>?seed=<NUMBER>`
- [ ] TODO

### POST `[2d|3d]/set_params?gamma=<NUMBER>&lambda=<NUMBER>&beta=<NUMBER>`
- [ ] TODO

### PATCH `[2d|3d]/iterate?amount=<NUMBER>`
- [ ] TODO


## [SERVER] Example sequence
```bash
# Create a 2d model with a size of 10x10 and 100 agents with a seed of 1234
POST localhost:8080/2d/10/100?seed=1234 

# Set the parameters of the model
POST localhost:8080/2d/set_params?beta=0.1

# Iterate the model 100 times
UPDATE localhost:8080/2d/iterate?amount=100

GET localhost:8080/2d
```