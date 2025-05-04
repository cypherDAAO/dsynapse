// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.28;

import {Script, console2} from "forge-std/Script.sol";
import { LLMIndexer} from "sc-src/LLMIndexer.sol";
import { CIDStorage } from "sc-src/CIDStorage.sol";

contract LLMIndexerScript is Script {
    LLMIndexer public llmIdxr;
    string[] public llmsURI;
    address public owner;

    function setUp() public {
        llmsURI = vm.envString("llms", '\n');
        owner = vm.envAddress("ACC0");
    }

    // run is the entry point
    function run() public {
        uint256 deployerPrivateKey = vm.envUint("PK0");
        // startBroadcast and stopBraodcast will let us execute transactions anything between them
        vm.startBroadcast(deployerPrivateKey);
        // here we just need to deploy a new contract
        llmIdxr = new LLMIndexer(owner, owner);
        console2.log("The LLMs Indexer contract address is: ", address(llmIdxr));

        // Define a LLM name
        bytes32 llm_name = bytes32("LLM01");

        // Define LLMURI splited into two bytes32 CIDs
        bytes32 CID1;
        bytes32 CID2;

        (CID1, CID2) = CIDStorage.stringToBytes32Pair(llmsURI[0]);

        // Add LLM
        console2.log("-----Adding LLM-----");
        console2.log("LLM Name is:");
        console2.logBytes32(llm_name);
        console2.log("Bytes32 first:");
        console2.logBytes32(CID1);
        console2.log("Bytes32 second:");
        console2.logBytes32(CID2);
        console2.log(CIDStorage.bytes32PairToString(CID1, CID2));
        llmIdxr.addLLM(llm_name, LLMIndexer.PackedCID(CID1, CID2));

        // retrive LLM
        console2.log("-----retriving LLM-----");
        LLMIndexer.PackedCID memory llm1 = llmIdxr.getLLM(llm_name);
        console2.log("Bytes32 first:");
        console2.logBytes32(llm1.CID1);
        console2.log("Bytes32 second:");
        console2.logBytes32(llm1.CID2);

        // reconstruct the CID and verify
        console2.log(CIDStorage.bytes32PairToString(llm1.CID1, llm1.CID2));

        vm.stopBroadcast();
    }
}
