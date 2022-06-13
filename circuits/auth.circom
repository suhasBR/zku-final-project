pragma circom 2.0.0;

include "../circuits/node_modules/circomlib/circuits/poseidon.circom";

template auth(){
    //public inputs
    signal input pubHash;

    //private inputs
    signal input secret;
    signal input rString;

    signal output authHash;

    //calculate the Poseidon hash of the secret and rString
    component poseidon = Poseidon(2);
    poseidon.inputs[0] <== secret;
    poseidon.inputs[1] <== rString;

    authHash <== poseidon.out;
    pubHash === authHash;
}

component main {public[pubHash]} = auth();