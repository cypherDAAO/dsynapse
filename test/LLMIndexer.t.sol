// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.28;

import { Test, console2 } from "forge-std/Test.sol";
import { LLMIndexer } from "sc-src/LLMIndexer.sol";
import { CIDStorage } from "sc-src/CIDStorage.sol";

contract LLMIndexerTest is Test {
    LLMIndexer public llmIdxr;
    string[] public llmsURI;
    address public owner;

    function setUp() public {
        llmIdxr = new LLMIndexer(address(this), address(this));
        llmsURI = vm.envString("llms", '\n');
        owner = vm.envAddress("ACC0");
    }

    // Test adding a llm that doesn't exist
    function testAddLLM() public {
        bytes32 llm_name = bytes32("LLM01");
        bytes32 CID1;
        bytes32 CID2;

        (CID1, CID2) = CIDStorage.stringToBytes32Pair(llmsURI[0]);

        // Add LLM
        console2.log("LLM Name is:");
        console2.logBytes32(llm_name);
        console2.log("Bytes32 first:");
        console2.logBytes32(CID1);
        console2.log("Bytes32 second:");
        console2.logBytes32(CID2);
        console2.log(CIDStorage.bytes32PairToString(CID1, CID2));
        llmIdxr.addLLM(llm_name, LLMIndexer.PackedCID(CID1, CID2));

        // retrive LLM
        LLMIndexer.PackedCID memory llm1 = llmIdxr.getLLM(llm_name);
        assertEq(CID1, llm1.CID1);
        assertEq(CID2, llm1.CID2);

        // reconstruct the CID and verify
        string memory retrivedLLMURI = CIDStorage.bytes32PairToString(llm1.CID1, llm1.CID2);
        assertEq(llmsURI[0], retrivedLLMURI);
    }

//## ToDo ISSUE #2
//
//### Features testing
//
//- [x] test adding a llm and retrive it. (addLLM, getLLM)
//
//- [ ] test removing a llm that exists (verify llms and llm_names)
//- [ ] test llmExists (lower, upper, fuzz)
//- [ ] test removing a llm that doesn't exist
//- [ ] test getting that names (listLLMNames)
//- [ ] test getLLMIndex (lower, upper, fuzz)
//- [ ] check if llm name exists
//
//### Library testing
//
//- [ ] test adding longer CID
//- [ ] test adding shorter CID
//- [ ] test fuzz
//
//### Testing Roles Open Zeppelin Module
//
//- [ ] test roles for educational purposes.
//

}
