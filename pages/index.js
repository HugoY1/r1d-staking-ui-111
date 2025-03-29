'use client'
import { useState } from "react";
import { ethers } from "ethers";

const CONTRACT_ADDRESS = "0xb0E501293796a047f720d9ac5D8E4932BEFF3512";
const R1D_ADDRESS = "0x742f3563408f07fFcD4C360241244fcaD5DD3E47";

const ABI = [
  "function stake(uint256 amount) external",
  "function unstake(uint256 amount) external",
  "function totalStaked() view returns (uint256)",
  "function receiptToken() view returns (address)"
];

const ERC20_ABI = [
  "function approve(address spender, uint256 amount) external returns (bool)",
  "function allowance(address owner, address spender) view returns (uint256)"
];

export default function Home() {
  const [provider, setProvider] = useState();
  const [signer, setSigner] = useState();
  const [contract, setContract] = useState();
  const [r1dToken, setR1dToken] = useState();
  const [receiptToken, setReceiptToken] = useState('');
  const [amount, setAmount] = useState('');
  const [approved, setApproved] = useState(false);
  const [staked, setStaked] = useState('');

  const connectWallet = async () => {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);
    const receipt = await contract.receiptToken();
    const r1d = new ethers.Contract(R1D_ADDRESS, ERC20_ABI, signer);
    const owner = await signer.getAddress();
    const allowance = await r1d.allowance(owner, CONTRACT_ADDRESS);
    const total = await contract.totalStaked();

    setProvider(provider);
    setSigner(signer);
    setContract(contract);
    setReceiptToken(receipt);
    setR1dToken(r1d);
    setApproved(allowance > 0);
    setStaked(ethers.formatUnits(total, 18));
  };

  const approve = async () => {
    const tx = await r1dToken.approve(CONTRACT_ADDRESS, ethers.parseUnits("1000000", 18));
    await tx.wait();
    alert("授权成功");
    setApproved(true);
  };

  const stake = async () => {
    const tx = await contract.stake(ethers.parseUnits(amount, 18));
    await tx.wait();
    alert("质押成功");
  };

  const unstake = async () => {
    const tx = await contract.unstake(ethers.parseUnits(amount, 18));
    await tx.wait();
    alert("赎回成功");
  };

  return (
    <main style={{ padding: 20, maxWidth: 480, margin: 'auto', fontFamily: 'sans-serif' }}>
      <h1>R1D 流动性质押</h1>
      {!signer ? (
        <button onClick={connectWallet}>连接钱包</button>
      ) : (
        <>
          <p>当前总质押：{staked} R1D</p>
          <p>sR1D 地址：{receiptToken}</p>
          <input
            type="text"
            placeholder="输入数量（例如 100）"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            style={{ padding: 8, width: '100%' }}
          />
          {!approved ? (
            <button onClick={approve}>授权 R1D</button>
          ) : (
            <>
              <button onClick={stake}>质押</button>
              <button
