// SPDX-License-Identifier: MPL-2.0
pragma solidity =0.8.19;

import {AccessControlUpgradeable} from "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import {UUPSUpgradeable} from "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import {ERC721Upgradeable} from "@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol";
import {IERC721Upgradeable} from "@openzeppelin/contracts-upgradeable/token/ERC721/IERC721Upgradeable.sol";
import {CountersUpgradeable} from "@openzeppelin/contracts-upgradeable/utils/CountersUpgradeable.sol";
import {IAAC} from "./IAAC.sol";

contract AAC is
	AccessControlUpgradeable,
	UUPSUpgradeable,
	ERC721Upgradeable,
	IAAC
{
	bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
	using CountersUpgradeable for CountersUpgradeable.Counter;
	CountersUpgradeable.Counter private _tokenIds;
	uint256 private _tokenIdsReverse;
	mapping(uint256 => MetaData) private _tokenMetadata;

	function initialize() public initializer {
		__AccessControl_init();
		__UUPSUpgradeable_init();
		__ERC721_init("Anti-AGI Cryptographers", "AAC");
		_grantRole(DEFAULT_ADMIN_ROLE, _msgSender());
		_grantRole(MINTER_ROLE, _msgSender());
		_tokenIdsReverse = type(uint256).max;
	}

	function supportsInterface(
		bytes4 _interfaceId
	)
		public
		view
		virtual
		override(AccessControlUpgradeable, ERC721Upgradeable)
		returns (bool)
	{
		return
			_interfaceId == type(IAAC).interfaceId ||
			ERC721Upgradeable.supportsInterface(_interfaceId) ||
			AccessControlUpgradeable.supportsInterface(_interfaceId);
	}

	function mint(
		address _to,
		string memory _creatorName,
		string memory _problemUrl
	) external onlyRole(MINTER_ROLE) {
		uint256 tokenId = _tokenIds.current();
		_tokenIds.increment();
		_mint(_to, tokenId);
		_tokenMetadata[tokenId] = MetaData(_creatorName, "", _problemUrl);
	}

	function mintReverse(
		address _to,
		string memory _creatorName,
		string memory _problemUrl
	) external onlyRole(MINTER_ROLE) {
		uint256 tokenId = _tokenIdsReverse;
		_tokenIdsReverse--;
		_mint(_to, tokenId);
		_tokenMetadata[tokenId] = MetaData(_creatorName, "", _problemUrl);
	}

	function grantMinterRole(
		address _minter
	) external onlyRole(DEFAULT_ADMIN_ROLE) {
		_grantRole(MINTER_ROLE, _minter);
	}

	function revokeMinterRole(
		address _minter
	) external onlyRole(DEFAULT_ADMIN_ROLE) {
		_revokeRole(MINTER_ROLE, _minter);
	}

	function updateFree(uint256 _tokenId, string memory _free) external {
		require(bytes(_free).length > 0, "free must not be empty");
		address owner = ownerOf(_tokenId);
		require(owner == _msgSender(), "caller is not owner");
		_tokenMetadata[_tokenId].free = _free;
	}

	function updateMetaData(
		uint256 _tokenId,
		string memory _creatorName,
		string memory _problemUrl
	) external onlyRole(MINTER_ROLE) {
		_requireMinted(_tokenId);
		// TODO token idのチェック
		require(
			bytes(_creatorName).length > 0,
			"creatorName must not be empty"
		);
		require(bytes(_problemUrl).length > 0, "_problemUrl must not be empty");
		_tokenMetadata[_tokenId].creatorName = _creatorName;
		_tokenMetadata[_tokenId].problemUrl = _problemUrl;
	}

	function getMetaData(
		uint256 _tokenId
	) external view returns (MetaData memory) {
		MetaData memory metaData = _tokenMetadata[_tokenId];
		return metaData;
	}

	function _authorizeUpgrade(
		address
	) internal override onlyRole(DEFAULT_ADMIN_ROLE) {}
}
