#!/bin/bash

cd circuits

mkdir auth

if [ -f ./powersOfTau28_hez_final_10.ptau ]; then
    echo "powersOfTau28_hez_final_10.ptau already exists. Skipping."
else
    echo 'Downloading powersOfTau28_hez_final_10.ptau'
    wget https://hermez.s3-eu-west-1.amazonaws.com/powersOfTau28_hez_final_10.ptau
fi

echo "Compiling auth.circom..."

# compile circuit

circom auth.circom --r1cs --wasm --sym -o auth
snarkjs r1cs info auth/auth.r1cs

# Start a new zkey and make a contribution

snarkjs groth16 setup auth/auth.r1cs powersOfTau28_hez_final_10.ptau auth/circuit_0000.zkey
snarkjs zkey contribute auth/circuit_0000.zkey auth/circuit_final.zkey --name="1st Contributor Name" -v -e="random text"
snarkjs zkey export verificationkey auth/circuit_final.zkey auth/verification_key.json

# generate solidity contract
snarkjs zkey export solidityverifier auth/circuit_final.zkey ../contracts/authVerifier.sol

cd ..