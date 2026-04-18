// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract CampusToken {
    string public name = "Campus Coin";
    string public symbol = "CC";
    address public admin;

    // Maps a student's address to their coin balance
    mapping(address => uint256) public balances;
    // Maps an address to see if they are an authorized organizer
    mapping(address => bool) public isOrganizer;

    // These events create a permanent, transparent ledger history
    event RewardIssued(address indexed student, uint256 amount, string reason);
    event TokensRedeemed(address indexed student, uint256 amount, string perk);
    event OrganizerAdded(address indexed organizer);

    // Security: Only the admin can do certain things
    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can perform this");
        _;
    }

    // Security: Only organizers can give out points
    modifier onlyOrganizer() {
        require(isOrganizer[msg.sender] || msg.sender == admin, "Only organizers can reward");
        _;
    }

    // The person who deploys the contract becomes the admin
    constructor() {
        admin = msg.sender;
    }

    function addOrganizer(address _organizer) public onlyAdmin {
        isOrganizer[_organizer] = true;
        emit OrganizerAdded(_organizer);
    }

    function rewardStudent(address _student, uint256 _amount, string memory _reason) public onlyOrganizer {
        balances[_student] += _amount;
        emit RewardIssued(_student, _amount, _reason);
    }

    function redeemTokens(uint256 _amount, string memory _perk) public {
        require(balances[msg.sender] >= _amount, "Insufficient Campus Coins");
        balances[msg.sender] -= _amount;
        emit TokensRedeemed(msg.sender, _amount, _perk);
    }
}