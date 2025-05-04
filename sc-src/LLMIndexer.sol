// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/access/AccessControl.sol";

contract LLMIndexer is AccessControl {
    // Moderator adds/updates and removes DAPPs
    bytes32 public constant MODERATOR_ROLE = keccak256("MODERATOR_ROLE");

    struct PackedCID {
        bytes32 CID1;
        bytes32 CID2;
    }

    mapping (bytes32 => PackedCID) private llms;

    bytes32[] public llm_names;

    constructor(
        address defaultAdmin,
        address moderator
    ){
        _grantRole(DEFAULT_ADMIN_ROLE, defaultAdmin);
        _grantRole(MODERATOR_ROLE, moderator);
    }

    function addLLM(bytes32 llm_name, PackedCID calldata cid)
    external onlyRole(MODERATOR_ROLE) {
        //if the struct does not exists trace it on the array
        if (llms[llm_name].CID1 != 0 && llms[llm_name].CID2 != 0) {
            llm_names.push(llm_name);
        }

        llms[llm_name] = PackedCID(cid.CID1, cid.CID2);
    }

    //@Notice: consider calling getLLMIndex internal and pop llms and llm_names
    //@Notice: Yet requiring index might give extra verification
    function removeLLM(uint index, bytes32 llm_name)
    external onlyRole(MODERATOR_ROLE) {
        require(index < llm_names.length, "llm index out of bounds");
        require(llm_names[index] == llm_name);
        llm_names[index] = llm_names[llm_names.length - 1];
        llm_names.pop();
        delete llms[llm_name];
    }

    function getLLM(bytes32 llm_name) external view returns (PackedCID memory){
        return llms[llm_name];
    }

    function getLLMIndex(bytes32 llm_name) external view returns (uint256 i) {
       require(llmExists(llm_name));
       for(i; i <= llm_names.length; i++){
           if(llm_names[i] == llm_name){
               return i;
           }
       }
    }

    function listLLMNames() external view returns (bytes32[] memory) {
        return llm_names;
    }

    function llmExists(bytes32 llm_name) public view returns (bool) {
       for(uint i; i <= llm_names.length; i++){
           if(llm_names[i] == llm_name){
               return true;
           }
       }
       return false;
    }

}
