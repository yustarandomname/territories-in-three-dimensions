# Model for bacteria mixing in three-dimensions using random walker agents
This repository has the code to run a model of bacteria mixing in three-dimensions using random walker agents. The model is written in Rust and uses Atrix to run the server. The client is using the svelte framework to render the model.

## [SERVER] Running the model
To run the model, you need to have Rust installed. You can install Rust by following the instructions on the [Rust website](https://www.rust-lang.org/tools/install). Once you have Rust installed, you can run the model by running the following command in the terminal:
```
cd server
cargo watch -x run
```

This will start up a server on the port 8080. You can then open up a browser and go to the address `localhost:8080/2d` to see the state of the model. 

---

## [SERVER] Endpoints
> WARNING: For now only the CPU endpoint is implemented. The GPU endpoint is still in development.

The server has two main endpoints

### GET `[1d|2d|3d]`
Get current state of the model as JSON Object. State includes:
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

### GET `[1d|2d|3d]/agent-nodes`
Get current state of the model as JSON Object. Is identical to the `GET [1d|2d|3d]` endpoint except that the `nodes` field is a list of agent nodes instead of nodes. Agent nodes are defined by:
- `nodes`: [{agents_red: NUMBER, agents_blue: NUMBER}]

### POST `[1d|2d|3d]/setup/<size>/<agents>?seed=<NUMBER>`
Setup the model with a lattice size of `<size>x<size>` for 2d and `<size>x<size>x<size>` for 3d and `<agents>` agents. The seed is optional and will default to 100 if not provided.
- `size`: NUMBER - The size of the lattice
- `agents`: NUMBER - The number of agents in the model for each species
- `seed?`: NUMBER - The seed used to generate the model

### POST `[1d|2d|3d]/set_params?gamma=<NUMBER>&lambda=<NUMBER>&beta=<NUMBER>`
Set the parameters of the model
- `gamma`: NUMBER - TODO
- `lambda`: TODO
- `beta`: TODO

---

### PATCH `[1d|2d|3d]/iterate?amount=<NUMBER>`
Iterate the model `<amount>` times

## [SERVER] Example sequence
```bash
# Create a 2d model with a size of 10x10 and 100 agents with a seed of 1234
POST localhost:8080/2d/10/100?seed=1234 

# Set the parameters of the model
POST localhost:8080/2d/set_params?beta=0.1

# Iterate the model 100 times
UPDATE localhost:8080/2d/iterate?amount=100

# Get the current state of the model as a json object 
GET localhost:8080/2d
```