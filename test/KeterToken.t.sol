// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import {KeterToken} from "../src/KeterToken.sol";
import {Registry} from "../src/Registry.sol";
import {UltraVerifier} from "../src/UltraVerifier.sol";

contract KeterTokenTest is Test {
    // Events (redeclared for expectEmit — Solidity 0.8.20 doesn't support ContractName.EventName)
    event Transfer(address indexed from, address indexed to, uint256 value);
    event IssuedByPartition(bytes32 indexed partition, address indexed to, uint256 value, bytes data);
    event ControllerTransfer(address controller, address indexed from, address indexed to, uint256 value, bytes data, bytes operatorData);

    KeterToken public token;
    Registry public registry;
    UltraVerifier public verifier;

    address public issuer;
    address public controller;
    address public investor1;
    address public investor2;
    address public random;

    bytes32 constant DEFAULT_PARTITION = bytes32(0);
    bytes32 FOUNDERS;
    bytes32 INVESTORS;
    bytes32 LOCKED;

    // ═══════════════════════════════════════════════════════════════
    //  SETUP
    // ═══════════════════════════════════════════════════════════════

    function setUp() public {
        issuer = address(this);
        controller = makeAddr("controller");
        investor1 = makeAddr("investor1");
        investor2 = makeAddr("investor2");
        random = makeAddr("random");

        FOUNDERS = bytes32("founders");
        INVESTORS = bytes32("investors");
        LOCKED = bytes32("locked");

        // Deploy
        registry = new Registry();
        verifier = new UltraVerifier();

        address[] memory controllers = new address[](1);
        controllers[0] = controller;

        bytes32[] memory defaultParts = new bytes32[](3);
        defaultParts[0] = DEFAULT_PARTITION;
        defaultParts[1] = FOUNDERS;
        defaultParts[2] = INVESTORS;

        token = new KeterToken(
            "Keter Security Token",
            "KETER",
            address(registry),
            address(verifier),
            controllers,
            defaultParts
        );
    }

    // ═══════════════════════════════════════════════════════════════
    //  DEPLOYMENT
    // ═══════════════════════════════════════════════════════════════

    function test_Deployment_Metadata() public view {
        assertEq(token.name(), "Keter Security Token");
        assertEq(token.symbol(), "KETER");
        assertEq(token.decimals(), 18);
        assertEq(token.totalSupply(), 0);
    }

    function test_Deployment_Issuer() public view {
        assertTrue(token.isIssuer(issuer));
        assertFalse(token.isIssuer(random));
    }

    function test_Deployment_Controller() public view {
        assertTrue(token.isController(controller));
        assertFalse(token.isController(random));
    }

    function test_Deployment_DefaultPartitions() public view {
        bytes32[] memory parts = token.getDefaultPartitions();
        assertEq(parts.length, 3);
        assertEq(parts[0], DEFAULT_PARTITION);
        assertEq(parts[1], FOUNDERS);
        assertEq(parts[2], INVESTORS);
    }

    function test_Deployment_Flags() public view {
        assertTrue(token.isIssuable_());
        assertTrue(token.isControllable_());
        assertFalse(token.paused());
    }

    // ═══════════════════════════════════════════════════════════════
    //  ERC-1594: ISSUANCE
    // ═══════════════════════════════════════════════════════════════

    function test_Issue_DefaultPartition() public {
        token.issue(investor1, 1000, "");

        assertEq(token.balanceOf(investor1), 1000);
        assertEq(token.totalSupply(), 1000);
        assertEq(token.balanceOfByPartition(DEFAULT_PARTITION, investor1), 1000);
    }

    function test_IssueByPartition() public {
        token.issueByPartition(FOUNDERS, investor1, 5000, "");

        assertEq(token.balanceOf(investor1), 5000);
        assertEq(token.balanceOfByPartition(FOUNDERS, investor1), 5000);
        assertEq(token.balanceOfByPartition(DEFAULT_PARTITION, investor1), 0);
        assertEq(token.totalSupplyByPartition(FOUNDERS), 5000);
    }

    function test_Issue_TracksPartitions() public {
        token.issueByPartition(FOUNDERS, investor1, 1000, "");
        token.issueByPartition(INVESTORS, investor1, 2000, "");

        bytes32[] memory parts = token.partitionsOf(investor1);
        assertEq(parts.length, 2);
    }

    function test_Issue_AggregatesSupply() public {
        token.issueByPartition(FOUNDERS, investor1, 1000, "");
        token.issueByPartition(INVESTORS, investor2, 3000, "");
        token.issue(investor1, 500, "");

        assertEq(token.totalSupply(), 4500);
    }

    function test_RevertWhen_NonIssuerIssues() public {
        vm.prank(investor1);
        vm.expectRevert("KT: not issuer");
        token.issue(investor1, 1000, "");
    }

    function test_RevertWhen_IssueAfterFinalization() public {
        token.finalizeIssuance();
        assertFalse(token.isIssuable_());

        vm.expectRevert("KT: issuance closed");
        token.issue(investor1, 1000, "");
    }

    function test_Issue_EmitsEvents() public {
        vm.expectEmit(true, true, false, true);
        emit IssuedByPartition(DEFAULT_PARTITION, investor1, 1000, "");

        vm.expectEmit(true, true, false, true);
        emit Transfer(address(0), investor1, 1000);

        token.issue(investor1, 1000, "");
    }

    // ═══════════════════════════════════════════════════════════════
    //  ERC-1410: PARTITION TRANSFERS
    // ═══════════════════════════════════════════════════════════════

    function test_TransferByPartition() public {
        token.issueByPartition(FOUNDERS, investor1, 5000, "");

        vm.prank(investor1);
        token.transferByPartition(FOUNDERS, investor2, 2000, "");

        assertEq(token.balanceOfByPartition(FOUNDERS, investor1), 3000);
        assertEq(token.balanceOfByPartition(FOUNDERS, investor2), 2000);
        assertEq(token.balanceOf(investor1), 3000);
        assertEq(token.balanceOf(investor2), 2000);
    }

    function test_RevertWhen_InsufficientPartitionBalance() public {
        token.issueByPartition(FOUNDERS, investor1, 5000, "");

        vm.prank(investor1);
        vm.expectRevert("KT: insufficient partition balance");
        token.transferByPartition(FOUNDERS, investor2, 6000, "");
    }

    function test_TransferByPartition_DoesNotAffectOther() public {
        token.issueByPartition(FOUNDERS, investor1, 5000, "");
        token.issueByPartition(INVESTORS, investor1, 3000, "");

        vm.prank(investor1);
        token.transferByPartition(FOUNDERS, investor2, 5000, "");

        assertEq(token.balanceOfByPartition(INVESTORS, investor1), 3000);
        assertEq(token.balanceOfByPartition(INVESTORS, investor2), 0);
    }

    function test_TransferByPartition_CleansEmptyPartition() public {
        token.issueByPartition(FOUNDERS, investor1, 5000, "");
        token.issueByPartition(INVESTORS, investor1, 3000, "");

        vm.prank(investor1);
        token.transferByPartition(FOUNDERS, investor2, 5000, "");

        bytes32[] memory parts = token.partitionsOf(investor1);
        assertEq(parts.length, 1);
        assertEq(parts[0], INVESTORS);
    }

    // ═══════════════════════════════════════════════════════════════
    //  ERC-20 COMPATIBILITY
    // ═══════════════════════════════════════════════════════════════

    function test_BalanceOf_SumsAllPartitions() public {
        token.issueByPartition(DEFAULT_PARTITION, investor1, 1000, "");
        token.issueByPartition(FOUNDERS, investor1, 2000, "");

        assertEq(token.balanceOf(investor1), 3000);
    }

    function test_Transfer_DrainsDefaultPartitionsInOrder() public {
        token.issueByPartition(DEFAULT_PARTITION, investor1, 100, "");
        token.issueByPartition(FOUNDERS, investor1, 200, "");
        token.issueByPartition(INVESTORS, investor1, 300, "");

        // Transfer 350: should drain DEFAULT(100) + FOUNDERS(200) + INVESTORS(50)
        vm.prank(investor1);
        token.transfer(investor2, 350);

        assertEq(token.balanceOfByPartition(DEFAULT_PARTITION, investor1), 0);
        assertEq(token.balanceOfByPartition(FOUNDERS, investor1), 0);
        assertEq(token.balanceOfByPartition(INVESTORS, investor1), 250);
        assertEq(token.balanceOf(investor2), 350);
    }

    function test_TransferFrom_WithApproval() public {
        token.issue(investor1, 1000, "");

        vm.prank(investor1);
        token.approve(investor2, 500);
        assertEq(token.allowance(investor1, investor2), 500);

        vm.prank(investor2);
        token.transferFrom(investor1, random, 500);
        assertEq(token.balanceOf(random), 500);
    }

    function test_RevertWhen_TransferExceedsBalance() public {
        token.issue(investor1, 100, "");

        vm.prank(investor1);
        vm.expectRevert("KT: insufficient balance across default partitions");
        token.transfer(investor2, 200);
    }

    // ═══════════════════════════════════════════════════════════════
    //  ERC-1594: REDEMPTION
    // ═══════════════════════════════════════════════════════════════

    function test_RedeemByPartition() public {
        token.issueByPartition(INVESTORS, investor1, 5000, "");

        vm.prank(investor1);
        token.redeemByPartition(INVESTORS, 2000, "");

        assertEq(token.balanceOfByPartition(INVESTORS, investor1), 3000);
        assertEq(token.totalSupply(), 3000);
        assertEq(token.totalSupplyByPartition(INVESTORS), 3000);
    }

    function test_Redeem_FromDefaultPartitions() public {
        token.issueByPartition(DEFAULT_PARTITION, investor1, 1000, "");
        token.issueByPartition(FOUNDERS, investor1, 2000, "");

        vm.prank(investor1);
        token.redeem(1500, "");

        // Should drain DEFAULT(1000) then FOUNDERS(500)
        assertEq(token.balanceOfByPartition(DEFAULT_PARTITION, investor1), 0);
        assertEq(token.balanceOfByPartition(FOUNDERS, investor1), 1500);
        assertEq(token.totalSupply(), 1500);
    }

    function test_RevertWhen_RedeemExceedsBalance() public {
        token.issueByPartition(INVESTORS, investor1, 100, "");

        vm.prank(investor1);
        vm.expectRevert("KT: insufficient partition balance");
        token.redeemByPartition(INVESTORS, 200, "");
    }

    // ═══════════════════════════════════════════════════════════════
    //  ERC-1643: DOCUMENTS
    // ═══════════════════════════════════════════════════════════════

    function test_SetAndGetDocument() public {
        bytes32 docName = bytes32("prospectus");
        string memory uri = "https://keter.finance/prospectus.pdf";
        bytes32 docHash = keccak256("prospectus-v1");

        token.setDocument(docName, uri, docHash);

        (string memory retUri, bytes32 retHash, uint256 ts) = token.getDocument(docName);
        assertEq(retUri, uri);
        assertEq(retHash, docHash);
        assertGt(ts, 0);
    }

    function test_GetAllDocuments() public {
        token.setDocument(bytes32("prospectus"), "uri1", keccak256("a"));
        token.setDocument(bytes32("terms"), "uri2", keccak256("b"));

        bytes32[] memory docs = token.getAllDocuments();
        assertEq(docs.length, 2);
    }

    function test_UpdateDocument_NoDuplicate() public {
        bytes32 docName = bytes32("prospectus");

        token.setDocument(docName, "uri1", keccak256("v1"));
        token.setDocument(docName, "uri2", keccak256("v2"));

        bytes32[] memory docs = token.getAllDocuments();
        assertEq(docs.length, 1);

        (string memory uri,,) = token.getDocument(docName);
        assertEq(uri, "uri2");
    }

    function test_RemoveDocument() public {
        bytes32 docName = bytes32("prospectus");
        token.setDocument(docName, "uri", keccak256("v1"));
        token.removeDocument(docName);

        bytes32[] memory docs = token.getAllDocuments();
        assertEq(docs.length, 0);
    }

    function test_RevertWhen_NonIssuerSetsDocument() public {
        vm.prank(investor1);
        vm.expectRevert("KT: not issuer");
        token.setDocument(bytes32("x"), "uri", keccak256("x"));
    }

    // ═══════════════════════════════════════════════════════════════
    //  ERC-1644: CONTROLLER OPERATIONS
    // ═══════════════════════════════════════════════════════════════

    function test_ControllerTransfer() public {
        token.issueByPartition(INVESTORS, investor1, 10000, "");

        vm.prank(controller);
        token.controllerTransfer(investor1, investor2, 3000, "", "");

        assertEq(token.balanceOf(investor1), 7000);
        assertEq(token.balanceOf(investor2), 3000);
    }

    function test_ControllerTransferByPartition() public {
        token.issueByPartition(INVESTORS, investor1, 10000, "");

        vm.prank(controller);
        token.controllerTransferByPartition(INVESTORS, investor1, investor2, 5000, "", "");

        assertEq(token.balanceOfByPartition(INVESTORS, investor1), 5000);
        assertEq(token.balanceOfByPartition(INVESTORS, investor2), 5000);
    }

    function test_IssuerCanForceTransfer() public {
        token.issueByPartition(INVESTORS, investor1, 10000, "");

        token.controllerTransfer(investor1, investor2, 1000, "", "");
        assertEq(token.balanceOf(investor2), 1000);
    }

    function test_ControllerRedeem() public {
        token.issueByPartition(INVESTORS, investor1, 10000, "");

        vm.prank(controller);
        token.controllerRedeem(investor1, 4000, "", "");

        assertEq(token.balanceOf(investor1), 6000);
        assertEq(token.totalSupply(), 6000);
    }

    function test_RevertWhen_RandomForceTransfers() public {
        token.issueByPartition(INVESTORS, investor1, 10000, "");

        vm.prank(random);
        vm.expectRevert("KT: not controller");
        token.controllerTransfer(investor1, investor2, 1000, "", "");
    }

    function test_RevertWhen_ForceTransferAfterRenounce() public {
        token.issueByPartition(INVESTORS, investor1, 10000, "");

        token.renounceControl();
        assertFalse(token.isControllable_());

        vm.prank(controller);
        vm.expectRevert("KT: not controllable");
        token.controllerTransfer(investor1, investor2, 1000, "", "");
    }

    function test_ControllerTransfer_EmitsEvent() public {
        token.issueByPartition(INVESTORS, investor1, 10000, "");

        vm.expectEmit(true, true, true, true);
        emit ControllerTransfer(controller, investor1, investor2, 3000, "", "");

        vm.prank(controller);
        token.controllerTransfer(investor1, investor2, 3000, "", "");
    }

    // ═══════════════════════════════════════════════════════════════
    //  OPERATORS
    // ═══════════════════════════════════════════════════════════════

    function test_AuthorizeOperatorByPartition() public {
        token.issueByPartition(INVESTORS, investor1, 5000, "");

        vm.prank(investor1);
        token.authorizeOperatorByPartition(INVESTORS, investor2);

        assertTrue(token.isOperatorForPartition(INVESTORS, investor2, investor1));
    }

    function test_OperatorTransferByPartition() public {
        token.issueByPartition(INVESTORS, investor1, 5000, "");

        vm.prank(investor1);
        token.authorizeOperatorByPartition(INVESTORS, investor2);

        vm.prank(investor2);
        token.operatorTransferByPartition(INVESTORS, investor1, random, 1000, "", "");

        assertEq(token.balanceOfByPartition(INVESTORS, random), 1000);
    }

    function test_RevertWhen_UnauthorizedOperator() public {
        token.issueByPartition(INVESTORS, investor1, 5000, "");

        vm.prank(random);
        vm.expectRevert("KT: not authorized operator");
        token.operatorTransferByPartition(INVESTORS, investor1, investor2, 1000, "", "");
    }

    function test_RevokeOperator() public {
        vm.prank(investor1);
        token.authorizeOperatorByPartition(INVESTORS, investor2);

        vm.prank(investor1);
        token.revokeOperatorByPartition(INVESTORS, investor2);

        assertFalse(token.isOperatorForPartition(INVESTORS, investor2, investor1));
    }

    function test_GlobalOperator() public {
        token.issueByPartition(INVESTORS, investor1, 5000, "");

        vm.prank(investor1);
        token.authorizeOperator(investor2);

        // Global operator should work on any partition
        assertTrue(token.isOperatorForPartition(INVESTORS, investor2, investor1));
        assertTrue(token.isOperatorForPartition(FOUNDERS, investor2, investor1));
    }

    // ═══════════════════════════════════════════════════════════════
    //  canTransfer (ERC-1594)
    // ═══════════════════════════════════════════════════════════════

    function test_CanTransfer_Success() public {
        token.issue(investor1, 1000, "");

        vm.prank(investor1);
        (bytes1 status,) = token.canTransfer(investor2, 500, "");
        assertEq(status, bytes1(0x51));
    }

    function test_CanTransfer_InsufficientBalance() public {
        vm.prank(investor1);
        (bytes1 status,) = token.canTransfer(investor2, 500, "");
        assertEq(status, bytes1(0x52));
    }

    function test_CanTransfer_InvalidReceiver() public {
        token.issue(investor1, 1000, "");

        vm.prank(investor1);
        (bytes1 status,) = token.canTransfer(address(0), 500, "");
        assertEq(status, bytes1(0x57));
    }

    function test_CanTransfer_Halted() public {
        token.pause();

        vm.prank(investor1);
        (bytes1 status,) = token.canTransfer(investor2, 500, "");
        assertEq(status, bytes1(0x54));
    }

    // ═══════════════════════════════════════════════════════════════
    //  PAUSE / EMERGENCY
    // ═══════════════════════════════════════════════════════════════

    function test_Pause_BlocksTransfers() public {
        token.issue(investor1, 1000, "");
        token.pause();

        vm.prank(investor1);
        vm.expectRevert("KT: paused");
        token.transfer(investor2, 100);
    }

    function test_Unpause_AllowsTransfers() public {
        token.issue(investor1, 1000, "");
        token.pause();
        token.unpause();

        vm.prank(investor1);
        token.transfer(investor2, 100);
        assertEq(token.balanceOf(investor2), 100);
    }

    function test_ControllerCanPause() public {
        vm.prank(controller);
        token.pause();
        assertTrue(token.paused());
    }

    function test_RevertWhen_RandomPauses() public {
        vm.prank(random);
        vm.expectRevert("KT: not controller");
        token.pause();
    }

    // ═══════════════════════════════════════════════════════════════
    //  ADMIN
    // ═══════════════════════════════════════════════════════════════

    function test_AddController() public {
        token.addController(random);
        assertTrue(token.isController(random));
    }

    function test_RemoveController() public {
        token.addController(random);
        token.removeController(random);
        assertFalse(token.isController(random));
    }

    function test_SetDefaultPartitions() public {
        bytes32[] memory newParts = new bytes32[](2);
        newParts[0] = LOCKED;
        newParts[1] = INVESTORS;

        token.setDefaultPartitions(newParts);

        bytes32[] memory parts = token.getDefaultPartitions();
        assertEq(parts.length, 2);
        assertEq(parts[0], LOCKED);
    }

    function test_RevertWhen_RandomAddsController() public {
        vm.prank(random);
        vm.expectRevert("KT: not issuer");
        token.addController(random);
    }

    // ═══════════════════════════════════════════════════════════════
    //  COMPLEX LIFECYCLE
    // ═══════════════════════════════════════════════════════════════

    function test_FullLifecycle() public {
        // 1. Issue to founders and investors
        token.issueByPartition(FOUNDERS, investor1, 10000, "");
        token.issueByPartition(INVESTORS, investor2, 5000, "");
        assertEq(token.totalSupply(), 15000);

        // 2. Founders transfer within partition
        vm.prank(investor1);
        token.transferByPartition(FOUNDERS, investor2, 3000, "");
        assertEq(token.balanceOfByPartition(FOUNDERS, investor2), 3000);

        // 3. Investor2 now has 2 partitions
        bytes32[] memory parts = token.partitionsOf(investor2);
        assertEq(parts.length, 2);

        // 4. Partial redemption
        vm.prank(investor2);
        token.redeemByPartition(INVESTORS, 2000, "");
        assertEq(token.totalSupply(), 13000);

        // 5. Controller force-transfer
        vm.prank(controller);
        token.controllerTransferByPartition(FOUNDERS, investor1, investor2, 7000, "", "court order");

        // 6. Finalize issuance
        token.finalizeIssuance();

        // 7. Final state
        assertEq(token.balanceOf(investor1), 0);
        assertEq(token.balanceOf(investor2), 13000);
        assertFalse(token.isIssuable_());
    }

    function test_MultiPartitionERC20Drain() public {
        token.issueByPartition(DEFAULT_PARTITION, investor1, 100, "");
        token.issueByPartition(FOUNDERS, investor1, 200, "");
        token.issueByPartition(INVESTORS, investor1, 300, "");

        vm.prank(investor1);
        token.transfer(investor2, 350);

        assertEq(token.balanceOfByPartition(DEFAULT_PARTITION, investor1), 0);
        assertEq(token.balanceOfByPartition(FOUNDERS, investor1), 0);
        assertEq(token.balanceOfByPartition(INVESTORS, investor1), 250);
        assertEq(token.balanceOf(investor2), 350);
    }
}
