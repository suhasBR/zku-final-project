pragma circom 2.0.0;

include "../circuits/node_modules/circomlib/circuits/poseidon.circom";
include "../circuits/node_modules/circomlib/circuits/comparators.circom";

template auth(){
    //public inputs
    signal input pubHash;
    signal input pubKey;
    signal input groupId;

    //private inputs
    signal input secret;
    signal input rString;

    //outputs
    signal output authFinalHash;

    var intermediateHash;

    //calculate hash of pubKey, secret and groupId
    component poseidon_r = Poseidon(3);
    poseidon_r.inputs[0] <== groupId;
    poseidon_r.inputs[1] <== pubKey;
    poseidon_r.inputs[2] <== secret;
    intermediateHash = poseidon_r.out;



    //calculate the Poseidon hash of the intermediateHash and rString
    component poseidon = Poseidon(2);
    poseidon.inputs[0] <== intermediateHash;
    poseidon.inputs[1] <== rString;

    authFinalHash <== poseidon.out;

    //compare the computed hash with the input public hash
    authFinalHash === pubHash;
}

component main {public[pubHash,pubKey,groupId]} = auth();