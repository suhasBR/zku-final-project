pragma circom 2.0.0;

include "../circuits/node_modules/circomlib/circuits/poseidon.circom";
include "../circuits/node_modules/circomlib/circuits/comparators.circom";

template auth(){
    //public inputs
    signal input pubHash;
    signal input pubKey;

    //private inputs
    signal input secret;
    signal input rString;

    //outputs
    signal output authFinalHash;

    var rStringHash;

    //calculate hash of random string
    component poseidon_r = Poseidon(1);
    poseidon_r.inputs[0] <== rString;
    rStringHash = poseidon_r.out;



    //calculate the Poseidon hash of the pubKey, secret and hash(rString)
    component poseidon = Poseidon(3);
    poseidon.inputs[0] <== pubKey;
    poseidon.inputs[1] <== secret;
    poseidon.inputs[2] <== rStringHash;

    authFinalHash <== poseidon.out;

    //compare the computed hash with the input public hash
    authFinalHash === pubHash;
}

component main {public[pubHash,pubKey]} = auth();