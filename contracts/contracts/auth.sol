// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.4;

import "./authVerifier.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@semaphore-protocol/contracts/interfaces/ISemaphore.sol";
import "@semaphore-protocol/contracts/base/SemaphoreCore.sol";
import "@semaphore-protocol/contracts/base/SemaphoreGroups.sol";

contract Auth is Verifier,Ownable,SemaphoreCore,SemaphoreGroups{
    //mapping between pubKey and pubHash
    mapping(address => uint) pubHashLookUp;

    //mapping to check if identity is email-verified
    mapping(string => uint) emailVerified;

    //mapping to store groupId and domain name
    mapping(string => uint) public domainLookUp;

    //commit public hash onchain
    function commitHash(address pubKey, uint hash) public onlyOwner{
        pubHashLookUp[pubKey] = hash;
    }


    //create group using Semaphore
    function createGroup(
        string memory domain,
        uint256 groupId,
        uint8 depth,
        uint256 zeroValue,
        address admin
    ) public{
        require(domainLookUp[domain] == 0, "Group for this domain already exists");
        domainLookUp[domain] = groupId;
        _createGroup(groupId, depth, zeroValue);
    }

    //get public hash for an address
    function getPubHash(address pubKey)public view onlyOwner returns (uint d){
        return pubHashLookUp[pubKey];
    }

    //commit identity
    function commitIdentity(string memory commitment) public {
        emailVerified[commitment] = 0;
    }

    //verify if email is verified for an identity
    function isAuthenticated(string memory commitment)public view returns(uint r){
        return emailVerified[commitment];
    }

    function verifyHash(
        uint[2] memory a,
        uint[2][2] memory b,
        uint[2] memory c,
        uint[4] memory input,
        address pubKey,
        uint256 commitment
    ) public {

        //check if hash matches with onchain hash
        require(pubHashLookUp[pubKey] == input[0],"public hash stored does not match");

        bool check = verifyProof(a, b, c, input);

        if(check){
            // user is verified so update the mapping of identity
            emailVerified[Strings.toString(commitment)] = input[3];

            //add member to the group since verification is complete
            _addMember(input[3], commitment);
            
        }
    }

}