// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.28;

library CIDStorage {
    function bytes32PairToString(bytes32 part1, bytes32 part2) public pure returns (string memory) {
        // Concatenate the two bytes32 variables
        bytes memory concatenatedBytes = abi.encodePacked(part1, part2);

        // Truncate the concatenated bytes to 59 bytes
        bytes memory truncatedBytes = new bytes(59);
        for (uint i = 0; i < 59; i++) {
            truncatedBytes[i] = concatenatedBytes[i];
        }

        // Convert the truncated bytes to a string
        string memory str = string(truncatedBytes);

        return str;
    }

    function stringToBytes32Pair(string memory source) public pure returns (bytes32 part1, bytes32 part2) {
        bytes memory sourceBytes = bytes(source);
        require(sourceBytes.length == 59, "URI string must equal to 59 bytes");

        assembly {
            // Load the first 32 bytes of the string data
            part1 := mload(add(sourceBytes, 32))
            // Load the second 32 bytes of the string data
            part2 := mload(add(sourceBytes, 64))
        }
    }
}
