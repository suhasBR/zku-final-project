// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.4;

import "./authVerifier.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Auth is Verifier,Ownable{
    //mapping between pubKey and pubHash
    mapping(address => uint) pubHashLookUp;

    //mapping to check if identity is email-verified
    mapping(string => bool) emailVerified;

    //commit public hash onchain
    function commitHash(address pubKey, uint hash) public onlyOwner{
        pubHashLookUp[pubKey] = hash;
    }

    //get public hash for an address
    function getPubHash(address pubKey)public view onlyOwner returns (uint d){
        return pubHashLookUp[pubKey];
    }

    //commit identity
    function commitIdentity(string memory commitment) public {
        emailVerified[commitment] = false;
    }

    //verify if email is verified for an identity
    function isAuthenticated(string memory commitment)public view returns(bool r){
        return emailVerified[commitment];
    }

    function verifyHash(
        uint[2] memory a,
        uint[2][2] memory b,
        uint[2] memory c,
        uint[3] memory input,
        address pubKey,
        string memory commitment
    ) public {

        //check if hash matches with onchain hash
        require(pubHashLookUp[pubKey] == input[0],"public hash stored does not match");

        bool check = verifyProof(a, b, c, input);

        if(check){
            // user is verified so update the mapping of identity
            emailVerified[commitment] = true;
        }
    }

}