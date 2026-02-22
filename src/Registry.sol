// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract Registry {
    bytes32 public merkleRoot;
    address public admin;

    event RootUpdated(bytes32 oldRoot, bytes32 newRoot);

    constructor() {
        admin = msg.sender;
    }

    modifier onlyAdmin() {
        require(msg.sender == admin, "Not admin");
        _;
    }

    function setMerkleRoot(bytes32 _newRoot) external onlyAdmin {
        bytes32 oldRoot = merkleRoot;
        merkleRoot = _newRoot;
        emit RootUpdated(oldRoot, _newRoot);
    }

    function getMerkleRoot() external view returns (bytes32) {
        return merkleRoot;
    }
}
