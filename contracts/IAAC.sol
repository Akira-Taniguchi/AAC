// SPDX-License-Identifier: MPL-2.0
pragma solidity =0.8.18;

interface IAAC {
	struct MetaData {
		string creatorName;
		string free;
		string problemUrl;
	}

	function mint(
		address _to,
		string memory _creatorName,
		string memory _problemUrl
	) external;

	function mintReverse(
		address _to,
		string memory _creatorName,
		string memory _problemUrl
	) external;

	function grantMinterRole(address _minter) external;

	function revokeMinterRole(address _minter) external;

	function updateFree(uint256 _tokenId, string memory _free) external;

	function updateMetaData(
		uint256 _tokenId,
		string memory _creatorName,
		string memory _problemUrl
	) external;

	function getMetaData(
		uint256 _tokenId
	) external view returns (MetaData memory);
}
